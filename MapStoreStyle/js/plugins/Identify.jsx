/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const assign = require('object-assign');
const {connect} = require('react-redux');
const {head} = require('lodash');

const {createSelector} = require('reselect');
const {Glyphicon: GlyphiconRB} = require('react-bootstrap');

const tooltip = require('../../MapStore2/web/client/components/misc/enhancers/tooltip');
const Glyphicon = tooltip(GlyphiconRB);

const {mapSelector} = require('../../MapStore2/web/client/selectors/map');
const {layersSelector} = require('../../MapStore2/web/client/selectors/layers');

const {getFeatureInfo, getVectorInfo, showMapinfoMarker, hideMapinfoMarker, showMapinfoRevGeocode, hideMapinfoRevGeocode, noQueryableLayers, clearWarning} = require('../../MapStore2/web/client/actions/mapInfo');
const {changeMousePointer} = require('../../MapStore2/web/client/actions/map');
const {updateCenterToMarker, closeIdentify, purgeMapInfoResults, toggleMapInfoState} = require('../../MapStore2/web/client/actions/mapInfo');
const {currentLocaleSelector} = require('../../MapStore2/web/client/selectors/locale');
const loadingState = require('../../MapStore2/web/client/components/misc/enhancers/loadingState');
const emptyState = require('../../MapStore2/web/client/components/misc/enhancers/emptyState');

const {compose, defaultProps, toClass, withState} = require('recompose');
const MapInfoUtils = require('../../MapStore2/web/client/utils/MapInfoUtils');
const {defaultViewerHandlers} = require('../../MapStore2/web/client/components/data/identify/enhancers/defaultViewer');
const {identifyLifecycle, switchControlledIdentify} = require('../../MapStore2/web/client/components/data/identify/enhancers/identify');
const {mapLayoutValuesSelector} = require('../../MapStore2/web/client/selectors/maplayout');
const BorderLayout = require('../../MapStore2/web/client/components/layout/BorderLayout');
const SideGrid = require('../../MapStore2/web/client/components/misc/cardgrids/SideGrid');

const Resizable = require('react-resizable').Resizable;

const getIconProps = ({type = ''}) => {
    const icons = ['polygon', 'line', 'point'];
    const glyph = head(icons.filter(icon => type.toLowerCase().indexOf(icon) !== -1 )) || 'point-dash';
    const tooltips = {
        polygon: 'Polygon',
        line: 'Line',
        point: 'Point'
    };
    return {
        glyph,
        tooltip: tooltips[glyph],
        tooltipPosition: 'left'
    };
};

const Item = withState('expanded', 'onClick')(({geometry, properties, onClick, expanded}) => (
    <div className={`mst-identify-feature-body ${expanded && ' expanded' || ''}`}>
        <div className="mst-identify-feature-head" onClick={() => onClick(!expanded)}>
            <div className="mst-identify-feature-body-icon">
                <Glyphicon {...getIconProps(geometry || {})}/>
            </div>
            <div className="mst-identify-feature-body-info">
                {properties.layer || properties[Object.keys(properties)[0]]}
            </div>
        </div>
        {expanded && <div className="mst-identify-feature-list">
            {Object.keys(properties)
                .filter(key => key !== 'layer')
                .map(key => <div key={key} className="mst-identify-feature-item" ><div>{key}:</div><div>{properties[key]}</div></div>)}
        </div>}
    </div>
));

const IdentifyBody = compose(
    emptyState(({requests = []}) => requests.length === 0, {
        glyph: 'point',
        title: 'Get Features',
        description: 'click on map'
    }),
    loadingState(({responses = []}) => responses.length === 0),
    emptyState(({responses = []}) => {
        const validatorFormat = MapInfoUtils.getValidator();
        const invalidResponses = validatorFormat.getNoValidResponses(responses);
        return responses.length === invalidResponses.length;
    }, {
        glyph: 'exclamation-mark',
        title: 'No Features',
        description: 'click again on map'
    })
)(({
    responses = []
}) => {
    const validatorFormat = MapInfoUtils.getValidator();
    const validResponses = validatorFormat.getValidResponses(responses);
    return (
        <BorderLayout
            className="mst-identify"
            header={<div style={{fontSize: 18, padding: 4, borderBottom: '1px solid #dddddd'}}><Glyphicon style={{fontSize: 18}} glyph="point"/></div>}>
            <SideGrid
                size="sm"
                items={validResponses.map(({layerMetadata, response = {}}) => ({
                    title: layerMetadata.title,
                    body: <div>
                        {(response.features || []).map(({geometry, properties = {}}) => (
                            <Item geometry={geometry} properties={properties}/>
                        ))}
                    </div>
                }))}/>
        </BorderLayout>
    );
});

