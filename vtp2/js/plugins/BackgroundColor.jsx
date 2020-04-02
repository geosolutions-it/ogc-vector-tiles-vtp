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
import { Glyphicon, Button as ButtonRB } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import { setControlProperty } from '@mapstore/actions/controls';
const Button = tooltip(ButtonRB);

function BackgroundColor({
    value,
    onChange = () => {}
}) {
    return (
        <div>
            <Button
                dropup
                className="square-button-md"
                bsStyle="primary"
                tooltip="Toggle change map background color"
                onClick={() => onChange(value === '#dddddd' ? '#221752' : '#dddddd')}>
                <Glyphicon glyph="adjust"/>
            </Button>
        </div>
    );
}

const BackgroundColorPlugin = connect((state) => ({
    value: get(state, 'controls.mapStyle.backgroundColor') || '#dddddd'
}), {
    onChange: setControlProperty.bind(null, 'mapStyle', 'backgroundColor')
})(BackgroundColor);

export default createPlugin('BackgroundColor', {
    component: BackgroundColorPlugin,
    containers: {
        MapFooter: {
            name: 'backgroundColor',
            position: 20,
            tool: true,
            priority: 1
        }
    }
});
