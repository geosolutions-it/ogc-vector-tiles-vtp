/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { withResizeDetector } from 'react-resize-detector';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import ogcLogo from '@js/plugins/img/ogc-logo.png';
import geosolutionsLogo from '@js/plugins/img/geosolutions-logo.png';
import geosolutionsLogoSm from '@mapstore/product/plugins/attribution/geosolutions-brand-sm.png';
function Logo({
    title = 'MapStore - VTP Phase2',
    width
}) {
    return (
        <div
            key="logo-header"
            className="ms-logo-header"
            style={width < 768 ? { flex: 1 } : {}}>
            <img src={ogcLogo}/>
            <img src={width < 768 ? geosolutionsLogoSm : geosolutionsLogo}/>
            <div style={width < 768 ? { fontSize: 14 } : {}}>{title}</div>
        </div>
    );
}

const LogoPlugin = withResizeDetector(Logo);

export default createPlugin('Logo', {
    component: LogoPlugin,
    containers: {
        OmniBar: {
            name: 'logo',
            position: 0,
            tool: true,
            priority: 1
        }
    }
});
