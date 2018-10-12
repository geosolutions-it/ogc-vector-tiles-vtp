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

    fs.copy('./src/mapstyles', './www/mapstyles', err => {
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

    [
        './index.html',
        './wfs.html',
        './wmts.html',
        './wfsConfig.json',
        './wmts.png',
        './wfs.png',
        'geosolutions-logo.png',
        'ogc-logo.png',
        'datasets.html',
        'datasets.png',
        'datasetConfig.json'

    ].forEach(file => {
        fs.copy(`./${file}`, `./www/${file}`, err => {
            if (err) return console.error(err);
            console.log(`./${file} moved!`);
        });
    })


}).catch(err => {
    console.error(err);
});