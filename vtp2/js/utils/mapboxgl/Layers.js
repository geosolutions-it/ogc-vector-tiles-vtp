/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const layerTypes = {};

var Layers = {

    registerType: function(type, impl) {
        layerTypes[type] = impl;
    },

    createLayer: function(type, options, map) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.create) {
            return layerCreator.create(options, map);
        } else if (layerCreator) {
            // TODO this compatibility workaround should be removed
            // using the same interface
            return layerCreator(options, map);
        }
        return new Promise((resolve) => resolve(null));
    },
    renderLayer: function(type, options, map, mapId, layer) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.render) {
            return layerCreator.render(options, map, mapId, layer);
        }
        return null;
    },
    updateLayer: function(type, layer, newOptions, oldOptions, map, mapId) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.update) {
            return layerCreator.update(layer, newOptions, oldOptions, map, mapId);
        }
        return new Promise((resolve) => resolve(null));
    },
    isValid(type, layer) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.isValid) {
            return layerCreator.isValid(layer);
        }
        return true;
    },
    isSupported(type) {
        return !!layerTypes[type];
    }
};

module.exports = Layers;
