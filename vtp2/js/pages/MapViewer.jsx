/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import url from 'url';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
import { loadMapConfig } from '@mapstore/actions/config';
import { resetControls } from '@mapstore/actions/controls';
import { mapSelector } from '@mapstore/selectors/map';
import Container from '@js/containers/Container';

const urlQuery = url.parse(window.location.href, true).query;

function MapViewer({
    name = 'viewer',
    plugins,
    match
}) {

    const configPlugins = ConfigUtils.getConfigProp('plugins') || {};
    const pagePlugins = {
        desktop: [],
        mobile: []
    };

    const pluginsConfig = {
        desktop: configPlugins[name] || [],
        mobile: configPlugins[name] || []
    };

    return (
        <Container
            id="map-viewer-container"
            pagePluginsConfig={pagePlugins}
            pluginsConfig={pluginsConfig}
            plugins={plugins}
            params={match.params}/>
    );
}

MapViewer.propTypes = {
    name: PropTypes.string,
    mode: PropTypes.string,
    match: PropTypes.object,
    map: PropTypes.object,
    loadMapConfig: PropTypes.func,
    reset: PropTypes.func,
    plugins: PropTypes.object
};

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    map: mapSelector(state)
}),
{
    loadMapConfig,
    reset: resetControls
}
)(MapViewer);
