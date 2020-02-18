/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Fragment, useRef, useEffect, cloneElement, Children } from 'react';
import Layers from '@js/utils/mapboxgl/Layers';
import CoordinatesUtils from '@mapstore/utils/CoordinatesUtils';
import isNumber from 'lodash/isNumber';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const generateOpts = ({
    options,
    position,
    srs,
    securityToken,
    onCreationError = () => {}
}) => {
    return {
        ...options,
        ...(isNumber(position) && { zIndex: position }),
        srs,
        onError: () => onCreationError(options),
        securityToken
    };
};

const getLayers = (layer, map) => {
    const mbstyle = map && map.getStyle();
    if (mbstyle) {
        const { layers = [] } = mbstyle;
        return layers.filter(({ source }) => source === layer.id);
    }
    return null;
};

const addLayer = ({
    map,
    layer,
    layerRef
}) => {
    map.addSource(layer.id, layer.source);
    layer.layers.forEach((l) => {
        map.addLayer(l);
    });
    const source = map.getSource(layer.id);
    layerRef.current = source;
};

const createLayer = ({
    type,
    options,
    position,
    securityToken,
    onCreationError,
    srs,
    map,
    mapId
}) => {
    if (type) {
        const layerOptions = generateOpts({
            options,
            position,
            srs: CoordinatesUtils.normalizeSRS(srs),
            securityToken,
            onCreationError
        });
        return Layers.createLayer(type, layerOptions, map, mapId);
    }
    return new Promise((resolve) => resolve(null));
};

const removeLayer = ({
    map,
    layer
}) => {

    const mbstyle = map && map.getStyle();
    if (mbstyle) {
        const { layers = [] } = mbstyle;
        layers.forEach(({ source, id }) => {
            if (source === layer.id) {
                map.removeLayer(id);
            }
        });
        map.removeSource(layer.id);
    }
};

function setVisibility(visibility, layer, map) {
    const currentLayers = getLayers(layer, map);
    if (currentLayers) {
        currentLayers.forEach((l) => {
            map.setLayoutProperty(l.id, 'visibility', visibility ? 'visible' : 'none');
        });
    }
}

function MapboxLayer({
    type,
    options,
    map,
    mapId,
    children,
    position,
    securityToken,
    onCreationError,
    projection,
    srs
}) {

    const layerRef = useRef(null);

    useEffect(() => {

        createLayer({
            type,
            options,
            position,
            securityToken,
            onCreationError,
            srs,
            map,
            mapId
        }).then((layer) => {
            if (layer) {
                addLayer({
                    map,
                    layer,
                    layerRef
                });
                const visibility = options.visibility !== false;
                setVisibility(visibility, layer, map);
            }
        });

        return () => {
            const layer = layerRef.current;
            if (layer) {
                removeLayer({
                    map,
                    layer
                });
                if (Layers.removeLayer) {
                    Layers.removeLayer(type, options, map, mapId, layer);
                }
            }
        };
    }, []);

    const layer = layerRef.current;

    const oldProps = usePrevious({
        options,
        position,
        srs,
        securityToken
    });

    const optionsString = options && JSON.stringify({
        srs,
        format: options.format,
        _v_: options._v_,
        style: options.style,
        vectorStyle: options.vectorStyle
    }) || '';

    useEffect(() => {
        if (oldProps) {
            Layers.updateLayer(
                type,
                layer,
                generateOpts({
                    options,
                    position,
                    srs: CoordinatesUtils.normalizeSRS(srs),
                    securityToken,
                    onCreationError
                }),
                generateOpts({
                    options: oldProps.options,
                    position: oldProps.position,
                    srs: CoordinatesUtils.normalizeSRS(oldProps.srs),
                    securityToken: oldProps.securityToken,
                    onCreationError
                }),
                map,
                mapId)
                .then((newLayer) => {
                    removeLayer({ map, layer });
                    if (newLayer) {
                        addLayer({
                            map,
                            layer: newLayer,
                            layerRef
                        });
                    }
                });
        }
    }, [ optionsString, position, projection, securityToken ]);

    const visibility = options.visibility !== false;
    useEffect(() => {
        if (map && layer) {
            setVisibility(visibility, layer, map);
        }
    }, [ visibility ]);

    if (children) {
        const layerChildren = layer ? Children.map(children, child => {
            return child ? cloneElement(child, {container: layer, styleName: options && options.styleName}) : null;
        }) : null;
        return (
            <Fragment>{layerChildren}</Fragment>
        );
    }

    return Layers.renderLayer(type, options, map, mapId, layer);
}

export default MapboxLayer;
