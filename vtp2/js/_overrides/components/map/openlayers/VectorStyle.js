/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import isNil from 'lodash/isNil';
import trim from 'lodash/trim';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import castArray from 'lodash/castArray';
import head from 'lodash/head';
import last from 'lodash/last';
import find from 'lodash/find';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import { colorToRgbaStr } from '@mapstore/utils/ColorUtils';
import { reproject, transformLineToArcs } from '@mapstore/utils/CoordinatesUtils';
import Icons from '@mapstore/utils/openlayers/Icons';
import {
    isMarkerStyle, isTextStyle, isStrokeStyle, isFillStyle, isCircleStyle, isSymbolStyle,
    registerGeometryFunctions, geometryFunctions, getStyleParser, splitStyleSheet, adjustIconSize
} from '@mapstore/utils/VectorStyleUtils';

import CircleStyle from 'ol/style/Circle';
import { Stroke, Fill, Text, Style } from 'ol/style';
import { Point, LineString } from 'ol/geom';

import { Promise } from 'es6-promise';
import axios from '@mapstore/libs/ajax';
import OlStyleParser from 'geostyler-openlayers-parser';

const olStyleParser = new OlStyleParser();

import {
    getStyle as getStyleLegacy, getMarkerStyle as getMarkerStyleLegacyFun,
    startEndPolylineStyle as startEndPolylineStyleLegacy, defaultStyles as defaultStylesLegacy
} from '@mapstore/components/map/openlayers/LegacyVectorStyle';

const selectedStyle = {
    white: [255, 255, 255, 1],
    blue: [0, 153, 255, 1],
    width: 3
};
/**
 * converts a style object into an ol.Style
 * @param {object} style to convert
 * @param {object} ol.Stroke object
 * @param {object} ol.Fill object
 * @return if a circle style is passed then return it available for ol.style.Image
*/
export const getCircleStyle = (style = {}, stroke = null, fill = null) => {
    return isCircleStyle(style) ? new CircleStyle({
        stroke,
        fill,
        radius: style.radius || 5
    }) : null;
};
/**
 * converts a style object into an array of ol.Style. It uses the Icons library
 * if specified or the standard one if not.
 * @param {object} style to convert
 * @return array of ol.Style
*/
export const getMarkerStyle = (style) => {
    if (isMarkerStyle(style)) {
        if (style.iconUrl) {
            return Icons.standard.getIcon({ style });
        }
        const iconLibrary = style.iconLibrary || 'extra';
        if (Icons[iconLibrary]) {
            return Icons[iconLibrary].getIcon({ style });
        }
    }
    return null;
};
/**
 * converts a style object
 * @param {object} style to convert
 * @return an Stroke style
*/
export const getStrokeStyle = (style = {}) => {
    return isStrokeStyle(style) ? new Stroke(style.stroke && isObject(style.stroke) ? style.stroke : { // not sure about this ternary expr
        color: style.highlight ? selectedStyle.blue : colorToRgbaStr(style.color || style.stroke || "#0000FF", isNil(style.opacity) ? 1 : style.opacity),
        width: isNil(style.weight) ? 1 : style.weight,
        lineDash: isString(style.dashArray) && trim(style.dashArray).split(' ') || isArray(style.dashArray) && style.dashArray || [0],
        lineCap: style.lineCap || 'round',
        lineJoin: style.lineJoin || 'round',
        lineDashOffset: style.dashOffset || 0
    }) : null;
};

/**
 * converts a style object
 * @param {object} style to convert
 * @return an Fill style
*/
export const getFillStyle = (style = {}) => {
    return isFillStyle(style) ? new Fill(style.fill && isObject(style.fill) ? style.fill : { // not sure about this ternary expr
        color: colorToRgbaStr(style.fillColor || "#0000FF", isNil(style.fillOpacity) ? 1 : style.fillOpacity)
    }) : null;
};

/**
 * converts a style object
 * @param {object} style to convert
 * @param {object} stroke Stroke ready to use
 * @param {object} fill Fill ready to use
 * @return an Text style
*/
export const getTextStyle = (style = {}, stroke = null, fill = null, feature) => {
    return isTextStyle(style) ? new Text({
        fill,
        offsetY: style.offsetY || -(4 * Math.sqrt(style.fontSize)), // TODO improve this for high font values > 100px
        textAlign: style.textAlign || "center",
        text: style.label || feature && feature.properties && feature.properties.valueText || "New",
        font: style.font || "Arial",
        // halo
        stroke: style.highlight ? new Stroke({
            color: [255, 255, 255, 1],
            width: 2
        }) : stroke,
        // this should be another rule for the small circle
        image: style.highlight ?
            new CircleStyle({
                radius: 5,
                fill: null,
                stroke: new Stroke({
                    color: colorToRgbaStr(style.color || "#0000FF", style.opacity || 1),
                    width: style.weight || 1
                })
            }) : null
    }) : null;
};


