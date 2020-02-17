/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {createSelector} = require('reselect');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { Glyphicon, DropdownButton: DropdownButtonRB, MenuItem } = require('react-bootstrap');
const tooltip = require('@mapstore/components/misc/enhancers/tooltip');
const DropdownButton = tooltip(DropdownButtonRB);
const {changeMapCrs} = require('@mapstore/actions/map');
const {setInputValue} = require('@mapstore/actions/crsselector');
const CoordinatesUtils = require('@mapstore/utils/CoordinatesUtils');
const {isCesium} = require('@mapstore/selectors/maptype');
const {connect} = require('react-redux');
const {projectionDefsSelector, projectionSelector} = require('@mapstore/selectors/map');
const {bottomPanelOpenSelector} = require('@mapstore/selectors/maplayout');
const {printSelector, measureSelector} = require('@mapstore/selectors/controls');
const {editingSelector} = require('@mapstore/selectors/annotations');
const {crsInputValueSelector} = require('@mapstore/selectors/crsselector');
const {currentBackgroundSelector} = require('@mapstore/selectors/layers');
const {queryPanelSelector} = require('@mapstore/selectors/controls');
const {modeSelector} = require('@mapstore/selectors/featuregrid');
const {error} = require('@mapstore/actions/notifications');
const {userRoleSelector} = require('@mapstore/selectors/security');
const {mapTypeSelector} = require('@mapstore/selectors/maptype');
const {indexOf, has, includes} = require('lodash');

class Selector extends React.Component {
    static propTypes = {
        selected: PropTypes.string,
        value: PropTypes.string,
        projections: PropTypes.array,
        availableCRS: PropTypes.object,
        filterAllowedCRS: PropTypes.array,
        projectionDefs: PropTypes.array,
        additionalCRS: PropTypes.object,
        setCrs: PropTypes.func,
        typeInput: PropTypes.func,
        enabled: PropTypes.bool,
        currentBackground: PropTypes.object,
        onError: PropTypes.func,
        allowedRoles: PropTypes.array,
        currentRole: PropTypes.string,
        crsProperties: PropTypes.object,
        mapType: PropTypes.string
    };
    static defaultProps = {
        availableCRS: CoordinatesUtils.getAvailableCRS(),
        setCrs: ()=> {},
        typeInput: () => {},
        enabled: true,
        allowedRoles: ['ALL'],
        crsProperties: {}
    };

    render() {

        let list = [];
        let availableCRS = {};
        if (Object.keys(this.props.availableCRS).length) {
            availableCRS = CoordinatesUtils.filterCRSList(this.props.availableCRS, this.props.filterAllowedCRS, this.props.additionalCRS, this.props.projectionDefs );
        }
        for (let crs in availableCRS) {
            if (availableCRS.hasOwnProperty(crs)) {
                list.push({value: crs});
            }
        }
        const currentCRS = CoordinatesUtils.normalizeSRS(this.props.selected, this.props.filterAllowedCRS);
        const compatibleCrs = ['EPSG:4326', 'EPSG:3857', 'EPSG:900913'];
        const changeCrs = (crs) => {
            if ( indexOf(compatibleCrs, crs) > -1 || this.props.currentBackground.type === "wms" || this.props.currentBackground.type === "empty" ||
            (this.props.currentBackground.allowedSRS && has(this.props.currentBackground.allowedSRS, crs))) {
                this.props.setCrs(crs);
            } else {
                this.props.onError({
                    title: "error",
                    message: "notification.incompatibleBackgroundAndProjection",
                    action: {
                        label: "close"
                    },
                    position: "tc",
                    uid: "3"
                });
            }
        };
        const allowed = (role) => includes(this.props.allowedRoles, "ALL") ? true : includes(role, this.props.allowedRoles);

        return (this.props.enabled && allowed(this.props.currentRole))
            ? (<DropdownButton
                dropup
                className="square-button-md"
                tooltip="Change map library"
                bsStyle="primary"
                title={<Glyphicon glyph="crs"/>}
                noCaret
                pullRight
                tooltip="Select projection"
                tooltipPosition="top">
                {list
                    .filter((crs) => this.props.mapType === 'mapboxgl' && (crs.value === 'EPSG:3857' || crs.value === 'EPSG:900913') || this.props.mapType !== 'mapboxgl')
                    .map((crs) => {
                        return (
                            <MenuItem
                                key={crs.value}
                                active={crs.value === currentCRS}
                                onClick={() => changeCrs(crs.value)}>
                                {this.props.crsProperties && this.props.crsProperties[crs.value] && this.props.crsProperties[crs.value].label || crs.value}
                            </MenuItem>
                        );
                    })}
            </DropdownButton>)
            : null;
    }
}

const crsSelector = connect(
    createSelector(
        userRoleSelector,
        currentBackgroundSelector,
        projectionSelector,
        projectionDefsSelector,
        crsInputValueSelector,
        modeSelector,
        isCesium,
        bottomPanelOpenSelector,
        measureSelector,
        queryPanelSelector,
        printSelector,
        editingSelector,
        mapTypeSelector,
        ( currentRole, currentBackground, selected, projectionDefs, value, mode, cesium, bottomPanel, measureEnabled, queryPanelEnabled, printEnabled, editingAnnotations, mapType) => ({
            currentRole,
            currentBackground,
            selected,
            projectionDefs,
            value,

            enabled: (mode !== 'EDIT') && !cesium && !bottomPanel && !measureEnabled && !queryPanelEnabled && !printEnabled && !editingAnnotations,
            mapType
        }),
    ), {
        typeInput: setInputValue,
        setCrs: changeMapCrs,
        onError: error
    }
)(Selector);


/**
  * CRSSelector Plugin is a plugin that switches from to the pre-configured projections.
  * it gets displayed into the mapFooter plugin
  * @name CRSSelector
  * @memberof plugins
  * @class
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {string[]} cfg.filterAllowedCRS list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {object} cfg.additionalCRS additional crs added to the list. The label param is used after in the combobox.
  * @prop {array} cfg.allowedRoles list of the authorized roles that can use the plugin, if you want all users to access the plugin, add a "ALL" element to the array.
  * @example
  * // If you want to add some crs you need to provide a definition and adding it in the additionalCRS property
  * // Put the following lines at the first level of the localconfig
  * {
  *   "projectionDefs": [{
  *     "code": "EPSG:3003",
  *     "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  *     "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  *     "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
  *   }]
  * }
  * @example
  * // And configure the new projection for the plugin as below:
  * { "name": "CRSSelector",
  *   "cfg": {
  *     "additionalCRS": {
  *       "EPSG:3003": { "label": "EPSG:3003" }
  *     },
  *     "filterAllowedCRS": ["EPSG:4326", "EPSG:3857"],
  *     "allowedRoles" : ["ADMIN", "USER", "ALL"]
  *   }
  * }
*/
module.exports = {
    CRSSelectorPlugin: assign(crsSelector, {
        disablePluginIf: "{state('mapType') === 'leaflet'}",
        MapFooter: {
            name: "crsSelector",
            position: 10,
            tool: true,
            priority: 1
        }
    }),
    reducers: {crsselector: require('@mapstore/reducers/crsselector')},
    epics: {}
};
