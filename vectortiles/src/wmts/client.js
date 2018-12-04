/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

require('./css/style.css');
const {join} = require('lodash');

const openlayersMap = require('./lib/openlayers');
const openlayersMBSMap = require('./lib/openlayersMBS');
const mapboxglMap = require('./lib/mapboxgl');
const leafletMap = require('./lib/leaflet');
const leafletMBGLMap = require('./lib/leafletMBGL');
const tangramMap = require('./lib/tangram');

const {setView, getView} = require('./synch');

const center = {lng: 32.61751911206343, lat: 36.09650048440878};
const zoom = 14;

const spritesPath = process.env.spritesPath;
const url = process.env.geoserverUrl;
const sourceName = process.env.sourceName;

openlayersMap('vt-openlayers-map', center, zoom, getView, setView, 'openlayers', url, spritesPath, sourceName);
openlayersMBSMap('vt-openlayers-mbs-map', center, zoom, getView, setView, 'openlayers-mbs', url, spritesPath, sourceName);
mapboxglMap('vt-mapboxgl-map', center, zoom, getView, setView, 'mapboxgl', url, spritesPath, sourceName);
leafletMap('vt-leaflet-map', center, zoom, getView, setView, 'leaflet', url, spritesPath, sourceName);
leafletMBGLMap('vt-leaflet-mbgl-map', center, zoom, getView, setView, 'leaflet-mbgl', url, spritesPath, sourceName);
tangramMap('vt-tangram-map', center, zoom, getView, setView, 'tangram', url, spritesPath, sourceName);

const requests = [
    {
        url: '/geoserver/gwc/service/wmts?',
        comment: 'WMTS GetCapabilities Request',
        params: {
            Service: 'WMTS',
            Request: 'GetCapabilities',
            Version: '1.0.0'
        }
    },
    {
        url: '/geoserver/gwc/service/wmts?',
        comment: 'WMTS GetTile Request',
        params: {
            Service: 'WMTS',
            Request: 'GetTile',
            Version: '1.0.0',
            Format: 'application/vnd.mapbox-vector-tile',
            Layer: 'sourceName',
            TilematrixSet: 'EPSG:900193',
            TileMatrix: 'EPSG:900193:{z}',
            TileCol: '{x}',
            TileRow: '{y}'
        }
    }
];

const snippet = requests.map(req => {
    const params = req.params && Object.keys(req.params).map((key) => `<b>${key}</b>=<i>${req.params[key]}</i>`) || '';
    return '<div class="vt-comment"><small>' + req.comment + '</small></div>' + req.url + join(params, ' &');
}, '');

document.getElementById('vt-snippet').innerHTML = join(snippet, '<br/>');
document.body.removeChild(document.getElementById('loading'));