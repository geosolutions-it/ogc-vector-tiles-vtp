/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('axios');

const Style = require('ol/style/Style').default;
const Fill = require('ol/style/Fill').default;
const Stroke = require('ol/style/Stroke').default;
const Circle = require('ol/style/Circle').default;

const LayerVectorTile = require('ol/layer/VectorTile').default
const VectorTile = require('ol/source/VectorTile').default;
const WMTS = require('ol/source/WMTS').default;
const { optionsFromCapabilities } = require('ol/source/WMTS');
const MVT = require('ol/format/MVT').default;
const WMTSCapabilities = require('ol/format/WMTSCapabilities').default;
const View = require('ol/View').default;
const Map = require('ol/Map').default;
const { transform } = require('ol/proj');
const Overlay = require('ol/Overlay').default;

const tinycolor = require('tinycolor2');
require('ol/ol.css');

const defaultStyle = (color = '#333333') => () => {
    return new Style({
        fill: new Fill({
            color: tinycolor(color).setAlpha(0.1).toRgbString()
        }),
        stroke: new Stroke({
            color: tinycolor(tinycolor(color).spin(25)).setAlpha(0.75).toRgbString(),
            width: 0.5
        }),
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: tinycolor(tinycolor(color).spin(45)).setAlpha(0.5).toRgbString()
            })
        })
    })
};

const openlayersMap = ({ target, center, zoom, url, buttons, layersName, minZoom }) =>
    axios.get(`${url}/gwc/service/wmts?REQUEST=GetCapabilities`)
        .then(({ data }) => {
            const container = document.getElementById(target);

            const caps = new WMTSCapabilities().read(data);
            const popup = document.createElement('div');
            popup.setAttribute('class', 'ol-popup');
            const popupCloser = document.createElement('a');
            popupCloser.setAttribute('class', 'ol-popup-closer');
            const popupContent = document.createElement('div');
            popupContent.setAttribute('class', 'ol-popup-content');
            popup.appendChild(popupCloser);
            popup.appendChild(popupContent);

            container.appendChild(popup);
            const overlay = new Overlay({
                element: popup,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });

            const epsg = '900913';

            const sources = layersName.map(({ layer, color, workspace }) => {
                const wmts = new WMTS(
                    optionsFromCapabilities(caps, {
                        layer: workspace + ':' + layer,
                        matrixSet: 'EPSG:900913',
                        format: 'application/vnd.mapbox-vector-tile'
                    })
                );
                const source = new VectorTile({
                    format: new MVT(),
                    url: `${url}/${workspace}/gwc/service/wmts?layer=${layer}&style=&tilematrixset=EPSG:${epsg}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/vnd.mapbox-vector-tile&TileMatrix=EPSG:${epsg}:{z}&TileCol={x}&TileRow={y}`,
                    tileGrid: wmts.getTileGrid()
                });
                return {
                    source,
                    color
                };
            });


            const layer = sources.map(({ source, color }) =>
                new LayerVectorTile({
                    source,
                    style: defaultStyle(color)
                })
            );

            const map = new Map({
                target,
                view: new View({
                    center: transform([center.lng, center.lat], 'EPSG:4326', 'EPSG:3857'),
                    zoom,
                    minZoom
                }),
                overlays: [overlay],
                layers: [...layer]
            });

            popupCloser.onclick = () => {
                overlay.setPosition(undefined);
                popupCloser.blur();
                return false;
            };

            map.on('singleclick', event => {
                let coordinate = event.coordinate;
                let props = [];
                const pixel = map.getPixelFromCoordinate(coordinate);
                map.forEachFeatureAtPixel(pixel, feature => {
                    const properties = feature.getProperties();
                    props = [...props, { layer: properties.layer, properties }];
                });
                popupContent.innerHTML = '';

                props.forEach(({ layer = '', properties = {} }) => {
                    const title = document.createElement('h5');
                    title.innerHTML = layer;
                    popupContent.appendChild(title);
                    Object.keys(properties).filter(key => key !== 'layer').forEach(key => {
                        const cont = document.createElement('div');
                        const param = document.createElement('span');
                        param.innerHTML = key + ':';
                        const value = document.createElement('span');
                        value.innerHTML = properties[key];
                        cont.appendChild(param);
                        cont.appendChild(value);
                        popupContent.appendChild(cont);
                    });
                });

                overlay.setPosition(coordinate);
            });


            const flyTo = (location, zm, done = () => { }) => {
                const view = map.getView();
                const duration = 2000;
                const currentZoom = view.getZoom();
                let parts = 2;
                let called = false;
                const callback = (complete) => {
                    --parts;
                    if (called) {
                        return;
                    }
                    if (parts === 0 || !complete) {
                        called = true;
                        done(complete);
                    }
                }
                view.animate({
                    center: location,
                    duration: duration
                }, callback);
                view.animate({
                    zoom: currentZoom - 1,
                    duration: duration / 2
                }, {
                        zoom: zm,
                        duration: duration / 2
                    }, callback);
            }

            buttons.forEach(({ btn, center: cnt, zoom: zm }) => {
                btn.onclick = () => {
                    flyTo(transform([cnt.lng, cnt.lat], 'EPSG:4326', 'EPSG:3857'), zm);
                };
            });
        });

module.exports = openlayersMap;