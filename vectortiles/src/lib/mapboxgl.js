
/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mapboxgl = require('mapbox-gl');
require('mapbox-gl/dist/mapbox-gl.css');
const mapboxstyle = require('../../mapstyles/mapboxstyle');

const projectionEPSG = '900913';

mapboxgl.accessToken = 'undefined';

const mapboxglMap = (container, center, startZoom, getView, setView, label, url, spritesPath, sourceName) => {

    const sources = (tms) => [sourceName].reduce((sourcesObj, key) => (Object.assign({}, sourcesObj, {

        [key]: tms ? {
            /* TMS */
            "type": "vector",
            "scheme": "tms",
            "tiles": [
                `${url}/gwc/service/tms/1.0.0/${key}@EPSG%3A${projectionEPSG}@pbf/{z}/{x}/{y}.pbf`
            ]
        } : {
            /* WMTS */
            "type": "vector",
            "tiles": [
                `${url}/gwc/service/wmts?layer=${key}&style=&tilematrixset=EPSG:${projectionEPSG}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:${projectionEPSG}:{z}&TileCol={x}&TileRow={y}`
            ]
        }
    })), {});
    
    const map = new mapboxgl.Map({
        container: container,
        style: mapboxstyle({ src: sources(), spritesPath, sourceName }),
        center: [center.lat, center.lng],
        zoom: startZoom
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    if (getView) {
        map.on('moveend', () => {
            getView(map.getCenter(), map.getZoom() + 1, label);
        });
    
        setView(label, (center, zoom) => {
            map.setCenter(center);
            map.setZoom(zoom - 1);
        });
    }
};

module.exports = mapboxglMap;
