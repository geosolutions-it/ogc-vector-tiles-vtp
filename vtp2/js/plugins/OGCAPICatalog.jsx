/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import { addLayer } from '@mapstore/actions/layers';
import { Pagination, FormGroup, InputGroup, Glyphicon as GlyphiconRB, Alert } from 'react-bootstrap';
import Loader from '@mapstore/components/misc/Loader';
import Filter from '@mapstore/components/misc/Filter';
import uuidv1 from 'uuid/v1';
import isString from 'lodash/isString';
import Select from 'react-select';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import withLayoutPanel from '@mapstore/plugins/layout/withLayoutPanel';

import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';

import { textSearch } from '@js/api/OGC';

const Glyphicon = tooltip(GlyphiconRB);

const isSearchVectorFormat = (format) => {
    return [
        'application/json;type=geojson',
        'application/geo+json',
        'application/flatgeobuf',
        'application/vnd.geo+json'
    ].indexOf(format) !== -1;
};

const isImageFormat = (format) => {
    return [
        'image/gif',
        'image/jpeg',
        'image/png',
        'image/png8',
        'image/vnd.jpeg-png',
        'image/vnd.jpeg-png8'
    ].indexOf(format) !== -1;
};

class OGCAPICatalogPlugin extends React.Component {
    static propTypes = {
        pageSize: PropTypes.number,
        onAdd: PropTypes.func,
        services: PropTypes.array,
        resizeDisabled: PropTypes.bool,
        resizeHandle: PropTypes.string,
        resizeHandleAxis: PropTypes.string,
        containerWidth: PropTypes.number
    };

    static defaultProps = {
        pageSize: 15,
        onAdd: () => { },
        resizeDisabled: false,
        resizeHandle: 'w',
        resizeHandleAxis: 'x',
        services: [
            {
                label: 'Local GeoServer OGC Tiles API',
                value: 'http://localhost:8080/geoserver/ogc/tiles'
            },
            {
                label: 'Local GeoServer OGC Features API',
                value: 'http://localhost:8080/geoserver/ogc/features'
            }
        ]
    };

    state = {
        service: {}
    };

    componentWillMount() {
        this.setState({
            service: this.props.services[0],
            records: [],
            page: 0,
            total: 0
        });
    }

