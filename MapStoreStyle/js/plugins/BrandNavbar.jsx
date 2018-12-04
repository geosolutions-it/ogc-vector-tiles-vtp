/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const { getConfiguredPlugin } = require('../../MapStore2/web/client/utils/PluginsUtils');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {userSelector} = require('../../MapStore2/web/client/selectors/security');

class BrandNavbar extends React.Component {

    static propTypes = {
        items: PropTypes.array,
        logo: PropTypes.string
    };

    static defaultProps = {
        logo: '/static/mapstorestyle/img/logo.svg'
    };

    render() {
        const items = [...(this.props.items || [])]
            .filter(({hide}) => !hide || hide && !hide(this.props))
            .sort((a, b) => a.position > b.position ? 1 : -1);
        const plugins = items
            .map(plg => ({
                ...plg,
                Component: getConfiguredPlugin(plg, this.context.loadedPlugins, <div />)
            })) || [];
        return (
            <div className="mst-brand-navbar">
                <div className="mst-brand-navbar-left">
                    <div className="mst-brand-logo">
                        <img src="/static/mapstorestyle/img/ogc-logo.svg"/>
                    </div>
                    <div className="mst-brand-logo">
                        <a href="https://www.geo-solutions.it/" target="_blank">
                            <img src="/static/mapstorestyle/img/geosolutions-logo.png"/>
                        </a>
                    </div>
                </div>
                <div className="mst-brand-navbar-right">
                    {plugins.map(({Component}) => <Component />)}
                    <div className="mst-brand-logo">
                        <a href="https://mapstore.geo-solutions.it/mapstore/" target="_blank">
                            <img src="/static/mapstorestyle/img/mapstore-logo.png"/>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

const selector = createSelector(
    [
        userSelector
    ], (user) => ({
        user
    })
);

const BrandNavbarPlugin = connect(selector)(BrandNavbar);

module.exports = {
    BrandNavbarPlugin
};
