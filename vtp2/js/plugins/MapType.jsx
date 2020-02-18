/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { Glyphicon, DropdownButton as DropdownButtonRB, MenuItem } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import { changeMapType } from '@mapstore/actions/maptype';
const DropdownButton = tooltip(DropdownButtonRB);

function MapType({
    value,
    options = [
        {
            value: 'openlayers',
            label: 'OpenLayers'
        },
        {
            value: 'mapboxgl',
            label: 'Mapbox GL'
        }
    ],
    onChange = () => {}
}) {
    return (
        <div>
            <DropdownButton
                dropup
                className="square-button-md"
                tooltip="Change map library"
                bsStyle="primary"
                title={<Glyphicon glyph="cog"/>}
                noCaret
                pullRight>
                {options.map((option) => {
                    return (
                        <MenuItem
                            key={option.value}
                            active={option.value === value}
                            onClick={() => onChange(option.value)}>
                            {option.label}
                        </MenuItem>
                    );
                })}
            </DropdownButton>
        </div>
    );
}

const MapTypePlugin = connect((state) => ({ value: get(state, 'maptype.mapType') }), { onChange: changeMapType })(MapType);

export default createPlugin('MapType', {
    component: MapTypePlugin,
    containers: {
        MapFooter: {
            name: 'mapType',
            position: 15,
            tool: true,
            priority: 1
        }
    }
});
