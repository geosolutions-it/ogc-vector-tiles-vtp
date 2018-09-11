/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

const fs = require('fs-extra');

fs.emptyDir('./www').then(() => {
    console.log('www empty!');

    fs.copy('./dist', './www/dist', err => {
        if (err) return console.error(err);
        console.log('dist moved!');
    });

    fs.copy('./mapstyles', './www/mapstyles', err => {
        if (err) return console.error(err);
        console.log('mapstyles moved!');

        fs.unlink('./www/mapstyles/mapboxstyle.js', () => {
            if (err) return console.error(err);
            console.log('mapboxstyle.js removed!');
        });
    });

    fs.copy('./sprites', './www/sprites', err => {
        if (err) return console.error(err);
        console.log('sprites moved!');
    });

    fs.copy('./index.html', './www/index.html', err => {
        if (err) return console.error(err);
        console.log('index.html moved!');
    });

}).catch(err => {
    console.error(err);
});