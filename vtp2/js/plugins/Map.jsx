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
    }
];

function MapPlugin(props) {
    return (
        <MSMapPlugin
            fonts={null}
            {...props}
            tools={tools}/>
    );
}

export default createPlugin('Map', {
    component: MapPlugin,
    containers: {
        Layout: {
            priority: 1,
            container: 'background'
        }
    },
    reducers,
    epics
});
