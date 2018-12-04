/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const tooltip = require('../../MapStore2/web/client/components/misc/enhancers/tooltip');
const {Button: ButtonRB, Glyphicon} = require('react-bootstrap');
const Button = tooltip(ButtonRB);

module.exports = ({id, active, glyph = '1-layer', size = '', msStyle, btnProps = {}, mirror, onClick = () => {}, ...props}) => (
    <div className="ms-menu-tab">
        {mirror && <div className="ms-tab-arrow">
            {active && <div className="ms-arrow-mirror"/>}
        </div>}
        <Button
            {...btnProps}
            active={active}
            bsStyle={msStyle}
            tooltip={props.tooltip}
            className={`square-button${size ? `-${size}` : ''} ${mirror ? 'ms-menu-btn-mirror' : 'ms-menu-btn'}`}
            onClick={() => onClick(id)}>
            <Glyphicon glyph={glyph}/>
        </Button>
        {!mirror && <div className="ms-tab-arrow">
            {active && <div className="ms-arrow"/>}
        </div>}
    </div>
);
