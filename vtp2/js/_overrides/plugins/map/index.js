/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');

const {creationError, changeMapView, clickOnMap} = require('@mapstore/actions/map');
const {layerLoading, layerLoad, layerError} = require('@mapstore/actions/layers');
const {changeMousePosition} = require('@mapstore/actions/mousePosition');
const {changeMeasurementState, changeGeometry, resetGeometry, updateMeasures} = require('@mapstore/actions/measurement');
const {measurementSelector} = require('@mapstore/selectors/measurement');
const {changeSelectionState} = require('@mapstore/actions/selection');
const {changeLocateState, onLocateError} = require('@mapstore/actions/locate');
const {changeDrawingStatus, endDrawing, setCurrentStyle, geometryChanged, drawStopped, selectFeatures, drawingFeatures} = require('@mapstore/actions/draw');
const {updateHighlighted} = require('@mapstore/actions/highlight');
const {warning} = require('@mapstore/actions/notifications');
const {connect} = require('react-redux');
const assign = require('object-assign');
const {projectionDefsSelector} = require('@mapstore/selectors/map');

const Empty = () => { return <span/>; };

module.exports = (mapType, actions) => {

    let components;
    if (mapType === 'mapboxgl') {
        components = require('@js/plugins/map/' + mapType + '/index');
    } else {
        components = require('@mapstore/plugins/map/' + mapType + '/index');
    }
    const LMap = connect((state) => ({
        projectionDefs: projectionDefsSelector(state),
        mousePosition: state.mousePosition || {enabled: false}
    }), assign({}, {
        onCreationError: creationError,
        onMapViewChanges: changeMapView,
        onClick: clickOnMap,
        onMouseMove: changeMousePosition,
        onLayerLoading: layerLoading,
        onLayerLoad: layerLoad,
        onLayerError: layerError,
        onWarning: warning
    }, actions), (stateProps, dispatchProps, ownProps) => {
        return assign({}, ownProps, stateProps, assign({}, dispatchProps, {
            onMouseMove: stateProps.mousePosition.enabled ? dispatchProps.onMouseMove : () => {}
        }));
    })(components.LMap);

    const MeasurementSupport = connect((state) => ({
        enabled: state.controls && state.controls.measure && state.controls.measure.enabled || false,
        // TODO TEST selector to validate the feature: filter the coords, if length >= minValue return ft validated (close the polygon) else empty ft
        measurement: measurementSelector(state),
        useTreshold: state.measurement && state.measurement.useTreshold || null,
        uom: state.measurement && state.measurement.uom || {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        }
    }), {
        changeMeasurementState,
        updateMeasures,
        resetGeometry,
        changeGeometry
    })(components.MeasurementSupport || Empty);

    const Locate = connect((state) => ({
        status: state.locate && state.locate.state,
        messages: state.locale && state.locale.messages ? state.locale.messages.locate : undefined
    }), {
        changeLocateState,
        onLocateError
    })(components.Locate || Empty);

    const DrawSupport = connect((state) =>
        state.draw || {}, {
        onChangeDrawingStatus: changeDrawingStatus,
        onEndDrawing: endDrawing,
        onGeometryChanged: geometryChanged,
        onSelectFeatures: selectFeatures,
        onDrawingFeatures: drawingFeatures,
        onDrawStopped: drawStopped,
        setCurrentStyle: setCurrentStyle
    })( components.DrawSupport || Empty);

    const HighlightSupport = connect((state) =>
        state.highlight || {}, {updateHighlighted})( components.HighlightFeatureSupport || Empty);

    const SelectionSupport = connect((state) => ({
        selection: state.selection || {}
    }), {
        changeSelectionState
    })(components.SelectionSupport || Empty);

    if (mapType === 'mapboxgl') {
        require('@js/components/map/' + mapType + '/plugins/index');
    } else {
        require('@mapstore/components/map/' + mapType + '/plugins/index');
    }
    const LLayer = connect(null, {onWarning: warning})( components.Layer || Empty);

    return {
        Map: LMap,
        Layer: LLayer,
        Feature: components.Feature || Empty,
        tools: {
            measurement: MeasurementSupport,
            locate: Locate,
            overview: components.Overview || Empty,
            scalebar: components.ScaleBar || Empty,
            draw: DrawSupport,
            highlight: HighlightSupport,
            selection: SelectionSupport
        }
    };
};
