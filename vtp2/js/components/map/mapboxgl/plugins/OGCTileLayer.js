/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '@js/utils/mapboxgl/Layers';
import urlParser from 'url';
import SecurityUtils from '@mapstore/utils/SecurityUtils';
import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';
import { optionsToVendorParams } from '@mapstore/utils/VendorParamsUtils';

import { getStyleLayers } from '@js/utils/mapboxgl/VectorTileUtils';

const createLayer = (options) => {

    const srs = 'EPSG:3857';
    const supportedTileMatrixSetName = ['WebMercatorQuad'];
    const tilingSchemeId = (options.tileMatrixSet.find((tM) => {
        const code = tM['ows:SupportedCRS'].split('/0/');
        return srs === `EPSG:${code[code.length - 1]}`;
    }) || {})['ows:Identifier'];

    if (supportedTileMatrixSetName.indexOf(tilingSchemeId) === -1) {
        return new Promise((resolve) => resolve(null));
    }

    const tileUrl = ((options.tileUrls || []).find(({ format }) => format === options.format) || {}).url;

    const splitLayerUrl = tileUrl.split('?');
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
    const styleId = options.style;
    const url = (layerUrl + queryParametersString)
        .replace(/\{tileMatrix\}/g, '{z}')
        .replace(/\{tileCol\}/g, '{x}')
        .replace(/\{tileRow\}/g, '{y}')
        .replace(/\{styleId\}/g, styleId)
        .replace(/\{tileMatrixSetId\}/g, tilingSchemeId);

    if (isVectorFormat(options.format)) {
        return getStyleLayers(options.vectorStyle, options.id, {
            ...options,
            tilingSchemeId
        })
            .then(({ layers = [] }) => {
                return {
                    id: options.id,
                    source: {
                        type: 'vector',
                        tiles: [ url ],
                        tileSize: 512
                    },
                    layers
                };
            });
    }

    return new Promise((resolve) => {
        resolve({
            id: options.id,
            source: {
                type: 'raster',
                tiles: [ url ],
                tileSize: 256
            },
            layers: [{
                id: options.id + '' + 0,
                type: 'raster',
                source: options.id,
                paint: {}
            }]
        });
    });
};

Layers.registerType('ogc-tile', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        return createLayer(newOptions, map);
    }
});
