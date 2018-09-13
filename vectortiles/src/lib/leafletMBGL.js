/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const mapboxstyle = require('../../mapstyles/mapboxstyle');
const mapboxgl = require('mapbox-gl');
window.mapboxgl = mapboxgl;

require('mapbox-gl-leaflet');

const projectionEPSG = '900913';

const leafletMBGLMap = (target, center, startZoom, getView, setView, label, url, spritesPath, sourceName) => {

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
    
    const map = L.map(target, {attributionControl: false});

    const layer = L.mapboxGL({
        accessToken: 'undefined',
        style: mapboxstyle({src: sources(), spritesPath, sourceName})
    });
    
    layer.addTo(map);

    map.setView([center.lng, center.lat], startZoom);

    if (getView) {
        map.on('moveend', () => {
            getView(map.getCenter(), map.getZoom(), label);
            
        });

        setView(label, (cntr, zoom) => {
            map.setView(cntr, zoom);
        });
    }
};

module.exports = leafletMBGLMap;