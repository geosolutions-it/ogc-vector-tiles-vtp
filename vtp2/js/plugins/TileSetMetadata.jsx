/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState } from 'react';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import get from 'lodash/get';
import find from 'lodash/find';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/actions/controls';
import { Button as ButtonRB, Glyphicon, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Loader from '@mapstore/components/misc/Loader';
import Portal from '@mapstore/components/misc/Portal';

import JSZip from 'jszip';
import axios from '@mapstore/libs/ajax';
import FileSaver from 'file-saver';

import { selectOGCTileVisibleLayers } from '@js/selectors/layers';
import { getTileSetMetadata } from '@js/api/OGC';
import { projectionSelector } from '@mapstore/selectors/map';

const Button = tooltip(ButtonRB);
const PLUGIN_NAME = 'TileSetMetadata';

const TileSetMetadataPlugin = ({
    visibleLayers = [],
    cachedTiles = [],
    projection,
    projectionsLabels = {
        'EPSG:4326': 'WorldCRS84Quad',
        'EPSG:3857': 'WebMercatorQuad',
        'EPSG:3395': 'WorldMercatorWGS84Quad'
    }
}) => {

    const [showModal, setShowModal] = useState();
    const [loading, setLoading] = useState();
    const [options, setOptions] = useState({});

    return (
        <>
        <Button
            bsStyle="primary"
            className="square-button"
            tooltip="Download tile set metadata from current view"
            tooltipPosition="left"
            onClick={() => setShowModal(true)}>
            <Glyphicon glyph="download-alt"/>
        </Button>
        <Portal>
            <ResizableModal
                show={showModal}
                fitContent
                title="Tile Set Metadata"
                clickOutEnabled={false}
                onClose={!loading ? () => setShowModal(false) : null}
                buttons={[
                    {
                        text: 'Download',
                        bsSize: 'sm',
                        bsStyle: 'primary',
                        onClick: () =>  {
                            if (loading) {
                                return null;
                            }
                            try {
                                const collectionUrls = visibleLayers.map(({ url }) => url);
                                const creationDate = Date.now();
                                setLoading(true);
                                if (collectionUrls.length > 0) {
                                    getTileSetMetadata(visibleLayers, {
                                        ...options,
                                        tileMatrixSetId: projectionsLabels[projection],
                                        creationDate
                                    })
                                        .then((tileSetMetadata) => {
                                            Promise.all(
                                                cachedTiles.map(({ tiles, ...layer }) => {
                                                    return new Promise(resolve => {
                                                        axios.all(
                                                            tiles.map(tile =>
                                                                axios.get(tile.url, {  responseType: 'blob' })
                                                                    .then(({ data }) => ({
                                                                        ...tile,
                                                                        data
                                                                    }))
                                                                    .catch(() => null)
                                                            )
                                                        ).then((newTiles) => resolve({
                                                            ...layer,
                                                            tiles: newTiles.filter(val => val)
                                                        }));
                                                    });
                                                })
                                            ).then((response) => {

                                                const zip = new JSZip();

                                                const cachedProperties = response.map((cachedLayer) => {
                                                    const { name } = find(visibleLayers, (layer) => layer.id === cachedLayer.id) || {};
                                                    const tilesFolder = zip.folder(cachedLayer.id);
                                                    cachedLayer.tiles.forEach((tile) => {
                                                        tilesFolder.file(`${tile.z}_${tile.y}_${tile.x}`, tile.data);
                                                    });
                                                    return {
                                                        format: cachedLayer.format,
                                                        tileTemplate: `${cachedLayer.id}/{tileMatrix}_{tileRow}_{tileCol}`,
                                                        id: cachedLayer.id,
                                                        name,
                                                        cachedTilesNames: cachedLayer.tiles.map(tile => `${tile.z}_${tile.y}_${tile.x}`)
                                                    };
                                                });

                                                const { layers = [] } = tileSetMetadata;

                                                const newLayers = layers.map((layer) => {
                                                    const { name, ...newProperties } = find(cachedProperties, (cached) => layer.id === cached.id) || {};
                                                    return {
                                                        ...layer,
                                                        ...newProperties,
                                                        id: name
                                                    };
                                                });

                                                zip.file('tileSetMetadata.json', JSON.stringify({
                                                    ...tileSetMetadata,
                                                    layers: newLayers
                                                }, null, 4));

                                                zip.generateAsync({ type: 'blob' }).then(function(content) {
                                                    FileSaver.saveAs(content, `tilesetmetadata_${options.title && `${options.title.toLowerCase()}_` || ''}${creationDate}.zip`);
                                                    setShowModal(false);
                                                    setLoading(false);
                                                });
                                            });
                                        });
                                } else {
                                    setShowModal(false);
                                    setLoading(false);
                                }
                            } catch (e) {
                                setShowModal(false);
                                setLoading(false);
                            }
                            return null;
                        }
                    }]}>
                {loading
                    ? <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16
                    }}><Loader size={70}/></div>
                    : <Form>
                        <FormGroup
                            key="title">
                            <ControlLabel>Title</ControlLabel>
                            <FormControl
                                type="text"
                                placeholder="Enter title..."
                                value={options.title || ''}
                                onChange={(event) => setOptions({
                                    ...options,
                                    title: event.target.value
                                })}/>
                        </FormGroup>
                    </Form>}
            </ResizableModal>
        </Portal>
        </>
    );
};

export default createPlugin(PLUGIN_NAME, {
    component: connect(
        createSelector([
            state => get(state, 'controls.toc.activePanel'),
            selectOGCTileVisibleLayers,
            state => get(state, 'controls.cachedTiles.values'),
            projectionSelector
        ], (activePanel, visibleLayers, cachedTiles, projection) => ({
            enabled: activePanel === PLUGIN_NAME,
            visibleLayers,
            cachedTiles,
            projection
        })),
        {
            onClose: setControlProperty.bind(null, 'toc', 'activePanel', '')
        }
    )(TileSetMetadataPlugin),
    containers: {
        Toolbar: {
            name: PLUGIN_NAME,
            position: -20,
            tool: true,
            priority: 1,
            alwaysVisible: true
        }
    }
});
