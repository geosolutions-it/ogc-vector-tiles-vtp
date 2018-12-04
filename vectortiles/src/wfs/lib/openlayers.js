/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Style = require('ol/style/Style').default;
const Fill = require('ol/style/Fill').default;
const Stroke = require('ol/style/Stroke').default;
const Circle = require('ol/style/Circle').default;
const LayerVectorTile = require('ol/layer/VectorTile').default;
const VectorTile = require('ol/source/VectorTile').default;
const VectorSource = require('ol/source/Vector').default;
const VectorLayer = require('ol/layer/Vector').default;
const GeoJSON = require('ol/format/GeoJSON').default;
const MVT = require('ol/format/MVT').default;
const View = require('ol/View').default;
const Map = require('ol/Map').default;
const { transform } = require('ol/proj');
const Overlay = require('ol/Overlay').default;

const TileGrid = require('ol/tilegrid/TileGrid').default;
const { createXYZ } = require('ol/tilegrid');
const chroma = require('chroma-js');
const tinycolor = require('tinycolor2');

const axios = require('axios');

require('ol/ol.css');

const defaultStyle = (colors) => (feature) => {
    const opacity = 1.0;
    const { layer = '', gmlid = '' } = feature.getProperties();

    const lowerLayer = layer.toLowerCase() || gmlid && gmlid.toLocaleLowerCase() || '';
    
    if (lowerLayer.indexOf('AgricultureSrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('agriculture_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color: tinycolor(colors[0]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('VegetationSrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('vegetation_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color: tinycolor(colors[1]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('SettlementSrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('settlement_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color:tinycolor(colors[2]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('MilitarySrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('military_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color: tinycolor(colors[3]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('CultureSrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('culture_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color: tinycolor(colors[4]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('HydrographyCrv'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('hydrography_crv'.toLocaleLowerCase()) !== -1) {
        return new Style({
            stroke: new Stroke({
                color: colors[5],
                width: 2
            })
        });
    }
    if (lowerLayer.indexOf('HydrographySrf'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('hydrography_srf'.toLocaleLowerCase()) !== -1) {
        return new Style({
            fill: new Fill({
                color: tinycolor(colors[6]).setAlpha(opacity).toRgbString()
            })
        });
    }
    if (lowerLayer.indexOf('TransportationGroundCrv'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('transportation_ground_crv'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('transgroundcrv'.toLocaleLowerCase()) !== -1) {
        return new Style({
            stroke: new Stroke({
                color: colors[7],
                width: 1
            })
        });
    }
    if (lowerLayer.indexOf('UtilityInfrastructureCrv'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('utility_infrastructure_crv'.toLocaleLowerCase()) !== -1) {
        return new Style({
            stroke: new Stroke({
                color: colors[8],
                width: 1
            })
        });
    }
    if (lowerLayer.indexOf('CulturePnt'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('culture_pnt'.toLocaleLowerCase()) !== -1) {
        return new Style({
            image: new Circle({
                radius: 4,
                fill: new Fill({
                    color: colors[9]
                })
            })
        });
    }
    if (lowerLayer.indexOf('FacilityPnt'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('facility_pnt'.toLocaleLowerCase()) !== -1) {
        return new Style({
            image: new Circle({
                radius: 4,
                fill: new Fill({
                    color: colors[10]
                })
            })
        });
    }
    if (lowerLayer.indexOf('StructurePnt'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('structure_pnt'.toLocaleLowerCase()) !== -1) {
        return new Style({
            image: new Circle({
                radius: 4,
                fill: new Fill({
                    color: colors[11]
                })
            })
        });
    }
    if (lowerLayer.indexOf('UtilityInfrastructurePnt'.toLocaleLowerCase()) !== -1
    || lowerLayer.indexOf('utility_infrastructure_pnt'.toLocaleLowerCase()) !== -1) {
        return new Style({
            image: new Circle({
                radius: 4,
                fill: new Fill({
                    color: colors[12]
                })
            })
        });
    }

    return new Style({
        fill: new Fill({
            color: tinycolor('#dddddd').setAlpha(opacity).toRgbString()
        }),
        stroke: new Stroke({
            color: '#333333',
            width: 0.5
        }),
        image: new Circle({
            radius: 4,
            fill: new Fill({
                color: '#000000'
            })
        })
    });
};

const openlayersMap = (target, maps, { urls, center, zoom, epsg = 'EPSG:3857', popup, popupContent, popupCloser, type, colorInputs, applyColor}) => {

    const overlay = new Overlay({
        element: popup,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    const GlobalCRS84Geometric = new TileGrid({
        extent: [-180, -90, 180, 90],
        minZoom: 0,
        maxZoom: 21,
        origin: [-180, 90],
        resolutions: [
            0.703125,
            0.3515625,
            0.17578125,
            0.087890625,
            0.0439453125,
            0.02197265625,
            0.010986328125,
            0.0054931640625,
            0.00274658203125,
            0.001373291015625,
            0.0006866455078125,
            0.0003433227539062,
            0.0001716613769531,
            0.0000858306884766,
            0.0000429153442383,
            0.0000214576721191,
            0.0000107288360596,
            0.0000053644180298,
            0.0000026822090149,
            0.0000013411045074,
            0.0000006705522537,
            0.0000003352761269
        ]
    });

    const GoogleMapsCompatible = createXYZ();

    const projections = {
        'EPSG:4326': {
            tileMatrix: GlobalCRS84Geometric,
            epsg: 'EPSG:4326'
        },
        GlobalCRS84Geometric: {
            tileMatrix: GlobalCRS84Geometric,
            epsg: 'EPSG:4326'
        },
        'EPSG:3857': {
            tileMatrix: GoogleMapsCompatible,
            epsg: 'EPSG:3857'
        },
        'EPSG:900913': {
            tileMatrix: GoogleMapsCompatible,
            epsg: 'EPSG:3857'
        },
        GoogleMapsCompatible: {
            tileMatrix: GoogleMapsCompatible,
            epsg: 'EPSG:3857'
        },
        smerc: {
            tileMatrix: GoogleMapsCompatible,
            epsg: 'EPSG:3857'
        }
    };
    
    const tileGrid = projections[epsg] && projections[epsg].tileMatrix || GoogleMapsCompatible;
    const projection = projections[epsg] && projections[epsg].epsg || 'EPSG:3857';

    const map = new Map({
        target,
        overlays: [overlay],
        view: new View({
            center: projection === 'EPSG:4326' ? [center.lat, center.lng] : transform([center.lat, center.lng], 'EPSG:4326', projection),
            zoom,
            projection
        })
    });
    
    const startColorsArray = colorInputs.map(input => input.value).filter(val => val);
    const startColors = chroma.scale(startColorsArray.length > 0 ? startColorsArray : 'YlGnBu').colors(13);

    if (type === 'GeoJSON') {
        urls.forEach(url => {
            axios.get(url)
                .then(({data}) => {
                    const vectorSource = new VectorSource({
                        features: (new GeoJSON()).readFeatures(data)
                    });

                    const vectorLayer = new VectorLayer({
                        source: vectorSource,
                        style: defaultStyle(startColors)
                    });
                    
                    map.addLayer(vectorLayer);
                }); 
        });
        
    } else {    
        const layers = urls.map((url) => {
            const source = new VectorTile({
                tilePixelRatio: 1,
                tileGrid,
                format: new MVT(),
                url
            });
            const vectorTile = new LayerVectorTile({
                style: defaultStyle(startColors),
                source
            });
            return vectorTile;
        });

        layers.forEach(layer => {
            map.addLayer(layer);
        });

    }

    applyColor.onclick = () => {
        const colorsArray = colorInputs.map(input => input.value).filter(val => val);
        const colors = chroma.scale(colorsArray.length > 0 ? colorsArray : 'YlGnBu').colors(13);
        maps.forEach(other => {
            other.map.getLayers().forEach(layer => {
                layer.setStyle(defaultStyle(colors));
            });
        });
    };

    popupCloser.onclick = () => {
        overlay.setPosition(undefined);
        popupCloser.blur();
        return false;
    };

    map.on('singleclick', event => {
        maps.forEach(other => {
            let coordinate = event.coordinate;
            if (other.projection !== projection) {
                coordinate = transform(coordinate, projection, other.projection);
            }

            let props = [];
            const pixel = other.map.getPixelFromCoordinate(coordinate);
            other.map.forEachFeatureAtPixel(pixel, feature => {
                const properties = feature.getProperties();
                props = [...props, { layer: properties.layer, properties }];
            });
            other.popupContent.innerHTML = '';

            props.forEach(({ layer = '', properties = {} }) => {
                const title = document.createElement('h5');
                title.innerHTML = layer;
                other.popupContent.appendChild(title);
                Object.keys(properties).filter(key => key !== 'layer').forEach(key => {
                    const cont = document.createElement('div');
                    const param = document.createElement('span');
                    param.innerHTML = key + ':';
                    const value = document.createElement('span');
                    value.innerHTML = properties[key];
                    cont.appendChild(param);
                    cont.appendChild(value);
                    other.popupContent.appendChild(cont);
                });
            });
            other.overlay.setPosition(coordinate);
        });
    });

    map.on('moveend', () => {
        maps.forEach(other => {
            const view = map.getView();
            let _center = view.getCenter();
            const _zoom = view.getZoom();
            if (other.projection !== projection) {
                _center = transform(_center, projection, other.projection);
            }
            other.map.setView(new View({
                center: _center,
                zoom: _zoom,
                projection: other.projection
            }));
        });
    });
    
    return {
        map,
        popup,
        popupCloser,
        popupContent,
        overlay,
        projection
    };

    
};

module.exports = openlayersMap;