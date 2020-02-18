/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import find from 'lodash/find';
import VectorImageTile from 'ol/VectorImageTile';

function SaveCachedOGCTiles({
    map,
    layers = [],
    onUpdate = () => {}
}) {

    const olLayers = map.getLayers().getArray();
    if (olLayers) {
        const cachedTiles = olLayers
            .filter((olLayer) => find(layers, (layer) => layer.id === olLayer.getProperties().msId))
            .map((olLayer) => {
                const source = olLayer.getSource();
                const tileCache = source && source.tileCache;
                if (tileCache) {
                    const tiles = tileCache.getValues().map((tile) => {
                        if (tile instanceof VectorImageTile) {
                            const olTile = tile.getTile(tile.tileKeys[0]);
                            const [ z, x, y] = tile.tileCoord;
                            return {
                                url: olTile.url_,
                                z,
                                x,
                                y: -y - 1
                            };
                        }
                        return null;
                    }).filter(val => val);
                    if (tiles.length === 0) {
                        return null;
                    }
                    const options = find(layers, (layer) => layer.id === olLayer.getProperties().msId) || {};
                    return {
                        tiles,
                        id: olLayer.getProperties().msId,
                        format: options.format
                    };
                }
                return null;
            }).filter(val => val);
        onUpdate(cachedTiles);
    }

    return null;
}

export default SaveCachedOGCTiles;
