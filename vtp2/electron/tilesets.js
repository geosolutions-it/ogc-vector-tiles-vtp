/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const fs = require('fs-extra');
const path = require('path');
const { remote } = require('electron');
const { Extract: unzipperExtract } = require('unzipper');

const isDev = () => {
    return remote.process.argv[2] === '--dev';
};
const resourcesPath = process.resourcesPath || '';
const msGetTileSets = (_rootPath = 'tilesets/') => {
    const rootPath = isDev() ? _rootPath : path.join(resourcesPath, _rootPath);

    let tileSetsPath = fs.readdirSync(rootPath);

    return Promise.all(
        tileSetsPath.map((tileSet) => {
            const tileSetPath = `${rootPath}${tileSet}`;
            const stats = fs.lstatSync(tileSetPath);
            if (stats.isFile()) {
                const splitTileSet = tileSet.split('.');
                const ext = splitTileSet[splitTileSet.length - 1];
                if (ext === 'zip') {
                    const unzippedPath = `${rootPath}${tileSet.replace(/\.zip/g, '')}`;
                    return fs.createReadStream(tileSetPath)
                        .pipe(unzipperExtract({ path: unzippedPath }))
                        .promise()
                        .then(() => fs.unlinkSync(tileSetPath));
                }
            }
            return new Promise(resolve => resolve());
        })
    ).then(() => {
        tileSetsPath = fs.readdirSync(rootPath);
        const tileSets = tileSetsPath.map((tileSet) => {
            const tileSetPath = `${rootPath}${tileSet}`;
            const stats = fs.lstatSync(tileSetPath);
            if (stats.isDirectory()) {
                const filesPaths = fs.readdirSync(tileSetPath);
                const tileSetMetadataPath = filesPaths.find(filesPath => filesPath === 'tileSetMetadata.json');
                if (tileSetMetadataPath) {
                    const json = fs.readFileSync(`${rootPath}${tileSet}/${tileSetMetadataPath}`, 'utf8');
                    try {
                        const tileSetMetadata = JSON.parse(json);
                        return {
                            ...tileSetMetadata,
                            tileSetPath,
                            title: tileSetMetadata.title || tileSet
                        };
                    } catch (e) {
                        return null;
                    }
                }
            }
            return null;
        }).filter((tileSetMetadata) => tileSetMetadata);
        return tileSets;
    });
};

const msWriteTileSet = (_rootPath = 'tilesets/', tileSet) => {
    const rootPath = isDev() ? _rootPath : path.join(resourcesPath, _rootPath);
    const tileSetPath = `${rootPath}${tileSet.name}`;
    fs.copySync(tileSet.path, tileSetPath);
    return new Promise(resolve => resolve());
};

window.msWriteTileSet = msWriteTileSet;
window.msGetTileSets = msGetTileSets;
