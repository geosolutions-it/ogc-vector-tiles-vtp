/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/actions/controls';
import { updateNode } from '@mapstore/actions/layers';
import { getSelectedLayer } from '@mapstore/selectors/layers';
import { Button as ButtonRB, Glyphicon, Form, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import withLayoutPanel from '@mapstore/plugins/layout/withLayoutPanel';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import Select from 'react-select';

const Button = tooltip(ButtonRB);

function mimeTypeToStyleFormat(mimeType) {
    const formats = [
        {
            format: 'mbstyle',
            types: [ 'application/vnd.geoserver.mbstyle+json', 'application/vnd.mapbox.style+json' ]
        },
        {
            format: 'sld',
            types: ['application/vnd.ogc.sld+xml']
        }
    ];
    const { format = 'sld' } = formats.find(({ types }) => types.indexOf(mimeType) !== -1) || {};
    return format;
}

const formatLabels = {
    'application/vnd.mapbox-vector-tile': 'MapBox Vector Tile',
    'application/json;type=geojson': 'GeoJSON',
    'application/json;type=topojson': 'TopoJSON',
    'image/png': 'Image PNG',
    'image/png8': 'Image PNG 8',
    'image/jpeg': 'Image JPEG',
    'image/gif': 'Image GIF',
    'image/vnd.jpeg-png': 'Image JPEG PNG (vnd)',
    'image/vnd.jpeg-png8': 'Image JPEG PNG8 (vnd)',
    'application/flatgeobuf': 'FlatGeobuf',
    'application/geo+json': 'GeoJSON',
    'application/vnd.geo+json': 'GeoJSON'
};

const LayerSettingsPanel = withLayoutPanel(({
    selectedLayer,
    tileUrls,
    onChange,
    tileUrl,
    availableStyles,
    availableTileMatrixSet,
    staticStyles
}) => {
    const searchUrls = selectedLayer && selectedLayer.search && selectedLayer.search.urls;
    const searchUrl = searchUrls && searchUrls.find((sUrl) => sUrl.format === selectedLayer.format) || {};
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto'}} className="ms-layer-settings">
            <div style={{ position: 'absolute', width: '100%', height: '100%', padding: 8}}>
                <Form>
                    <FormGroup
                        controlId="title"
                        key="title">
                        <ControlLabel>Title</ControlLabel>
                        <FormControl
                            value={selectedLayer.title}
                            type="text"
                            placeholder="Enter title..."
                            onChange={(event) => onChange(selectedLayer.id, 'layers', { title: event.target.value })} />
                    </FormGroup>
                    {searchUrls && selectedLayer.type === 'ogc-features' && <FormGroup
                        controlId="format"
                        key="format">
                        <ControlLabel>Format</ControlLabel>
                        <Select
                            value={selectedLayer.format}
                            clearable={false}
                            options={searchUrls
                                .map(({ format }) => ({ value: format, label: formatLabels[format] || format }))
                                .sort((a, b) => a.label > b.label ? 1 : -1)}
                            onChange={({ value }) => onChange(selectedLayer.id, 'layers', { format: value })}/>
                        {searchUrl.url && <small
                            style={{
                                wordBreak: 'break-word',
                                fontSize: 11,
                                fontStyle: 'italic'
                            }}>{searchUrl.url}
                        </small>}
                    </FormGroup>}
                    {selectedLayer.type === 'ogc-features' && <FormGroup
                        controlId="limit"
                        key="limit">
                        <ControlLabel>Features limit</ControlLabel>
                        <FormControl
                            value={selectedLayer.params && selectedLayer.params.limit}
                            type="number"
                            placeholder="Enter limit..."
                            onChange={(event) => {
                                if (!event.target.value) {
                                    const params = omit({ ...selectedLayer.params }, ['limit']);
                                    return onChange(selectedLayer.id, 'layers',
                                        { params: {...params}, '_v_': Date.now() }
                                    );
                                }
                                return onChange(selectedLayer.id, 'layers', {
                                    params: {
                                        ...selectedLayer.params,
                                        limit: event.target.value
                                    },
                                    '_v_': Date.now()
                                });
                            }} />
                    </FormGroup>}
                    {tileUrls && selectedLayer.type === 'ogc-tile' && <FormGroup
                        controlId="format"
                        key="format">
                        <ControlLabel>Format</ControlLabel>
                        <Select
                            value={selectedLayer.format}
                            clearable={false}
                            options={tileUrls
                                .map(({ format }) => ({ value: format, label: formatLabels[format] || format }))
                                .sort((a, b) => a.label > b.label ? 1 : -1)}
                            onChange={({ value }) => onChange(selectedLayer.id, 'layers', { format: value })}/>
                        {tileUrl.url && <small
                            style={{
                                wordBreak: 'break-word',
                                fontSize: 11,
                                fontStyle: 'italic'
                            }}>{tileUrl.url}
                        </small>}
                    </FormGroup>}
                    {availableStyles && availableStyles.length > 0 &&
                    <FormGroup
                        controlId="styles"
                        key="styles">
                        <ControlLabel>Available styles</ControlLabel>
                        <Select
                            value={selectedLayer.style}
                            clearable={false}
                            options={availableStyles.map(({ id, title }) => ({ value: id, label: title || id }))}
                            onChange={({ value }) => {
                                const availableStyle = availableStyles.find(({ id }) => id === value) || {};
                                const { links = [] } = availableStyle;
                                const stylesLinks = links.filter(({ rel }) => rel === 'stylesheet') || {};
                                const { href: url, type: mimeType } = stylesLinks.length > 1
                                    && stylesLinks.filter((stylesLink) => stylesLink.type.indexOf('sld') === -1)[0]
                                    || stylesLinks[0];
                                onChange(selectedLayer.id, 'layers',
                                    {
                                        style: value,
                                        vectorStyle: {
                                            url,
                                            format: mimeTypeToStyleFormat(mimeType)
                                        }
                                    });
                            }}/>
                    </FormGroup>}
                    {staticStyles && staticStyles.length > 0 &&
                    <FormGroup
                        controlId="static-styles"
                        key="static-styles">
                        <ControlLabel>Static styles</ControlLabel>
                        <Select
                            value={selectedLayer.style}
                            clearable={false}
                            options={staticStyles.map(({ id, title }) => ({ value: id, label: title || id }))}
                            onChange={({ value }) => {
                                const staticStyle = staticStyles.find(({ id }) => id === value) || {};
                                const { links = [] } = staticStyle;
                                const stylesLinks = links.filter(({ rel }) => rel === 'stylesheet') || {};
                                const { href: url, type: mimeType } = stylesLinks.length > 1
                                    && stylesLinks.filter((stylesLink) => stylesLink.type.indexOf('sld') === -1)[0]
                                    || stylesLinks[0];
                                onChange(selectedLayer.id, 'layers',
                                    {
                                        style: value,
                                        vectorStyle: {
                                            url,
                                            format: mimeTypeToStyleFormat(mimeType)
                                        }
                                    });
                            }}/>
                    </FormGroup>}
                    {availableTileMatrixSet && availableTileMatrixSet.length > 0 &&
                    <FormGroup
                        controlId="tilematrix"
                        key="tilematrix">
                        <ControlLabel>Available tile matrix set</ControlLabel>
                        {availableTileMatrixSet.map((tM) => {
                            return (
                                <div key={tM}>
                                    <code>{tM}</code>
                                </div>
                            );
                        })}
                    </FormGroup>}
                </Form>
            </div>
        </div>
    );
}, { defaultWidth: 300 });

