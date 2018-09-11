
/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
require('leaflet.vectorgrid');

L.Path.include({ options: { stroke: true } });

const vectorTileLayerStyles = {
    VegetationSrf: {
        fill: true,
        fillColor: '#C2E4B9'
    },
    AgricultureSrf: {
        fill: true,
        fillColor: 'rgb(3, 152, 89)',
        fillOpacity: 0.5
    },
    SettlementSrf: (feature, zoom) => ({
        fill: true,
        fillColor: 'rgb(232, 195, 178)',
        color: '#000000',
        weight: zoom > 13 && 2 || zoom > 8 && 1 || 1
    }),
    MilitarySrf: {
        fill: true,
        fillColor: '#f3602f',
        fillOpacity: 0.5
    },
    CultureSrf: {
        fill: true,
        fillColor: '#ab92d2',
        fillOpacity: 0.5

    },
    HydrographySrf: feature => feature.F_CODE === 'BH082' ?
        {
            fill: true,
            fillColor: '#B0E1ED',
            color: '#00A0C6',
            weight: 2
        } : null,
    HydrographyCrv: (feature, zoom) => feature.F_CODE === 'BH140' ?
        {
            color: '#00A0C6',
            weight: zoom > 13 && 4 || zoom > 8 && 2 || 1,
            lineCap: 'round',
            lineJoin: 'round'
        } : null,
    TransportationGroundCrv: (feature, zoom) => {
        if (feature.F_CODE === 'AP030' && feature.RIN_ROI === 3) {
            return {
                color: '#ff0000',
                weight: zoom > 13 && 8 || zoom > 8 && 3 || 1,
                lineCap: 'round',
                lineJoin: 'round'
            };
        }
        if (feature.F_CODE === 'AP030' && feature.RIN_ROI === 4) {
            return {
                color: '#cb171a',
                weight: zoom > 13 && 8 || zoom > 8 && 3 || 1,
                lineCap: 'round',
                lineJoin: 'round'
            };
        }
        if (feature.F_CODE === 'AP030' && feature.RIN_ROI === 5) {
            return {
                color: '#ffffff',
                weight: zoom > 13 && 6 || zoom > 8 && 2 || 1,
                lineCap: 'round',
                lineJoin: 'round'
            };
        }
        return null;
    },
    UtilityInfrastructureCrv: (feature, zoom) => feature.F_CODE === 'AT005' ?
        {
            color: '#473895',
            weight: zoom > 13 && 4 || zoom > 8 && 1 || 1,
            lineCap: 'round',
            lineJoin: 'round'
        } : null,
    UtilityInfrastructurePnt: (feature, zoom) => zoom > 12 ? {
        icon: L.icon({
            iconUrl: 'sprites/circle.svg',
            iconSize: zoom > 13 && [16, 16] || zoom > 8 && [10, 10] || [2, 2],
            iconAnchor: zoom > 13 && [8, 8] || zoom > 8 && [5, 5] || [1, 1]
        })
    } : null,
    FacilityPnt: {
        icon: L.icon({
            iconUrl: 'sprites/square.svg',
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        })
    },
    CulturePnt: {
        icon: L.icon({
            iconUrl: 'sprites/square.svg',
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        })
    },
    StructurePnt: {
        icon: L.icon({
            iconUrl: 'sprites/square.svg',
            iconSize: [8, 8],
            iconAnchor: [4, 4]
        })
    }
};

const projectionEPSG = '900913';

const leafletMap = (target, center, startZoom, getView, setView, label, url) => {

    const layers = [
        'Daraa'
    ].map(key =>
        L.vectorGrid.protobuf(
            `${url}/gwc/service/wmts?Layer=${key}&Style=&TilematrixSet=EPSG:${projectionEPSG}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:${projectionEPSG}:{z}&TileCol={x}&TileRow={y}`, {
                vectorTileLayerStyles
            })
    );

    const map = L.map(target, { attributionControl: false })
        .setView(
            [center.lng, center.lat],
            startZoom
        );

    layers.forEach(layer => {
        layer.addTo(map);
    });

    if (getView) {
        map.on('moveend', () => {
            getView(map.getCenter(), map.getZoom(), label);

        });
        setView(label, (cntr, zoom) => {
            map.setView(cntr, zoom);
        });
    }
};

module.exports = leafletMap;