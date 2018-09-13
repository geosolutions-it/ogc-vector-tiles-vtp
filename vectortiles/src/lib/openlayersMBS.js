/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const olms = require('ol-mapbox-style');

const axios = require('axios');
const mapboxstyle = require('../../mapstyles/mapboxstyle');

const LayerVectorTile = require('ol/layer/VectorTile').default
const VectorTile = require('ol/source/VectorTile').default;
const WMTS = require('ol/source/WMTS').default;
const {optionsFromCapabilities} = require('ol/source/WMTS');
const MVT = require('ol/format/MVT').default;
const WMTSCapabilities = require('ol/format/WMTSCapabilities').default;
const View = require('ol/View').default;
const Map = require('ol/Map').default;
const {transform} = require('ol/proj');

require('ol/ol.css');

const openlayersMap = (target, center, startZoom, getView, setView, label, url, spritesPath, sourceName) =>
    axios.get(`${url}/gwc/service/wmts?REQUEST=GetCapabilities`)
    .then(({data}) => {

        const layerName = sourceName;
        const caps = new WMTSCapabilities().read(data);

        const wmts = new WMTS(
            optionsFromCapabilities(caps, {
                layer: layerName,
                matrixSet: 'EPSG:900913',
                format: 'application/x-protobuf;type=mapbox-vector'
            })
        );
        
        const source = new VectorTile({
            format: new MVT(),
            tileUrlFunction: wmts.getTileUrlFunction(),
            tileGrid: wmts.getTileGrid()
        });

        const glStyle = mapboxstyle({spritesPath});
        const glLayers = glStyle.layers.map(layer => Object.assign({}, layer, { source: layer['source-layer'] }));
        const glSourceStyle = Object.assign({}, glStyle, {layers: glLayers});

        const layers = [
            'AgricultureSrf',
            'VegetationSrf',
            'SettlementSrf',

            'MilitarySrf',
            'CultureSrf',

            'HydrographyCrv',
            'HydrographySrf',
            'TransportationGroundCrv',
            'UtilityInfrastructureCrv',

            'CulturePnt',
            'FacilityPnt',
            'StructurePnt',

            'UtilityInfrastructurePnt'
        ].map((name) => {
            const layer = new LayerVectorTile({source});
            olms.applyStyle(layer, glSourceStyle, name);
            return layer;
        });

        const map = new Map({
            target,
            view: new View({
                center: transform([center.lat, center.lng], 'EPSG:4326', 'EPSG:3857'),
                zoom: startZoom
            }),
            layers
        });

        if (getView) {
            map.on('moveend', () => {
                const view = map.getView();
                const coords4326 = transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
                getView({lat: coords4326[1], lng: coords4326[0]}, view.getZoom(), label);
            });

            setView(label, (cntr, zoom) => {
                map.setView(new View({
                    center: transform([cntr.lng, cntr.lat], 'EPSG:4326', 'EPSG:3857'),
                    zoom
                }));
            });
        }
    });

module.exports = openlayersMap;