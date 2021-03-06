/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { MapPlugin as MSMapPlugin, reducers, epics } from '@mapstore/plugins/Map';
import { setControlProperty } from '@mapstore/actions/controls';
import SpatialFilterSupport from '@js/plugins/map/openlayers/SpatialFilterSupport';
import OLScaleLine from '@js/plugins/map/openlayers/OLScaleLine';
import { layoutTypeSelector } from '@mapstore/selectors/layout';
import OLVectorFeaturesInfo from '@js/plugins/map/openlayers/OLVectorFeaturesInfo';
import SaveCachedOGCTiles from '@js/plugins/map/openlayers/SaveCachedOGCTiles';
import { selectOGCTileVisibleLayers } from '@js/selectors/layers';

const tools = [
    {
        openlayers: {
            name: 'spatialFilterSupport',
            impl: connect(createSelector([
                state => state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.enabled,
                state => state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.drawType
            ], (enabled, drawType) => ({
                enabled,
                drawType
            })), {
                onAddFeature: setControlProperty.bind(null, 'spatialFilter', 'feature'),
                onRemoveFeature: setControlProperty.bind(null, 'spatialFilter', null)
            })(SpatialFilterSupport)
        },
        mapboxgl: {
            name: 'spatialFilterSupport',
            impl: () => <div></div>
        }
    },
    {
        openlayers: {
            name: 'attribution',
            impl: connect(createSelector([layoutTypeSelector], (layoutType) => ({ layoutType })))(OLScaleLine)
        },
        mapboxgl: {
            name: 'attribution',
            impl: () => <div></div>
        }
    },
    {
        openlayers: {
            name: 'vectorFeaturesInfo',
            impl: connect(createSelector([
                state => state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.enabled
            ], (spatialFilterEnabled) => ({
                enabled: !spatialFilterEnabled
            })))(OLVectorFeaturesInfo)
        },
        mapboxgl: {
            name: 'vectorFeaturesInfo',
            impl: () => <div></div>
        }
    },
    {
        openlayers: {
            name: 'saveCachedOGCTiles',
            impl: connect(
                createSelector(
                    [selectOGCTileVisibleLayers],
                    (layers) => ({
                        layers
                    })),
                {
                    onUpdate: setControlProperty.bind(null, 'cachedTiles', 'values')
                }
            )(SaveCachedOGCTiles)
        },
        mapboxgl: {
            name: 'saveCachedOGCTiles',
            impl: () => <div></div>
        }
    }
];

function MapPlugin({ backgroundColor = '#ddd', ...props }) {
    return (
        <MSMapPlugin
            fonts={null}
            {...props}
            tools={tools}
            options={{
                style: {
                    backgroundColor
                }
            }}
        />
    );
}

export default createPlugin('Map', {
    component: connect((state) => ({
        backgroundColor: state && state.controls && state.controls.mapStyle && state.controls.mapStyle.backgroundColor
    }))(MapPlugin),
    containers: {
        Layout: {
            priority: 1,
            container: 'background'
        }
    },
    reducers,
    epics
});