/**
 * it creates a custom style for the first point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {Style} style of the point
*/
export const firstPointOfPolylineStyle = ({ radius = 5, fillColor = 'green', applyToPolygon = false } = {}) => new Style({
    image: new CircleStyle({
        radius,
        fill: new Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return coordinates.length > 1 ? new Point(head(coordinates)) : null;
    }
});

/**
 * it creates a custom style for the last point of a polyline
 * @param {object} options possible configuration of start point
 * @param {number} options.radius radius of the circle
 * @param {string} options.fillColor ol color for the circle fill style
 * @param {boolean} options.applyToPolygon tells if this style can be applied to a polygon
 * @return {Style} style of the point
*/
export const lastPointOfPolylineStyle = ({ radius = 5, fillColor = 'red', applyToPolygon = false } = {}) => new Style({
    image: new CircleStyle({
        radius,
        fill: new Fill({
            color: fillColor
        })
    }),
    geometry: function(feature) {
        const geom = feature.getGeometry();
        const type = geom.getType();
        if (!applyToPolygon && type === "Polygon") {
            return null;
        }
        let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
        return new Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === "Polygon" ? 2 : 1)] : last(coordinates));
    }
});

/**
    creates styles to highlight/customize start and end point of a polyline
*/
export const addDefaultStartEndPoints = (styles = [], startPointOptions = { radius: 3, fillColor: "green", applyToPolygon: true }, endPointOptions = { radius: 3, fillColor: "red", applyToPolygon: true }) => {
    let points = [];
    if (!find(styles, s => s.geometry === "startPoint" && s.filtering)) {
        points.push(firstPointOfPolylineStyle({ ...startPointOptions }));
    }
    if (!find(styles, s => s.geometry === "endPoint" && s.filtering)) {
        points.push(lastPointOfPolylineStyle({ ...endPointOptions }));
    }
    return points;
};

export const centerPoint = (feature) => {
    const geometry = feature.getGeometry();
    const extent = geometry.getExtent();
    let center = geometry.getCenter && geometry.getCenter() || [extent[2] - extent[0], extent[3] - extent[1]];
    return new Point(center);
};
export const lineToArc = (feature) => {
    const type = feature.getGeometry().getType();
    if (type === "LineString" || type === "MultiPoint") {
        let coordinates = feature.getGeometry().getCoordinates();
        coordinates = transformLineToArcs(coordinates.map(c => {
            const point = reproject(c, "EPSG:3857", "EPSG:4326");
            return [point.x, point.y];
        }));
        return new LineString(coordinates.map(c => {
            const point = reproject(c, "EPSG:4326", "EPSG:3857");
            return [point.x, point.y];
        }));
    }
    return feature.getGeometry();
};
export const startPoint = (feature) => {
    const geom = feature.getGeometry();
    const type = geom.getType();
    let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
    return coordinates.length > 1 ? new Point(head(coordinates)) : null;
};
export const endPoint = (feature) => {
    const geom = feature.getGeometry();
    const type = geom.getType();

    let coordinates = type === "Polygon" ? geom.getCoordinates()[0] : geom.getCoordinates();
    return new Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === "Polygon" ? 2 : 1)] : last(coordinates));
};

registerGeometryFunctions("centerPoint", centerPoint, "Point");
registerGeometryFunctions("lineToArc", lineToArc, "LineString");
registerGeometryFunctions("startPoint", startPoint, "Point");
registerGeometryFunctions("endPoint", endPoint, "Point");

/**
    if a geom expression is present then return the corresponding function
*/
export const getGeometryTrasformation = (style = {}) => {
    return style.geometry ?
        // then parse the geom_expression and return true or false
        (feature) => {
            const geomFunction = style.geometry || "centerPoint";
            return geometryFunctions[geomFunction].func(feature);
        } : (f) => f.getGeometry();
};

export const getFilter = (style = {}) => {
    return !isNil(style.filtering) ?
        // then parse the filter_expression and return true or false
        style.filtering : true; // if no filter is defined, it returns true
};


export const parseStyleToOl = (feature = { properties: {} }, style = {}, tempStyles = []) => {
    const filtering = getFilter(style, feature);
    if (filtering) {
        const stroke = getStrokeStyle(style);
        const fill = getFillStyle(style);
        const image = getCircleStyle(style, stroke, fill);

        if (isMarkerStyle(style)) {
            return getMarkerStyle(style).map(s => {
                s.setGeometry(getGeometryTrasformation(style));
                return s;
            });
        }
        if (isSymbolStyle(style)) {
            return Icons.standard.getIcon({ style }).map(s => {
                s.setGeometry(getGeometryTrasformation(style));
                return s;
            });
        }
        const text = getTextStyle(style, stroke, fill, feature);
        const zIndex = style.zIndex;

        // if filter is defined and true (default value)
        const finalStyle = new Style({
            geometry: getGeometryTrasformation(style),
            image,
            text,
            stroke: !text && !image && stroke || null,
            fill: !text && !image && fill || null,
            zIndex
        });
        return [finalStyle].concat(feature && feature.properties && feature.properties.canEdit && !feature.properties.isCircle ? addDefaultStartEndPoints(tempStyles) : []);
    }
    return new Style({});
    // if not do not return anything

};

