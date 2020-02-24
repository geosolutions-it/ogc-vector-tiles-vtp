/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

const packager = require('electron-packager');
const fs = require('fs-extra');
const path = require('path');

const vtp2BuildDirectory = path.join(__dirname, '..', 'build');

let platform = process.argv[2];

const platformOptions = {
    /* not working
    macos: {
        platform: 'darwin',
        arch: 'x64'
    },
    */
    windows: {
        platform: 'win32',
        arch: 'ia32'
    },
    linux: {
        platform: 'linux',
        arch: 'x64'
    }
};

if (!platformOptions[platform]) {
    console.log(' ');
    console.log(' -------------------------------------------------------------------------------');
    console.log('  ERROR: Missing platform argument');
    console.log(' ');
    console.log('  Windows -> npm run build windows');
    console.log('  Linux -> npm run build linux');
    // console.log('  MacOS -> npm run build macos');
    console.log(' -------------------------------------------------------------------------------');
    return console.log(' ');
}

if (!fs.existsSync(vtp2BuildDirectory)) {
    console.log(' ');
    console.log(' -------------------------------------------------------------------------------');
    console.log('  ERROR: Missing web app build folder');
    console.log(' ');
    console.log('  create the web app build in the vtp2/ directory');
    console.log('  use these commands starting from this directory');
    console.log(' ');
    console.log('  cd ..');
    console.log('  npm run build');
    console.log('  cd ./electron');
    console.log('  npm run build');
    console.log(' -------------------------------------------------------------------------------');
    return console.log(' ');
}

const options = {
    dir: '.',
    name: 'vtp2',
    overwrite: true,
    platform: platformOptions[platform].platform,
    arch: platformOptions[platform].arch,
    prune: true,
    out: 'release-builds',
    ignore: [
        /build\.js/,
        /dev\.html/
    ]
};

function copyAdditionalResources(additionalResources) {
    return new Promise(function(resolve, reject) {
        console.log(' - copy additional resources');
        try {
            additionalResources.forEach(function(additionalResource) {
                fs.copySync(additionalResource[0], additionalResource[1]);
                console.log(`   - ${additionalResource[0]} copied`);
            });
            if (additionalResources.length === 0) console.log('   - no additional resources to copy');
        } catch(e) {
            return reject(e);
        }
        return resolve();
    });
}

return packager(options)
    .then((packageDirectories) => {
        const packageDirectory = packageDirectories[0];
        return packageDirectory;
    })
    .then((packageDirectory) => {

        const resourcePath = path.join(__dirname, packageDirectory, 'resources');
        const resourceAppPath = path.join(__dirname, packageDirectory, 'resources', 'app');

        const additionalResources = [
            [path.join(vtp2BuildDirectory, 'dist'), path.join(resourceAppPath, 'dist')],
            [path.join(vtp2BuildDirectory, 'static'), path.join(resourceAppPath, 'static')],
            [path.join(vtp2BuildDirectory, 'MapStore2'), path.join(resourcePath, 'MapStore2')],
            [path.join(__dirname, 'tilesets'), path.join(resourcePath, 'tilesets')]
        ];

        fs.removeSync(path.join(resourceAppPath, 'tilesets'));
        fs.removeSync(path.join(resourceAppPath, 'node_modules'));
        fs.removeSync(path.join(resourceAppPath, '.gitignore'));
        fs.removeSync(path.join(resourceAppPath, 'package-lock.json'));

        copyAdditionalResources(additionalResources);

        return packageDirectory;
    })
    .then((packageDirectory) => {
        console.log(' -------------------------------------------------------------------------------');
        console.log('  SUCCESS: generated package in:');
        console.log('  ' + path.join(__dirname, packageDirectory));
        console.log(' -------------------------------------------------------------------------------');
        return console.log(' ');
    })
    .catch((error) => {
        console.log(' -------------------------------------------------------------------------------');
        console.log('  ERROR');
        console.log(error);
        console.log(' -------------------------------------------------------------------------------');
        return console.log(' ');
    });
