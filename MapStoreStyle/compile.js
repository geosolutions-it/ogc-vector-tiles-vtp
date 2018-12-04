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

    fs.copy('./static/', './www/static/', err =>{
        if(err) return console.error(err);
        console.log('static');
        fs.copy('./dist/', './www/static/mapstorestyle/', err =>{
            if(err) return console.error(err);
            console.log('dist');
            fs.copy('./MapStore2/web/client/translations/', './www/static/mapstorestyle/translations/', err =>{
                if(err) return console.error(err);
                console.log('dist');
            });
            [
                {file: './index.html', name: 'mapstorestyle.html'}
            ].forEach(({file, name}) => {
                fs.copy(`./${file}`, `./www/${name}`, err => {
                    if (err) return console.error(err);
                    console.log(`./${file} moved!`);
                });
            });
        });
    });
}).catch(err => {
    console.error(err);
});