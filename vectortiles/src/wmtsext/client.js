/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const mapboxgl = require('mapbox-gl');
const axios = require('axios');
mapboxgl.accessToken = 'undefined';
require('mapbox-gl/dist/mapbox-gl.css');
const { get, head } = require('lodash');
let center = { lng: 32.61751911206343, lat: 36.09650048440878 };
let zoom = 12;
const xml2js = require('xml2js');
const parserXml = new xml2js.Parser();

axios.get('HERE WMTS CAPABILITIES URL')
    .then(({ data: cap }) => {
        parserXml.parseString(cap, (err, res) => {
            const capLayers = get(res, 'Capabilities.Contents[0].Layer');
            const layers = capLayers.map((layer) => {
                const id = get(layer, 'ows:Identifier[0]');
                const title = get(layer, 'ows:Title[0]');
                const resources = (get(layer, 'ResourceURL') || [])
                    .map((resource) => {
                        
                        const value = get(resource, '$') || {};
                        return value;
                    });
                return {
                    id,
                    title,
                    resources
                };
            })
            .filter(layer => head(layer.resources.filter(({ format }) => format === 'application/vnd.geoserver.mbstyle+json')));

            let containers = [];
            window.addEventListener('resize', () => {
                const mapsContainer = document.getElementById('map');
                const COLS = Math.floor(mapsContainer.clientWidth / 400);
                const ROWS = Math.ceil(layers.length / COLS);
                const WIDTH = Math.floor(mapsContainer.clientWidth / COLS);
                const HEIGHT = Math.floor(mapsContainer.clientHeight / ROWS);
                containers.forEach((container, idx) => {
                    const x = idx % COLS;
                    const y = Math.floor(idx / COLS);
                    container.style.left = `${x * WIDTH}px`;
                    container.style.top = `${y * HEIGHT}px`;
                    container.style.width = `${WIDTH}px`;
                    container.style.height = `${HEIGHT}px`;
                });
            });

            const mapsContainer = document.getElementById('map');
            const COLS = Math.floor(mapsContainer.clientWidth / 400);
            const ROWS = Math.ceil(layers.length / COLS);
            const WIDTH = Math.floor(mapsContainer.clientWidth / COLS);
            const HEIGHT = Math.floor(mapsContainer.clientHeight / ROWS);
            
            layers.forEach((layer, idx) => {
                const mbstyleTemplate = head(layer.resources.filter(({ format }) => format === 'application/vnd.geoserver.mbstyle+json'));
                const tileTemplate = head(layer.resources.filter(({ format, resourceType }) => resourceType === 'tile' && format === 'application/vnd.mapbox-vector-tile'));
                const x = idx % COLS;
                const y = Math.floor(idx / COLS);
                const container = document.createElement('div');
                const mapId = `map-${idx}`;
                container.setAttribute('id', mapId);
                mapsContainer.appendChild(container);
                container.style.position = 'absolute';
                container.style.left = `${x * WIDTH}px`;
                container.style.top = `${y * HEIGHT}px`;
                container.style.width = `${WIDTH}px`;
                container.style.height = `${HEIGHT}px`;
                container.style.boxSizing = 'border-box';
                container.style.border = '1px solid #ddd';

                containers.push(container);
                if (mbstyleTemplate && tileTemplate) {
                    axios.get(mbstyleTemplate.template)
                        .then(({ data: style }) => {                       
                            const map = new mapboxgl.Map({
                                container: mapId,
                                style: style,
                                center: [center.lat, center.lng],
                                zoom
                            });
             
                            map.addControl(new mapboxgl.NavigationControl(), 'top-left');
                        });
                }
            });
        }) ;
    });

