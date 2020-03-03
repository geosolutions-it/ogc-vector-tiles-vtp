/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlParser from 'url';
import get from 'lodash/get';
import find from 'lodash/find';
import Layers from '@mapstore/utils/openlayers/Layers';
import {
    OL_VECTOR_FORMATS,
    applyStyle
} from '@mapstore/utils/openlayers/VectorTileUtils';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import SecurityUtils from '@mapstore/utils/SecurityUtils';
import GeoJSON from 'ol/format/GeoJSON';
import { deserializeStream } from 'flatgeobuf/lib/geojson';
import { optionsToVendorParams } from '@mapstore/utils/VendorParamsUtils';

const streamFlatGeobuf = async function({url, srs}, source) {
    const response = await fetch(url);
    for await (let feature of deserializeStream(response.body)) {
        const olFeature = source.getFormat().readFeature(feature);
        if (srs !== 'EPSG:4326') {
            olFeature.getGeometry().transform('EPSG:4326', srs);
        }
        source.addFeature(olFeature);
    }
};

const loaders = {
    'application/flatgeobuf': (options, source) => {
        source.clear();
        streamFlatGeobuf(options, source);
    }
};

const createLayer = (options) => {
    const { search = {}, srs, vectorStyle } = options;
    const { urls = [] } = search;
    const featuresData = find(urls,  ({ format }) => format === options.format);
    const Format = featuresData && featuresData.format && OL_VECTOR_FORMATS[featuresData.format];
    if (!Format) {
        return null;
    }
    const featuresUrl = featuresData.url;
    const splitLayerUrl = featuresUrl.split('?');
    const { query = {} } = splitLayerUrl[1]
        ? urlParser.parse('?' + splitLayerUrl[1], true)
        : {};
    const { CQL_FILTER } = optionsToVendorParams(options) || {};
    let queryParameters = {
        ...query,
        ...options.params,
        ...(CQL_FILTER && { 'filter': CQL_FILTER, 'filter-lang': 'cql-text' })
    };
    SecurityUtils.addAuthenticationParameter(splitLayerUrl[0], queryParameters, options.securityToken);
    const layerUrl = decodeURI(splitLayerUrl[0]);
    const queryParametersString = urlParser.format({ query: { ...queryParameters } });

    const url = layerUrl + queryParametersString;
    const loader = loaders[featuresData.format];

    const source = new VectorSource(loader
        ? {
            format: new GeoJSON(),
            loader: () => loader({url, srs}, source)
        }
        : {
            url,
            format: new GeoJSON()
        });

    const layer = new VectorLayer({
        msId: options.id,
        source: source,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        opacity: options.opacity
    });
    applyStyle(vectorStyle, layer, { projection: srs });
    return layer;
};
Layers.registerType('ogc-features', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (oldOptions.securityToken !== newOptions.securityToken
            || oldOptions.format !== newOptions.format
            || oldOptions._v_ !== newOptions._v_) {
            return createLayer(newOptions, map);
        }
        if (get(oldOptions, 'vectorStyle.body') !== get(newOptions, 'vectorStyle.body')
            || get(oldOptions, 'vectorStyle.url') !== get(newOptions, 'vectorStyle.url')
            || oldOptions.style !== newOptions.style) {
            applyStyle(newOptions.vectorStyle, layer, { projection: newOptions.srs });
        }
        if (oldOptions.srs !== newOptions.srs) {
            layer.getSource().forEachFeature(olFeature => {
                olFeature.getGeometry().transform(oldOptions.srs, newOptions.srs);
            });
        }
        return null;
    },
    render: () => {
        return null;
    }
});
