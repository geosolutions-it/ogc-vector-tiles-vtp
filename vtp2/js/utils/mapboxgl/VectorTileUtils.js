/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '@mapstore/libs/ajax';
import { convertStyle } from '@mapstore/utils/VectorStyleUtils';
import uuidv1 from 'uuid/v1';
import tinycolor from 'tinycolor2';
const colors = ["#c3e2df", "#c8d0a1", "#9ea576", "#7d8861", "#4e7265", "#35513a", "#2a3320", "#352e2a", "#534745", "#756359", "#9d896a", "#e7e9dd"];
const getStyle = (options) => {
    if (options.style && options.style.url) {
        return axios.get(options.style.url)
            .then(response => {
                return convertStyle(options.style.format, 'mbstyle', response.data);
            });
    }
    if (options.style && options.style.body) {
        return convertStyle(options.style.format, 'mbstyle', options.style.body);
    }

    const tilingSchemeId = options && options.tilingSchemeId;
    const layers = options && options.metadata && options.metadata[tilingSchemeId] && options.metadata[tilingSchemeId].layers;
    if (layers) {
        const styleLayers = layers.map((layer) => {
            const { geometryType = '', id } = layer;
            const color = tinycolor(colors[Math.floor(Math.random() * colors.length)]).toHexString();
            if (geometryType.indexOf('point') !== -1) {
                return {
                    'type': 'circle',
                    'source-layer': id,
                    'paint': {
                        'circle-radius': 4,
                        'circle-color': color
                    }
                };
            }
            if (geometryType.indexOf('line') !== -1) {
                return {
                    'type': 'line',
                    'source-layer': id,
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': color,
                        'line-width': 2
                    }
                };
            }
            if (geometryType.indexOf('polygon') !== -1) {
                return {
                    'type': 'fill',
                    'source-layer': id,
                    'paint': {
                        'fill-color': color,
                        'fill-opacity': 0.4
                    }
                };
            }
            return null;
        }).filter(val => val);
        return new Promise((resolve) => resolve(styleLayers.length > 0 ? { layers: styleLayers } : null));
    }

    return new Promise((resolve) => resolve(null));
};

export const getStyleLayers = (vectorStyle, source, options) => {
    return getStyle({ asPromise: true, style: vectorStyle, ...options })
        .then((style) => {
            if (style && style.layers) {
                return {
                    layers: style.layers
                        .filter((l) => l.type !== 'background')
                        .map((l) => ({
                            ...l,
                            id: uuidv1(),
                            source
                        }))
                };
            }
            return {};
        }).catch(() => {
            // TODO: error notifications
            return {};
        });
};
