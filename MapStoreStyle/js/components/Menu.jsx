/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Tab = require('./Tab');

module.exports = ({tabs = [], children, size = 'md', msStyle = 'primary', onSelect = () => {}, mirror, width = '100%'}) => (
    <div className={`ms-menu ms-${size} ms-${msStyle}${mirror ? ' ms-mirror' : ''}`}>
        <div className="ms-menu-tabs">
            {tabs.map(({...props}, idx) => (
                <Tab
                    size={size}
                    msStyle={msStyle}
                    {...props}
                    key={idx}
                    onClick={onSelect}
                    mirror={mirror}/>
            ))}
        </div>
        <div className="ms-menu-content" style={{width}}>
            {children}
        </div>
    </div>
);
