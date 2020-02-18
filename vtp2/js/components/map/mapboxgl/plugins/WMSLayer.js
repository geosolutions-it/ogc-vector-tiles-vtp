/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '@js/utils/mapboxgl/Layers';
import isNil from 'lodash/isNil';
import isArray from 'lodash/isArray';
import urlParser from 'url';
import SecurityUtils from '@mapstore/utils/SecurityUtils';
import { optionsToVendorParams } from '@mapstore/utils/VendorParamsUtils';

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

const wmsToMapboxGLOptions = (options) => {
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = {
        ...options.baseParams,
        SERVICE: 'WMS',
        REQUEST: 'GetMap',
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        WIDTH: options.tileSize || 256,
        HEIGHT: options.tileSize || 256,
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: 'EPSG:3857',
        CRS: 'EPSG:3857',
        TILED: !isNil(options.tiled) ? options.tiled : true,
        bbox: '{bbox-epsg-3857}',
        VERSION: options.version || "1.3.0",
        ...(options._v_ ? {_v_: options._v_} : {}),
        ...params

    };
    return SecurityUtils.addAuthenticationToSLD(result, options);
};

const createLayer = (options) => {

    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const query = wmsToMapboxGLOptions(options) || {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, query, options.securityToken));

    return new Promise((resolve) => {
        resolve({
            id: options.id,
            source: {
                type: 'raster',
                tiles: urls.map(url =>
                    decodeURIComponent(urlParser.format({ ...urlParser.parse(url), query }))
                ),
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
Layers.registerType('wms', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        return createLayer(newOptions, map);
    }
});
