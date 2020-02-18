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
    return null;
};

export const getStyleLayers = (vectorStyle, source) => {
    return getStyle({ asPromise: true, style: vectorStyle })
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
