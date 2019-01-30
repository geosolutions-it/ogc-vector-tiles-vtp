/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const { connect } = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

const { loadMapConfig } = require('../../MapStore2/web/client/actions/config');
const { resetControls } = require('../../MapStore2/web/client/actions/controls');
const { mapSelector } = require('../../MapStore2/web/client/selectors/map');
const HolyGrail = require('../../MapStore2/web/client/containers/HolyGrail');

class MapViewer extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        map: PropTypes.object,
        loadMapConfig: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: 'viewer',
        mode: 'desktop',
        loadMapConfig: () => { },
        reset: () => { },
        map: {}
    };

    componentWillMount() {
        if (!this.props.map) {
            this.props.reset();
            this.props.loadMapConfig('/static/mapstorestyle/wms-base-map.json');
        }
    }

    render() {
        const plugins = ConfigUtils.getConfigProp('plugins') || {};
        const pagePlugins = {
            desktop: [],
            mobile: []
        };
        const pluginsConfig = {
            desktop: plugins[this.props.name] || [],
            mobile: plugins[this.props.name] || []
        };
        return (
            <HolyGrail
                id="map-viewer-container"
                pagePluginsConfig={pagePlugins}
                pluginsConfig={pluginsConfig}
                plugins={this.props.plugins}
                params={this.props.match.params}/>
        );
    }
}

module.exports = connect((state) => ({
        mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
        map: mapSelector(state)
    }),
    {
        loadMapConfig,
        reset: resetControls
    }
)(MapViewer);
