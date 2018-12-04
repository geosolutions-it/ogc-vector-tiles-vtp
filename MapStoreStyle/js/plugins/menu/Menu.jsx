/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const PropTypes = require('prop-types');
const {head, isEqual} = require('lodash');
const {createSelector} = require('reselect');
const {compose, shouldUpdate} = require('recompose');
const Menu = require('../../components/Menu');
const BorderLayout = require('../../../MapStore2/web/client/components/layout/BorderLayout');
const { getConfiguredPlugin } = require('../../../MapStore2/web/client/utils/PluginsUtils');
const {userSelector} = require('../../../MapStore2/web/client/selectors/security');

class MenuComponent extends React.Component {

    static propTypes = {
        items: PropTypes.array,
        selected: PropTypes.string,
        onSelect: PropTypes.func,
        tabsProps: PropTypes.func,
        style: PropTypes.object,
        className: PropTypes.string,
        mirror: PropTypes.bool
    };

    static contextTypes = {
        loadedPlugins: PropTypes.object
    };

    static defaultProps = {
        onSelect: () => {},
        tabsProps: () => ({}),
        className: ''
    };

    render() {

        const items = [...(this.props.items || [])]
            .filter(({hide}) => !hide || hide && !hide(this.props))
            .sort((a, b) => a.position > b.position ? 1 : -1);

        const selected = this.props.selected;

        const plugin = head(items
            .filter(( {name}) => name === selected)
            .map(plg => ({
                ...plg,
                Component: getConfiguredPlugin(plg, this.context.loadedPlugins, <div />)
            }))) || {};

        const tabs = items
            .map(({glyph, name, tooltip}) => ({
                id: name,
                name,
                tooltip,
                glyph,
                active: selected === name,
                ...this.props.tabsProps({name})
            }));
        return (
            <div
                className={this.props.className}
                style={this.props.style}>
                <BorderLayout>
                    <Menu
                        tabs={tabs}
                        msStyle="default"
                        onSelect={name => this.props.onSelect(name !== selected && name || '')}
                        width={plugin.size || 0}
                        mirror={this.props.mirror}>
                        {plugin.Component && <plugin.Component />}
                    </Menu>
                </BorderLayout>
            </div>
        );
    }
}

module.exports = compose(
    connect(createSelector(
        [
            userSelector
        ], (user) => ({
            user
        })
    )),
    shouldUpdate((props, nexProps) =>
        props.selected !== nexProps.selected
        || !isEqual(props.user, nexProps.user)
    )
)(MenuComponent);