export const parseStyles = (feature = {properties: {}}) => {
    let styles = feature.style;
    if (styles) {
        let tempStyles = isArray(styles) ? styles : castArray(styles);
        return tempStyles.reduce((p, c) => {
            return p.concat(parseStyleToOl(feature, c, tempStyles));
        }, []);
    }
    return [];

};

function adjustScaleDenominator(projection, style) {
    if (projection === 'EPSG:4326') {
        return {
            ...style,
            rules: style.rules.map((rule) => {
                const max = rule.scaleDenominator.max && rule.scaleDenominator.max / METERS_PER_UNIT.degrees;
                const min = rule.scaleDenominator.min && rule.scaleDenominator.min / METERS_PER_UNIT.degrees;
                const maxScaleDenominator = max && { max };
                const minScaleDenominator = max && { min };
                const scaleDenominator = (minScaleDenominator || maxScaleDenominator) && {
                    ...maxScaleDenominator,
                    ...minScaleDenominator
                };
                return {
                    ...rule,
                    ...(scaleDenominator && { scaleDenominator })
                };
            })
        };
    }
    return style;
}

function getOlStyleFunction(format, styleBody, options) {
    const { projection } = options || {};
    const splitStyle = splitStyleSheet(format, styleBody);
    const layersStyles = isArray(splitStyle) && splitStyle;
    if (!layersStyles || layersStyles.length === 1 && layersStyles[0] && layersStyles[0].group && layersStyles[0].group.length === 1) {
        return getStyleParser(format)
            .readStyle(styleBody)
            .then(style => adjustIconSize(format, style))
            .then(style => adjustScaleDenominator(projection, style))
            .then(style => olStyleParser.writeStyle(style));
    }
    return Promise.all(
        layersStyles
            .reduce((acc, { group, layerName }) => [
                ...acc,
                ...group
                    .map((layerStyleBody) =>
                        getStyleParser(format)
                            .readStyle(layerStyleBody)
                            .then(style => adjustIconSize(format, style))
                            .then(style => adjustScaleDenominator(projection, style))
                            .then(style => olStyleParser.writeStyle(style))
                            .then(olStyle => ({
                                layerName,
                                olStyle
                            }))
                            .catch(() => ({}))
                    )
            ], [])
    )
        .then((olStyles) => {
            const filteredStyles = olStyles.filter(({ olStyle }) => olStyle);
            const groupedStylesByLayerName = filteredStyles
                .reduce(function(acc, { layerName, olStyle }) {
                    const currentStyle = acc.find((style) => style.layerName === layerName);
                    if (currentStyle) {
                        return acc.map(function(style) {
                            return style.layerName === layerName
                                ? {
                                    layerName,
                                    group: [
                                        ...style.group,
                                        olStyle
                                    ]
                                } : style;
                        });
                    }
                    return [...acc, { layerName, group: [olStyle] }];
                }, []);
            let count = 0;
            const zIndex = groupedStylesByLayerName.map(({ group }) => group.map(() => count++));
            return function(...args) {
                return groupedStylesByLayerName
                    .map(function({ layerName, group }, groupIdx) {
                        return function() {
                            const [olFeature] = args;
                            const properties = olFeature.getProperties();
                            const layerId = (olFeature.getId() + '' || '').split('.')[0];
                            if (layersStyles.length > 1 && !(properties._layer_ === layerName || layerId === layerName)) return [];
                            return group
                                .reduce((acc, olStyle, idx) => {
                                    const olStyleObjects = isFunction(olStyle) ? olStyle(...args) : olStyle;
                                    const styles = isArray(olStyleObjects) ? olStyleObjects : [olStyleObjects];
                                    return [
                                        ...acc,
                                        ...styles
                                            .map((style) => {
                                                style.setZIndex(zIndex[groupIdx][idx]);
                                                return style;
                                            })
                                    ];
                                }, []);
                        };
                    })
                    .reduce((acc, olStyleFunction) => [...acc, ...olStyleFunction()], []);
            };
        });
}

export const getStyle = (options, isDrawing = false, textValues = []) => {
    if (options.style && options.style.url) {
        return axios.get(options.style.url).then(response => {
            return getOlStyleFunction(options.style.format, response.data, options);
        });
    }
    if (options.style && options.style.body) {
        return getOlStyleFunction(options.style.format, options.style.body, options);
    }
    const style = getStyleLegacy(options, isDrawing, textValues);
    if (options.asPromise) {
        return new Promise((resolve) => {
            resolve(style);
        });
    }
    return style;
};

export const getMarkerStyleLegacy = getMarkerStyleLegacyFun;
export const startEndPolylineStyle = startEndPolylineStyleLegacy;
export const defaultStyles = defaultStylesLegacy;
