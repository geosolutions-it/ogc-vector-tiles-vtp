/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlParser from 'url';
import get from 'lodash/get';
import find from 'lodash/find';
import isNaN from 'lodash/isNaN';
import CoordinatesUtils from '@mapstore/utils/CoordinatesUtils';
import MapUtils from '@mapstore/utils/MapUtils';
import Layers from '@mapstore/utils/openlayers/Layers';
import SecurityUtils from '@mapstore/utils/SecurityUtils';

import { get as olGet, getTransform } from 'ol/proj';
import { applyTransform } from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import VectorTile from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import XYZ from 'ol/source/XYZ';
import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';
import { OL_VECTOR_FORMATS, applyStyle } from '@mapstore/utils/openlayers/VectorTileUtils';
import { createXYZ } from 'ol/tilegrid';
import { optionsToVendorParams } from '@mapstore/utils/VendorParamsUtils';

const createLayer = (options) => {
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const projection = olGet(srs);
    const metersPerUnit = projection.getMetersPerUnit();
    const tilingSchemeId = (options.tileMatrixSet.find((tM) => {
        const supportedCRSSplit = tM['ows:SupportedCRS'] && tM['ows:SupportedCRS'].split(/\//g);
        const code = supportedCRSSplit[supportedCRSSplit.length - 1];
        if (code === 'CRS84') {
            return srs === 'EPSG:4326';
        }
        return srs === `EPSG:${code}`;
    }) || {})['ows:Identifier'];

    const tileMatrixSet = options.tileMatrixSet.find(tM => {
        return tM['ows:Identifier'] === tilingSchemeId;
    });
    const selectedTileMatrixSet = tileMatrixSet || {};
    const tileMatrix = selectedTileMatrixSet.TileMatrix;
    const scales = tileMatrix && tileMatrix.map(({ ScaleDenominator }) => ScaleDenominator);
    const mapResolutions = MapUtils.getResolutions();

    const scaleToResolution = s => s * 0.28E-3 / metersPerUnit;
    const matrixResolutions = options.resolutions || scales && scales.map(scaleToResolution);
    const resolutions = matrixResolutions || mapResolutions;

    const switchOriginXY = projection.getAxisOrientation().substr(0, 2) === 'ne';
    const origins = tileMatrix && tileMatrix
        .map(({ TopLeftCorner } = {}) => TopLeftCorner)
        .map(([x, y] = []) => switchOriginXY ? [y, x] : [x, y]);

    const tileSizes = tileMatrix && tileMatrix
        .map(({ TileWidth, TileHeight }) => [TileWidth, TileHeight]);

    const bbox = options.bbox;
    let extent;
    try {
        extent = bbox
            ? applyTransform([
                parseFloat(bbox.bounds.minx),
                parseFloat(bbox.bounds.miny),
                parseFloat(bbox.bounds.maxx),
                parseFloat(bbox.bounds.maxy)
            ], getTransform(bbox.crs, options.srs))
            : undefined;
    } catch (e) {
        extent = undefined;
    }

    const tileGrid = tileMatrixSet && new TileGrid({
        minZoom: 0,
        origins,
        origin: !origins ? [20037508.3428, -20037508.3428] : undefined,
        resolutions,
        tileSizes,
        tileSize: !tileSizes ? [256, 256] : undefined
    }) || createXYZ();

    const tileUrl = ((options.tileUrls || []).find(({ format }) => format === options.format) || {}).url;

    const splitLayerUrl = tileUrl.split('?');
    const { query = {} } = splitLayerUrl[1]
        ? urlParser.parse('?' + splitLayerUrl[1], true)
        : {};

    const { CQL_FILTER } = optionsToVendorParams(options) || {};
    let queryParameters = {
        ...query,
        ...options.params,
        ...(CQL_FILTER && { 'filter': CQL_FILTER, 'filter-lang': 'cql-text' })
    };
    SecurityUtils.addAuthenticationParameter(splitLayerUrl[0], queryParameters, options.securityToken);
    const layerUrl = decodeURI(splitLayerUrl[0]);
    const queryParametersString = urlParser.format({ query: { ...queryParameters } });

    const matrixIds = options.matrixIds[tilingSchemeId];
    const tileUrlFunction = (tileCoord) => {
        if (!tileCoord) {
            return null;
        }
        const [ z, x, y ] = tileCoord;
        const tileY = -y - 1;

        const tileMatrixIdentifier = tileMatrix && tileMatrix[z] && tileMatrix[z]['ows:Identifier'];
        const currentMatrixLimits = (find(matrixIds, ({ identifier }) => identifier === tileMatrixIdentifier) || {});
        const matrixLimitsIdentifier = currentMatrixLimits.identifier;

        const minCol = parseFloat(get(currentMatrixLimits, 'ranges.cols.min'));
        const maxCol = parseFloat(get(currentMatrixLimits, 'ranges.cols.max'));
        const minRow = parseFloat(get(currentMatrixLimits, 'ranges.rows.min'));
        const maxRow = parseFloat(get(currentMatrixLimits, 'ranges.rows.max'));
        const isLimitValid = !isNaN(minCol) && !isNaN(maxCol) && !isNaN(minRow) && !isNaN(maxRow);
        const isInLimits = !isLimitValid || x >= minCol && x <= maxCol && tileY >= minRow && tileY <= maxRow;
        if (!matrixLimitsIdentifier || !isInLimits) {
            return null;
        }
        const styleId = options.style;
        return (layerUrl + queryParametersString)
            .replace(/\{tileMatrix\}/g, matrixLimitsIdentifier)
            .replace(/\{tileCol\}/g, x.toString())
            .replace(/\{tileRow\}/g, tileY.toString())
            .replace(/\{styleId\}/g, styleId)
            .replace(/\{tileMatrixSetId\}/g, tilingSchemeId);
    };

    if (isVectorFormat(options.format)) {
        const Format = OL_VECTOR_FORMATS[options.format] || MVT;
        const source = new VectorTile({
            format: new Format({
                dataProjection: options.dataProjection || srs,
                layerName: '_layer_'
            }),
            tileGrid,
            url: layerUrl + queryParametersString,
            tileUrlFunction
        });
        const layer = new VectorTileLayer({
            extent,
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            declutter: options.declutter
        });
        applyStyle(options.vectorStyle, layer, { projection: srs });
        return layer;
    }

    const source = new XYZ({
        tileGrid,
        projection,
        url: layerUrl + queryParametersString,
        tileUrlFunction
    });

    const layer = new TileLayer({
        extent,
        msId: options.id,
        source: source,
        visible: options.visibility !== false,
        zIndex: options.zIndex
    });
    return layer;
};
Layers.registerType('ogc-tile', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (oldOptions.securityToken !== newOptions.securityToken
            || oldOptions.srs !== newOptions.srs
            || oldOptions.format !== newOptions.format
            || oldOptions._v_ !== newOptions._v_
            || oldOptions.style !== newOptions.style
            || oldOptions.dataProjection !== newOptions.dataProjection) {
            return createLayer(newOptions, map);
        }
        if (get(oldOptions, 'vectorStyle.body') !== get(newOptions, 'vectorStyle.body')
            || get(oldOptions, 'vectorStyle.url') !== get(newOptions, 'vectorStyle.url')) {
            applyStyle(newOptions.vectorStyle, layer, { projection: newOptions.srs });
        }
        return null;
    },
    render: () => {
        return null;
    }
});
