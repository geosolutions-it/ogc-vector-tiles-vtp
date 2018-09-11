/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

let center;
let zoom;
let loading = {};
let cnt = 0;
let start = true;

const labels = ['openlayers-mbs', 'mapboxgl', 'leaflet', 'tangram', 'openlayers', 'leaflet-mbgl'];

const setView = (type, update) => {
    setInterval(() => {
        if (loading[type]) {
            cnt++;
            if (update) update(center, zoom);

            if (cnt === labels.length - 1) {
                setTimeout(() => { start = true; }, 500);
                cnt = 0;
            }
            loading[type] = false;
        }
    }, 100);
};

const getView = (cntr, zm, type) => {
    if (start) {
        start = false;
        center = cntr;
        zoom = zm;
        loading = labels.reduce((newLoading, label) => {
            return Object.assign({}, newLoading, {
                [label]: !(label === type) 
            });
        }, {});
    }
};

export {
    labels,
    setView,
    getView
};