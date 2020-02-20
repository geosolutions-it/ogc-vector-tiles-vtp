/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { Glyphicon, Alert, Button } from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import { addLayer, removeLayer } from '@mapstore/actions/layers';
import { layersSelector } from '@mapstore/selectors/layers';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import withLayoutPanel from '@mapstore/plugins/layout/withLayoutPanel';
import { getSRS } from '@js/api/OGC';
import { changeMapCrs } from '@mapstore/actions/map';
import moment from 'moment';
import ReactJson from 'react-json-view';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import Portal from '@mapstore/components/misc/Portal';

const tileSetMetadataToLayers = (tileSetMetadata) => {

    const { tileMatrixSetLink, layers, tileSetPath } = tileSetMetadata || {};
    const { tileMatrixSet: tMS, tileMatrixSetLimits } = tileMatrixSetLink || {};
    const tML = tileMatrixSetLimits && tileMatrixSetLimits.tileMatrixLimits || [];
    const tileMatrixSet = [
        {
            'ows:Identifier': tMS.id,
            'ows:SupportedCRS': tMS.supportedCRS,
            'TileMatrix': tMS.tileMatrix
                .map((tM) => ({
                    'ows:Identifier': tM.id,
                    'ScaleDenominator': tM.scaleDenominator,
                    'TopLeftCorner': tM.topLeftCorner,
                    'TileWidth': tM.tileWidth,
                    'TileHeight': tM.tileHeight,
                    'MatrixWidth': tM.matrixWidth,
                    'MatrixHeight': tM.matrixHeight
                }))
        }
    ];

    const matrixIds = {
        [tMS.id]: tML.map(({ tileMatrix, maxTileCol, maxTileRow, minTileCol, minTileRow }) => (
            {
                identifier: tileMatrix,
                ranges: {
                    cols: {
                        min: minTileCol,
                        max: maxTileCol
                    },
                    rows: {
                        min: minTileRow,
                        max: maxTileRow
                    }
                }
            }
        ))
    };

    const srs = getSRS(tMS);
    const allowedSRS = {
        [srs]: true
    };

    return {
        srs,
        tileMatrixSetId: tMS.id,
        layers: layers.map(layer => ({
            name: layer.id,
            title: layer.title,
            type: 'ogc-tile',
            visibility: true,
            availableStyles: [],
            url: `${tileSetPath}/tileSetMetadata.json`,
            format: layer.format,
            tileUrls: [{
                url: `${tileSetPath}/${layer.tileTemplate}`,
                format: layer.format
            }],
            allowedSRS,
            tileMatrixSet,
            matrixIds,
            cachedTilesNames: layer.cachedTilesNames
        }))
    };
};

const selectMetadata = (metadata) => {
    return (dispatch, getState) => {
        (layersSelector(getState()) || [])
            .filter(({ group }) => group !== 'background')
            .forEach((layer) => {
                dispatch(removeLayer(layer.id));
            });
        const { layers = [], srs } = metadata || {};
        dispatch(changeMapCrs(srs));
        layers.forEach((layer) => {
            dispatch(addLayer(layer));
        });
    };
};

function TileSetsCatalog({
    directoryPath = 'tilesets/',
    onSelect = () => {}
}) {
    const [tileSets, setTileSets] = useState([]);
    const [showModal, setShowModal] = useState();
    useEffect(() => {
        if (window.msGetTileSets) {
            setTileSets(window.msGetTileSets(directoryPath));
        }
    }, []);
    return (
        <div
            className="ms-tile-sets-catalog"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%'
            }}>
            <BorderLayout
                header={
                    <div style={{ padding: '8px 8px 0 8px' }}>
                        <h4>Tile Sets Catalog</h4>
                        <p style={{ fontStyle: 'italic' }}>
                            This panel lists all tile sets metadata available in the /tileset directory.
                            Select an items to visualize available cached tiles from metadata on the map
                        </p>
                        <Button
                            style={{
                                margin: 'auto',
                                display: 'block'
                            }}
                            bsSize="small"
                            onClick={() => {
                                if (window.msGetTileSets) {
                                    setTileSets(window.msGetTileSets(directoryPath));
                                }
                            }}>
                            Refresh list
                        </Button>
                    </div>
                }>
                {tileSets.length === 0
                    ? <Alert bsStyle="warning">No tile set metadata available. Add a new tile set metadata folder to tilset/ directory.</Alert>
                    : <SideGrid
                        size="sm"
                        items={tileSets.map((tileSetMetadata) => ({
                            preview: <Glyphicon glyph="1-map"/>,
                            title: tileSetMetadata.title,
                            description: tileSetMetadata.dates && tileSetMetadata.dates.creation
                                && moment(tileSetMetadata.dates.creation).format('MMMM Do YYYY, h:mm:ss a'),
                            onClick: () => {
                                const metadata = tileSetMetadataToLayers(tileSetMetadata);
                                onSelect(metadata);
                            },
                            tools: <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md'
                                }}
                                buttons={[
                                    {
                                        glyph: 'list',
                                        tooltip: 'Show metadata',
                                        onClick: (event) => {
                                            event.stopPropagation();
                                            setShowModal(tileSetMetadata);
                                        }
                                    }
                                ]}/>
                        }))}/>}
            </BorderLayout>
            <Portal>
                <ResizableModal
                    show={showModal}
                    fitContent
                    title="Tile Set Metadata"
                    clickOutEnabled={false}
                    onClose={() => setShowModal(false)}>
                    <ReactJson
                        src={showModal}/>
                </ResizableModal>
            </Portal>
        </div>
    );
}

const TileSetsCatalogPlugin = connect(() => ({}), { onSelect: selectMetadata })(TileSetsCatalog);

export default createPlugin('TileSetsCatalog', {
    component: withLayoutPanel(TileSetsCatalogPlugin, { defaultWidth: 300 }),
    containers: {
        Layout: {
            priority: 1,
            glyph: '1-map',
            position: 3,
            size: 'auto',
            container: 'right-menu',
            tooltip: 'Tile Sets Catalog'
        }
    }
});
