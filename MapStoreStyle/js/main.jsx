/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = (config, pluginsDef) => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const {connect} = require('react-redux');
    const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');
    const {setControlProperty} = require('../MapStore2/web/client/actions/controls');
    const startApp = () => {

        const StandardApp = require('../MapStore2/web/client/components/app/StandardApp');
        const {toggleMapInfoState} = require('../MapStore2/web/client/actions/mapInfo');
        const {pages, initialState, storeOpts, appEpics = {}, themeCfg} = config;

        const StandardRouter = connect((state) => ({
            locale: state.locale || {},
            pages
        }))(require('../MapStore2/web/client/components/app/StandardRouter'));

        const {setSupportedLocales} = require('../MapStore2/web/client/epics/localconfig');
        const styleeditorvtpEpics = require('./epics/styleeditorvtp');

        const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
            maptype: require('../MapStore2/web/client/reducers/maptype')
        }, {...appEpics, setSupportedLocales, ...styleeditorvtpEpics});

        const initialActions = [
            setControlProperty.bind(null, 'toolbar', 'expanded', false),
            setControlProperty.bind(null, 'leftmenu', 'activePlugin', 'TOC'),
            toggleMapInfoState
        ];

        const appConfig = {
            storeOpts,
            appEpics,
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardRouter,
            printingEnabled: true,
            themeCfg
        };

        ReactDOM.render(
            <StandardApp {...appConfig}/>,
            document.getElementById('container')
        );
    };

    if (!global.Intl ) {
        // Ensure Intl is loaded, then call the given callback
        LocaleUtils.ensureIntl(startApp);
    } else {
        startApp();
    }
};
