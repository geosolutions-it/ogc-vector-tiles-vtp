
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
import MapUtils from '@mapstore/utils/MapUtils';
import CoordinatesUtils from '@mapstore/utils/CoordinatesUtils';
import isNil from 'lodash/isNil';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function updateMapInfoState({
    map,
    id,
    projection,
    onMapViewChanges = () => {}
}) {
    const { lng, lat } = map.getCenter();
    const zoom = map.getZoom() - 1;
    const bbox = map.getBounds().toArray();
    const canvas = map.getCanvas();

    const size = {
        width: canvas.clientWidth,
        height: canvas.clientHeight
    };

    onMapViewChanges(
        { x: lng || 0.0, y: lat || 0.0, crs: 'EPSG:4326' },
        zoom,
        {
            bounds: {
                minx: bbox[0][0],
                miny: bbox[0][1],
                maxx: bbox[1][0],
                maxy: bbox[1][1]
            },
            crs: 'EPSG:4326',
            rotation: map.getBearing()
        },
        size,
        id,
        projection
    );
}

const setRegisterHooks = ({
    map
}) => {
    /*
    MapUtils.registerHook(MapUtils.RESOLUTION_HOOK, () => {
        return null;
    });
    MapUtils.registerHook(MapUtils.COMPUTE_BBOX_HOOK, (center, zoom) => {
        return {};
    });
    MapUtils.registerHook(MapUtils.GET_PIXEL_FROM_COORDINATES_HOOK, (pos) => {
        return this.map.getPixelFromCoordinate(pos);
    });
    MapUtils.registerHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK, (pixel) => {
        return this.map.getCoordinateFromPixel(pixel);
    });
    */
    MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, (extent, { padding, crs, maxZoom: zoomLevel } = {}) => {
        const bounds = CoordinatesUtils.reprojectBbox(extent, crs, 'EPSG:4326');

        let maxZoom = zoomLevel;
        if (bounds && bounds[0] === bounds[2] && bounds[1] === bounds[3] && isNil(maxZoom)) {
            maxZoom = 21; // TODO: allow to this maxZoom to be customizable
        }
        const maxZoomParam = maxZoom && { maxZoom };
        const paddingParam = padding && { padding };
        map.fitBounds(bounds, {
            ...maxZoomParam,
            ...paddingParam
        });
    });
};

function MapboxMap({

    id,
    style,
    center,
    zoom,
    mapStateSource,
    projection,
    // projectionDefs,
    onMapViewChanges,
    // onResolutionsChange,
    // onClick,
    // mapOptions,
    // zoomControl,
    // mousePointer,
    // onMouseMove,
    onLayerLoading,
    onLayerLoad,
    onLayerError,
    // resize,
    // measurement,
    // changeMeasurementState,
    registerHooks,
    // interactive,
    onCreationError,
    // bbox,
    // onWarning,
    // maxExtent,
    // limits,
    children
}) {

    const mapRef = useRef(null);
    const [ load, setLoad ] = useState(false);

    useEffect(() => {
        mapboxgl.accessToken = '';
        const map = new mapboxgl.Map({
            container: id,
            center: [
                center.x,
                center.y
            ],
            zoom,
            style: {
                version: 8,
                sources: {},
                layers: []
            }
        });

        map.on('load', () => {

            map.on('moveend', () => {
                updateMapInfoState({
                    map,
                    id,
                    projection,
                    onMapViewChanges
                });
            });

            mapRef.current = map;
            if (registerHooks) {
                setRegisterHooks({ map });
            }
            setLoad(!load);
        });

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, []);

    const map = mapRef.current;
    /*
    const currentCenter = this.props.center;
    const centerIsUpdated = newProps.center.y === currentCenter.y &&
        newProps.center.x === currentCenter.x;
    */
    const centerString = center.x + ' ' + center.y;

    useEffect(() => {
        if (map && id !== mapStateSource) {
            map.setCenter([ center.x, center.y ]);
        }
    }, [ centerString ]);

    useEffect(() => {
        if (map && id !== mapStateSource) {
            map.setZoom(Math.round(zoom));
        }
    }, [ zoom ]);

    const mapChildren = map ? React.Children.map(children, child => {
        return child ? React.cloneElement(child, {
            map: map,
            mapId: id,
            onLayerLoading: onLayerLoading,
            onLayerError: onLayerError,
            onLayerLoad: onLayerLoad,
            projection: projection,
            onCreationError: onCreationError
        }) : null;
    }) : null;

    return (
        <div id={id} style={style}>
            {mapChildren}
        </div>
    );
}

MapboxMap.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    center: ConfigUtils.PropTypes.center,
    zoom: PropTypes.number.isRequired,
    mapStateSource: ConfigUtils.PropTypes.mapStateSource,
    projection: PropTypes.string,
    projectionDefs: PropTypes.array,
    onMapViewChanges: PropTypes.func,
    onResolutionsChange: PropTypes.func,
    onClick: PropTypes.func,
    mapOptions: PropTypes.object,
    zoomControl: PropTypes.bool,
    mousePointer: PropTypes.string,
    onMouseMove: PropTypes.func,
    onLayerLoading: PropTypes.func,
    onLayerLoad: PropTypes.func,
    onLayerError: PropTypes.func,
    resize: PropTypes.number,
    measurement: PropTypes.object,
    changeMeasurementState: PropTypes.func,
    registerHooks: PropTypes.bool,
    interactive: PropTypes.bool,
    onCreationError: PropTypes.func,
    bbox: PropTypes.object,
    onWarning: PropTypes.func,
    maxExtent: PropTypes.array,
    limits: PropTypes.object
};

MapboxMap.defaultProps = {
    id: 'map',
    onMapViewChanges: () => { },
    onResolutionsChange: () => { },
    onCreationError: () => { },
    onClick: null,
    onMouseMove: () => { },
    mapOptions: {},
    projection: 'EPSG:3857',
    projectionDefs: [],
    onLayerLoading: () => { },
    onLayerLoad: () => { },
    onLayerError: () => { },
    resize: 0,
    registerHooks: true,
    interactive: true
};

export default MapboxMap;
