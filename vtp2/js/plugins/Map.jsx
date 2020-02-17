/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { MapPlugin as MSMapPlugin, reducers, epics } from '@mapstore/plugins/Map';

const tools = [];

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