    render() {
        const {
            page = 0,
            records = [],
            total = 0
        } = this.state;
        const numberOfPage = Math.ceil(total / this.props.pageSize);

        return (
            <div
                className="ms-tiles-catalog"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}>
                <BorderLayout
                    header={<div style={{ padding: 8 }}>
                        <FormGroup
                            controlId="service"
                            key="service"
                            style={{ margin: 0 }}>
                            <InputGroup
                                style={{ zIndex: 10 }}>
                                <Select
                                    clearable={false}
                                    value={this.state.service}
                                    options={this.props.services}
                                    onChange={(service) => {
                                        this.setState({ service });
                                        this.search(service);
                                    }}/>
                                <InputGroup.Addon
                                    className="btn"
                                    onClick={() => this.state.loading ? () => { } : this.search()}>
                                    {this.state.loading && <Loader size={14} /> || <Glyphicon glyph="search" />}
                                </InputGroup.Addon>
                            </InputGroup>
                            <Filter
                                filterText={this.state.filterText || ''}
                                filterPlaceholder="Filter collections"
                                onFilter={(filterText) => this.setState({ filterText })}/>
                        </FormGroup>
                        {this.state.error && <Alert bsStyle="danger" style={{ margin: 0 }}> <div>{this.state.error}</div></Alert>}
                        {!this.state.error && (this.state.records || []).length === 0 && (
                            <div style={{ padding: 8, textAlign: 'center', fontStyle: 'italic' }}>
                                click on search button
                            </div>
                        )}
                    </div>}
                    footer={
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    bsSize="small"
                                    items={numberOfPage}
                                    maxButtons={2}
                                    activePage={page + 1}
                                    onSelect={this.state.loading
                                        ? undefined
                                        : (newPage) => this.search(undefined, (newPage - 1) * this.props.pageSize + 1, newPage - 1)
                                    } />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>{records.length} of {total}</div>
                        </div>
                    }>
                    <SideGrid
                        size="sm"
                        items={records
                            .map((layer) => {
                                const isVector = (layer.tileUrls || []).find((tileUrl) => isVectorFormat(tileUrl.format));
                                const isImage = (layer.tileUrls || []).find((tileUrl) => isImageFormat(tileUrl.format));
                                const isSearch = layer && layer.search && layer.search.urls
                                    && (layer.search.urls || []).find((searchUrl) => isSearchVectorFormat(searchUrl.format));
                                return ({
                                    id: layer.name,
                                    title: layer.title || layer.name,
                                    preview: layer.error
                                        ? <Glyphicon glyph="exclamation-mark" tooltip={layer.error}/>
                                        : <Glyphicon glyph="1-layer" tooltip={`${layer.title || layer.name} collection`}/>,
                                    tools: <Toolbar
                                        btnDefaultProps={{
                                            className: 'square-button-md',
                                            bsStyle: 'primary'
                                        }}
                                        buttons={[
                                            ...(isSearch
                                                ? [{
                                                    glyph: '1-polygon',
                                                    tooltip: 'Add feature items to map',
                                                    onClick: () => {
                                                        const {
                                                            name,
                                                            url,
                                                            title,
                                                            availableStyles,
                                                            style,
                                                            search,
                                                            bbox
                                                        } = layer;
                                                        const format = search.urls[0].format;
                                                        this.props.onAdd({
                                                            id: uuidv1(),
                                                            name,
                                                            url,
                                                            title,
                                                            type: 'ogc-features',
                                                            visibility: true,
                                                            availableStyles,
                                                            style,
                                                            search: {
                                                                ...search,
                                                                urls: search.urls.filter((searchUrl) => isSearchVectorFormat(searchUrl.format))
                                                            },
                                                            bbox,
                                                            format
                                                        });
                                                    }
                                                }]
                                                : []),
                                            ...(isImage
                                                ? [{
                                                    glyph: '1-raster',
                                                    tooltip: 'Add map tile layer to map (render server side)',
                                                    onClick: () => {
                                                        const tileUrls = layer.tileUrls.filter((tileUrl) => isImageFormat(tileUrl.format));
                                                        const { format } = isImage;
                                                        this.props.onAdd({
                                                            ...layer,
                                                            id: uuidv1(),
                                                            type: 'ogc-tile',
                                                            format,
                                                            tileUrls
                                                        });
                                                    }
                                                }]
                                                : []),
                                            ...(isVector
                                                ? [{
                                                    glyph: '1-vector',
                                                    tooltip: 'Add vector tile layer to map',
                                                    onClick: () => {
                                                        const tileUrls = layer.tileUrls.filter((tileUrl) => isVectorFormat(tileUrl.format));
                                                        const { format } = isVector;
                                                        this.props.onAdd({
                                                            ...layer,
                                                            type: 'ogc-tile',
                                                            id: uuidv1(),
                                                            declutter: true,
                                                            format,
                                                            tileUrls
                                                        });
                                                    }
                                                }]
                                                : [])
                                        ]} />
                                });
                            })} />
                </BorderLayout>
            </div>
        );
    }

    search = (newService, startPosition = 1, page = 0) => {
        const service = newService || this.state.service;
        if (isString(service && service.value)) {
            this.setState({
                loading: true,
                error: null
            });
            textSearch(service.value, startPosition, this.props.pageSize, this.state.filterText || '')
                .then(({ records, numberOfRecordsMatched }) => {
                    this.setState({
                        records,
                        page,
                        total: numberOfRecordsMatched,
                        loading: false
                    });
                })
                .catch(({ data } = {}) => {
                    this.setState({
                        loading: false,
                        error: data || 'Connection Error'
                    });
                });
        }
    };
}

export default createPlugin('OGCAPICatalog', {
    component: withLayoutPanel(connect(() => ({}), { onAdd: addLayer })(OGCAPICatalogPlugin), { defaultWidth: 300 }),
    containers: {
        Layout: {
            priority: 1,
            glyph: 'th-large',
            position: 2,
            size: 'auto',
            container: 'right-menu',
            tooltip: 'OGC API Catalog'
        }
    }
});
