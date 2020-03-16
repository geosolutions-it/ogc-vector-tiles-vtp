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
import { projectionSelector } from '@mapstore/selectors/map';

function ProjectionLabel({
    projection,
    projectionsLabels = {
        'EPSG:4326': 'WorldCRS84Quad',
        'EPSG:3857': 'WebMercatorQuad',
        'EPSG:3395': 'WorldMercatorWGS84Quad'
    }
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '4px 8px',
                fontWeight: 'bold'
            }}>
            {projectionsLabels[projection]}
        </div>
    );
}

const ProjectionLabelPlugin = connect(
    createSelector([
        projectionSelector
    ], (projection) => ({
        projection
    })),
)(ProjectionLabel);

export default createPlugin('ProjectionLabel', {
    component: ProjectionLabelPlugin,
    containers: {
        MapFooter: {
            name: 'projection-label',
            position: 15,
            tool: true,
            priority: 1
        }
    }
});