const Identify = withState('state', 'setState', {width: 150, height: 200, minConstraints: [150, 200]})(({setState, state, ...props}) => {

    return (
        <Resizable
            {...state}
            onResize={(e, data) => setState({...state, ...data.size})}>
        <div
            className="shadow-far"
            style={{position: 'absolute', width: state.width, height: state.height, left: 5, top: 5, zIndex: 9999, backgroundColor: '#ffffff'}}>
            <IdentifyBody {...props}/>
        </div>
        </Resizable>
    );
});

const identifyDefaultProps = defaultProps({
    enabled: false,
    draggable: true,
    collapsible: false,
    requests: [],
    responses: [],
    buffer: 2,
    viewerOptions: {},
    purgeResults: () => {},
    buildRequest: MapInfoUtils.buildIdentifyRequest,
    localRequest: () => {},
    sendRequest: () => {},
    showMarker: () => {},
    hideMarker: () => {},
    noQueryableLayers: () => {},
    clearWarning: () => {},
    changeMousePointer: () => {},
    showRevGeocode: () => {},
    hideRevGeocode: () => {},
    containerProps: {
        continuous: false
    },
    showModalReverse: false,
    reverseGeocodeData: {},
    enableRevGeocode: true,
    wrapRevGeocode: false,
    queryableLayersFilter: MapInfoUtils.defaultQueryableFilter,
    style: {},
    point: {},
    layer: null,
    map: {},
    layers: [],
    maxItems: 10,
    excludeParams: ["SLD_BODY"],
    includeOptions: [
        "buffer",
        "cql_filter",
        "filter",
        "propertyName"
    ],
    panelClassName: "modal-dialog info-panel modal-content",
    headerClassName: "modal-header",
    bodyClassName: "modal-body info-wrap",
    dock: true,
    headerGlyph: "",
    closeGlyph: "1-close",
    className: "square-button",
    allowMultiselection: false,
    currentLocale: 'en-US',
    fullscreen: false,
    showTabs: true,
    showCoords: true,
    showLayerTitle: true,
    position: 'right',
    size: 660,
    // getButtons: defaultIdentifyButtons,
    showFullscreen: false,
    validator: MapInfoUtils.getValidator,
    zIndex: 1050
});

const selector = createSelector([
    (state) => state.mapInfo && state.mapInfo.enabled || state.controls && state.controls.info && state.controls.info.enabled || false,
    (state) => state.mapInfo && state.mapInfo.responses || [],
    (state) => state.mapInfo && state.mapInfo.requests || [],
    (state) => state.mapInfo && state.mapInfo.infoFormat,
    mapSelector,
    layersSelector,
    (state) => state.mapInfo && state.mapInfo.clickPoint,
    (state) => state.mapInfo && state.mapInfo.clickLayer,
    (state) => state.mapInfo && state.mapInfo.showModalReverse,
    (state) => state.mapInfo && state.mapInfo.reverseGeocodeData,
    (state) => state.mapInfo && state.mapInfo.warning,
    currentLocaleSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    state => state.mapInfo && state.mapInfo.clickedFeatures
], (enabled, responses, requests, format, map, layers, point, layer, showModalReverse, reverseGeocodeData, warning, currentLocale, dockStyle, clickedFeatures) => ({
    enabled, responses, requests, format, map, layers, point, layer, showModalReverse, reverseGeocodeData, warning, currentLocale, dockStyle, clickedFeatures
}));

const IdentifyPlugin = compose(
    connect(selector, {
        sendRequest: getFeatureInfo,
        localRequest: getVectorInfo,
        purgeResults: purgeMapInfoResults,
        closeIdentify,
        changeMousePointer,
        showMarker: showMapinfoMarker,
        noQueryableLayers,
        clearWarning,
        hideMarker: hideMapinfoMarker,
        showRevGeocode: showMapinfoRevGeocode,
        hideRevGeocode: hideMapinfoRevGeocode,
        onEnableCenterToMarker: updateCenterToMarker.bind(null, 'enabled')
    }),
    identifyDefaultProps,
    switchControlledIdentify,
    defaultViewerHandlers,
    identifyLifecycle,
    emptyState(({enabled}) => !enabled, {
        glyph: 'point',
        title: 'Get Features',
        description: 'click on map'
    }, () => null)
)(toClass(Identify));

module.exports = {
    IdentifyPlugin: assign(IdentifyPlugin, {
        Toolbar: {
            name: 'info',
            position: 6,
            tooltip: "info.tooltip",
            icon: <Glyphicon glyph="map-marker"/>,
            help: 'help',
            action: toggleMapInfoState,
            alwaysVisible: true,
            selector: (state) => ({
                bsStyle: state.mapInfo && state.mapInfo.enabled ? "success" : "primary",
                active: !!(state.mapInfo && state.mapInfo.enabled)
            })
        }
    }),
    reducers: {
        mapInfo: require('../../MapStore2/web/client/reducers/mapInfo')
    },
    epics: require('../../MapStore2/web/client/epics/identify')
};
