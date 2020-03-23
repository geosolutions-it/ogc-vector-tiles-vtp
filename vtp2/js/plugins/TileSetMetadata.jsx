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
import uniq from 'lodash/uniq';
import min from 'lodash/min';
import max from 'lodash/max';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/actions/controls';
import { Button as ButtonRB, Glyphicon, Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Loader from '@mapstore/components/misc/Loader';
import Portal from '@mapstore/components/misc/Portal';
import Select from 'react-select';
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
    clientDownloadLabel = 'Download',
    clientDownloadLink = '',
    projectionsLabels = {
        'EPSG:4326': 'WorldCRS84Quad',
        'EPSG:3857': 'WebMercatorQuad',
        'EPSG:3395': 'WorldMercatorWGS84Quad'
    }
}) => {

    const [showModal, setShowModal] = useState();
    const [loading, setLoading] = useState();
    const [options, setOptions] = useState({});
    const [selectedLayer, setSelectedLayer] = useState();
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
                        disabled: !selectedLayer,
                        onClick: () =>  {
                            if (loading || !selectedLayer) {
                                return null;
                            }
                            try {
                                const creationDate = Date.now();
                                setLoading(true);
                                if (selectedLayer && selectedLayer.layer) {
                                    getTileSetMetadata(selectedLayer.layer, {
                                        ...options,
                                        tileMatrixSetId: projectionsLabels[projection],
                                        creationDate
                                    })
                                        .then((tileSetMetadata) => {
                                            if (tileSetMetadata && tileSetMetadata.error) {
                                                setShowModal(false);
                                                return setLoading(false);
                                            }
                                            const layer = selectedLayer.layer;
                                            const layerCachedTiles = find(cachedTiles, (cachedLayer) => layer.id === cachedLayer.id) || {};
                                            const { tiles = [] } = layerCachedTiles;
                                            const zooms = [ ...uniq(tiles.map(({ z }) => z)) ].sort();
                                            const tileLimitsByZoomLevel = zooms.map((zoom) => {
                                                const tiltByZoom = tiles.filter(({ z }) => z === zoom);
                                                const cols = tiltByZoom.map(({ x }) => x);
                                                const rows = tiltByZoom.map(({ y }) => y);
                                                return {
                                                    zoom,
                                                    minTileRow: min(rows),
                                                    maxTileRow: max(rows),
                                                    minTileCol: min(cols),
                                                    maxTileCol: max(cols)
                                                };
                                            });

                                            const tileMatrix = get(tileSetMetadata, 'tileMatrixSetLink.tileMatrixSet.tileMatrix');
                                            const tileMatrixLimits = tileLimitsByZoomLevel.map(({ zoom, ...limits }) => {
                                                const id = tileMatrix[zoom] && tileMatrix[zoom].id;
                                                return {
                                                    ...limits,
                                                    tileMatrix: id
                                                };
                                            });

                                            let tileRequests = [];
                                            for (let i = 0; i < tileMatrixLimits.length; i++) {
                                                const tileMatrixLimit = tileMatrixLimits[i] || {};
                                                const { tileMatrix: z, minTileRow, maxTileRow, minTileCol, maxTileCol } = tileMatrixLimit;
                                                for (let y = minTileRow; y <= maxTileRow; y++) {
                                                    for (let x = minTileCol; x <= maxTileCol; x++) {
                                                        tileRequests.push({
                                                            z,
                                                            x,
                                                            y
                                                        });
                                                    }
                                                }
                                            }

                                            const tileTemplate = (find(layer && layer.tileUrls, ({ format }) => format === 'application/vnd.mapbox-vector-tile') || {}).url;
                                            const tileMatrixSetId = get(tileSetMetadata, 'tileMatrixSetLink.tileMatrixSet.id');

                                            axios.all(
                                                tileRequests.map(({ z, y, x }) =>
                                                    axios.get(
                                                        tileTemplate
                                                            .replace(/\{tileMatrix\}/g, z)
                                                            .replace(/\{tileCol\}/g, x)
                                                            .replace(/\{tileRow\}/g, y)
                                                            .replace(/\{tileMatrixSetId\}/g, tileMatrixSetId),
                                                        {  responseType: 'blob' })
                                                        .then(({ data }) => ({
                                                            z, y, x, data
                                                        }))
                                                        .catch(() => ({
                                                            z, y, x, data: null
                                                        }))
                                                ))
                                                .then((response) => {
                                                    const zip = new JSZip();
                                                    const template = `${layerCachedTiles.id}/{tileMatrix}_{tileRow}_{tileCol}.mvt`;
                                                    const tilesFolder = zip.folder(layerCachedTiles.id);
                                                    response.forEach((tile) => {
                                                        tilesFolder.file(`${tile.z}_${tile.y}_${tile.x}.mvt`, tile.data);
                                                    });

                                                    const tileMatrixSetLink = get(tileSetMetadata, 'tileMatrixSetLink');
                                                    const tileMatrixSetLimits = get(tileSetMetadata, 'tileMatrixSetLink.tileMatrixSetLimits');

                                                    zip.file('tileSetMetadata.json', JSON.stringify({
                                                        ...tileSetMetadata,
                                                        tiles: [
                                                            template
                                                        ],
                                                        tileMatrixSetLink: {
                                                            ...tileMatrixSetLink,
                                                            tileMatrixSetLimits: {
                                                                ...tileMatrixSetLimits,
                                                                tileMatrixLimits
                                                            }
                                                        }
                                                    }, null, 4));

                                                    zip.generateAsync({ type: 'blob' }).then(function(content) {
                                                        FileSaver.saveAs(content, `tilesetmetadata_${tileSetMetadata.title && `${tileSetMetadata.title.toLowerCase()}_` || ''}${creationDate}.zip`);
                                                        setShowModal(false);
                                                        setLoading(false);
                                                    });
                                                });
                                            return null;
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
                            key="collection">
                            <ControlLabel>Collection</ControlLabel>
                            <Select
                                value={selectedLayer && selectedLayer.value}
                                placeholder="Select collection..."
                                options={visibleLayers.map((layer) => ({
                                    layer,
                                    value: layer.id,
                                    label: layer.title || layer.name || layer.id
                                }))}
                                onChange={(selected) => setSelectedLayer(selected)}/>
                        </FormGroup>
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
                        {clientDownloadLink && <a style={{ fontSize: 11, textAlign: 'center', display: 'block' }} href={clientDownloadLink}>{clientDownloadLabel}</a>}
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
