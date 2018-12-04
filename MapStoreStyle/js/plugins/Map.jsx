/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {connect} = require('react-redux');
const ContainerDimensions = require('react-container-dimensions').default;
const {compose, lifecycle} = require('recompose');
const {createSelector} = require('reselect');
const {get, debounce} = require('lodash');

const loadingState = require('../../MapStore2/web/client/components/misc/enhancers/loadingState');
const emptyState = require('../../MapStore2/web/client/components/misc/enhancers/emptyState');
const {MapPlugin, reducers, epics} = require('../../MapStore2/web/client/plugins/Map');
const {resizeMap} = require('../../MapStore2/web/client/actions/map');
const {mapSelector} = require('../../MapStore2/web/client/selectors/map');

const selector = createSelector(
    [
        mapSelector,
        state => get(state, 'mapInitialConfig.loadingError.data')
    ], (map, loadingError) => ({
        map,
        loadingError
    })
);

const ResizableMap = compose(
    connect(selector, { onResizeMap: resizeMap }),
    loadingState(({map, loadingError}) => !map && !loadingError),
    emptyState(
        ({loadingError}) => loadingError,
        {
            title: 'Missing Map',
            description: 'Check if configuration of the map has been loaded',
            glyph: '1-map'
        }
    ),
    lifecycle({
        componentWillMount() {
            this.resize = debounce(() => {
                this.props.onResizeMap();
            }, 20);
        },
        componentWillReceiveProps(newProps) {
            if (newProps.width !== this.props.width
            || newProps.height !== this.props.height) {
                this.resize.cancel();
                this.resize();
            }
        }
    })
)(MapPlugin);

class ResizableContainer extends React.Component {
    render() {
        return (
            <ContainerDimensions>
            {({width, height}) =>
                <ResizableMap
                    fonts={false}
                    width={width}
                    height={height}
                    {...this.props}/>}
            </ContainerDimensions>
        );
    }
}

module.exports = {
    MapPlugin: ResizableContainer,
    reducers,
    epics
};
