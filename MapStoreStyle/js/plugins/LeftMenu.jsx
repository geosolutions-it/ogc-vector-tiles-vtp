/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {get} = require('lodash');
const {createSelector} = require('reselect');
const {compose} = require('recompose');
const {setControlProperty} = require('../../MapStore2/web/client/actions/controls');
const Menu = require('./menu/Menu');

class MenuComponent extends React.Component {

    render() {
        return (
            <Menu
                className="shadow-far"
                style={{
                    zIndex: 2,
                    order: -1
                }}
                tabsProps={({name}) => ({
                    btnProps: {
                        tooltip: name,
                        tooltipPosition: 'right'
                    }
                })}
                {...this.props}/>
        );
    }
}

const selector = createSelector(
    [
        state => get(state, 'controls.leftmenu.activePlugin')
    ], (selected) => ({
        selected
    })
);

const LeftMenuPlugin = compose(
    connect(selector, { onSelect: setControlProperty.bind(null, 'leftmenu', 'activePlugin') })
)(MenuComponent);

module.exports = {
    LeftMenuPlugin,
    reducers: {}
};