function LayerSettings({
    selectedLayer,
    enabled,
    onClose = () => {},
    onChange,
    layoutPanelProps,
    staticStyles = [
        {
            "id": "wireframe",
            "name": "wireframe",
            "title": "Wireframe (sld static style)",
            "links": [
                {
                    "rel": "stylesheet",
                    "type": "application/vnd.ogc.sld+xml",
                    "href": "static/styles/wireframe.sld"
                }
            ]
        }
    ]
}) {
    const { id, name, type, tileUrls = [], availableStyles, tileMatrixSet = [] } = selectedLayer || {};
    useEffect(() => {
        if (!name) {
            onClose();
        }
    }, [type, id]);
    const tileUrl = tileUrls.find((tUrl) => tUrl.format === selectedLayer.format) || {};
    const availableTileMatrixSet = tileMatrixSet.map((tM) => tM['ows:Identifier']);
    return enabled
        ? (
            <LayerSettingsPanel
                key={id}
                selectedLayer={selectedLayer}
                tileUrls={tileUrls}
                onChange={onChange}
                tileUrl={tileUrl}
                availableStyles={availableStyles}
                availableTileMatrixSet={availableTileMatrixSet}
                layoutPanelProps={layoutPanelProps}
                staticStyles={staticStyles}
            />
        )
        : null;
}

const PLUGIN_NAME = 'LayerSettings';

const TOCButton = connect(createSelector([
    state => get(state, 'controls.toc.activePanel')
], (activePanel) => ({
    enabled: activePanel === PLUGIN_NAME
})), {
    onClick: setControlProperty.bind(null, 'toc', 'activePanel', PLUGIN_NAME)
})(({ status, enabled, onClick, ...props }) => {
    return !enabled && status === 'LAYER'
        ? <Button
            {...props}
            tooltip="Layer settings"
            onClick={() => onClick()}>
            <Glyphicon glyph="wrench"/>
        </Button>
        : null;
});

export default createPlugin(PLUGIN_NAME, {
    component: connect(
        createSelector([
            state => get(state, 'controls.toc.activePanel'),
            getSelectedLayer
        ], (activePanel, selectedLayer) => ({
            enabled: activePanel === PLUGIN_NAME,
            selectedLayer: selectedLayer || {}
        })),
        {
            onClose: setControlProperty.bind(null, 'toc', 'activePanel', ''),
            onChange: updateNode
        }
    )(LayerSettings),
    containers: {
        Layers: {
            priority: 1,
            tool: TOCButton,
            panel: true
        }
    }
});
