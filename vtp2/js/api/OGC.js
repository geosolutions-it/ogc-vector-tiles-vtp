/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import uniqBy from 'lodash/uniqBy';
import find from 'lodash/find';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';
import urlParser from 'url';
import isObject from 'lodash/isObject';

const DEFAULT_TILE_MATRIX_SET = {
    'WebMercatorQuad': () => import(/* webpackChunkName: "tms-WebMercatorQuad" */ './tilematrixsets/WebMercatorQuad.json').then(mod => mod.default),
    'WorldCRS84Quad': () => import(/* webpackChunkName: "tms-WorldCRS84Quad" */ './tilematrixsets/WorldCRS84Quad.json').then(mod => mod.default),
    'WorldMercatorWGS84Quad': () => import(/* webpackChunkName: "tms-WorldMercatorWGS84Quad" */ './tilematrixsets/WorldMercatorWGS84Quad.json').then(mod => mod.default)
};

const capabilitiesCache = {};
const tileMatrixSetCache = {};

const getFullHREF = function(service, href) {
    if (!href || href.match(/http/)) {
        return href;
    }
    const { protocol, host } = urlParser.parse(service);
    const parsedHref = urlParser.parse(href);
    return urlParser.format({
        ...parsedHref,
        protocol,
        host
    });
};

const getDefaultTileMatrixSet = function(tileMatrixSet) {
    return DEFAULT_TILE_MATRIX_SET[tileMatrixSet] && DEFAULT_TILE_MATRIX_SET[tileMatrixSet](tileMatrixSet) || null;
};
const getTileMatrixSet = function({
    serviceUrl,
    tileMatrixSet,
    tileMatrixSetURI,
    tileMatrixSetLimits
}) {
    const defaultTileMatrixSet = getDefaultTileMatrixSet(tileMatrixSet);
    return defaultTileMatrixSet
        ? defaultTileMatrixSet
        : axios.get(getFullHREF(serviceUrl, tileMatrixSetURI))
            .then(({
                data
            }) => {
                try {
                    if (isObject(data)) {
                        return { tileMatrixSet: data, tileMatrixSetLimits };
                    }
                    const obj = JSON.parse(data);
                    return {tileMatrixSet: obj, tileMatrixSetLimits};
                } catch (e) {
                    return null;
                }
            })
            .catch(() => null);
};

export const getSRS = function({ supportedCRS }) {
    const supportedCRSSplit = supportedCRS && supportedCRS.split(/\//g);
    const code = supportedCRSSplit[supportedCRSSplit.length - 1];
    if (code === 'CRS84') {
        return 'EPSG:4326';
    }
    return code && `EPSG:${code}`;
};

const stylesMimeTypes = {
    // css: ['application/vnd.geoserver.geocss+css'],
    sld: [
        'application/vnd.ogc.sld+xml',
        'application/vnd.ogc.sld+xml;version=1.1'
    ],
    // sldse: ['application/vnd.ogc.se+xml'],
    // zip: ['application/zip'],
    mbstyle: [
        'application/vnd.mapbox.style+json',
        'application/json',
        'application/vnd.geoserver.mbstyle+json'
    ]
};


export const getStyleInfoFromLinks = (style, serviceUrl) => {

    const describedBy = (find(style && style.links, ({ rel, type }) => rel === 'describedBy' && (type === 'application/json' || type === undefined)) || {});
    return (style.links || [])
        .filter(({ rel }) => (rel === 'stylesheet' || rel === 'style'))
        .map((styleSheet) => {
            const format = find(Object.keys(stylesMimeTypes), (key) => stylesMimeTypes[key].indexOf(styleSheet.type) !== -1);
            return {
                id: `${style.identifier || style.id}-${format}`,
                name: `${style.identifier || style.id}-${format}`,
                format,
                title: `${style.title || style.identifier || style.id} (${format})`,
                styleSheetHref: getFullHREF(serviceUrl, styleSheet.href),
                href: describedBy.href
            };
        });
};

export const getCapabilities = (collectionUrl) => {
    return axios.get(collectionUrl)
        .then(({ data = {} } = {}) => {
            const { links = [] } = data;
            const queryablesUrl = (find(links, ({ rel, type }) => rel === 'queryables' && (type === 'application/json' || type === undefined)) || {}).href;
            return axios.get(queryablesUrl)
                .then(({ data: queryablesResponse = {} } = {}) => {
                    const { queryables = {} } = queryablesResponse;
                    return {
                        ...data,
                        queryables
                    };
                })
                .catch(() => ({ ...data, queryables: {} }));
        });
};

export const getQueryables = (collectionUrl) => {
    return axios.get(collectionUrl)
        .then(({ data = {} } = {}) => {
            const { links = [] } = data;
            const queryablesUrl = (find(links, ({ rel, type }) => rel === 'queryables' && (type === 'application/json' || type === undefined)) || {}).href;
            return axios.get(getFullHREF(collectionUrl, queryablesUrl));
        })
        .then(({ data = {} } = {}) => {
            const { queryables = {} } = data;
            return queryables;
        });
};

function getAvailableStyles(styles = [], serviceUrl) {
    const availableStyles = (styles || [])
        .filter(style => (style.id || style.identifier)) // e identifier
        .reduce((acc, style) => [
            ...acc,
            ...getStyleInfoFromLinks(style, serviceUrl)
                .map((styleProperties) => ({
                    ...style,
                    ...styleProperties
                }))
        ], [])
        .filter(({ format }) => format);

    return {
        style: undefined,
        availableStyles
    };
}

export function collectionUrlToLayer(collectionUrl, serviceUrl, collection) {
    const collectionFullUrl = getFullHREF(serviceUrl, collectionUrl);
    return (collectionFullUrl // if missing collection/self
        ? axios.get(getFullHREF(serviceUrl, collectionUrl)).then(({ data }) => data)
        : new Promise((resolve) => resolve(collection)))
        .then(function(data) {
            const { id, title, extent, links, styles } = data || {};
            const spatial = extent && extent.spatial && extent.spatial.bbox && extent.spatial.bbox[0]
                || [-180, -90, 180, 90];
            const tiles = (links || []).filter(({ rel, type }) =>
                rel === 'tiles' && type === 'application/json'
                || rel === 'tiles' && type === undefined);
            const items = (links || [])
                .filter(({ rel, type }) => rel === 'items' && isVectorFormat(type))
                .map(({ href, type }) => ({ url: getFullHREF(serviceUrl, href), format: type  }));
            const searchParam = items.length > 0 && {
                search: {
                    urls: items,
                    type: 'ogc'
                }
            };

            const stylesLink = (links || []).find(({ rel, type }) => rel === 'styles' && (type === undefined || type === 'application/json'));

            return {
                ...data,
                name: id,
                title,
                type: 'ogc',
                visibility: true,
                // check missing params
                ...collection,
                tiles,
                ...searchParam,
                url: getFullHREF(serviceUrl, collectionUrl),
                stylesLink,
                stylesParam: styles,
                bbox: {
                    crs: 'EPSG:4326',
                    bounds: {
                        minx: spatial[0],
                        miny: spatial[1],
                        maxx: spatial[2],
                        maxy: spatial[3]
                    }
                }
            };
        })
        .then(function({ stylesLink, stylesParam = [], ...layer }) {

            if (!(stylesLink && stylesLink.href)) {
                return {
                    ...layer,
                    ...getAvailableStyles(stylesParam, serviceUrl)
                };
            }
            return axios.get(getFullHREF(serviceUrl, stylesLink.href))
                .then(({ data } = {}) => {
                    return {
                        ...layer,
                        ...getAvailableStyles([ ...stylesParam, ...(data.styles || [])], serviceUrl)
                    };
                })
                .catch(() => ({
                    ...layer,
                    ...getAvailableStyles(stylesParam, serviceUrl)
                }));
        })
        .then(function({ tiles, ...layer }) {
            return axios.all(
                tiles.map(({ href }) =>
                    axios.get(getFullHREF(serviceUrl, href))
                        .then(function({ data }) {
                            const { tileMatrixSetLinks = [], links } = data;
                            const tile = links
                                .filter(({ rel }) => rel === 'item')
                                .map(({ href: url, type: format }) => ({ url: getFullHREF(serviceUrl, url), format }));
                            return {
                                tileMatrixSetLinks,
                                tile
                            };
                        })
                        .catch(() => null)
                )
            )
                .then(function(tilesResponses) {
                    const tileUrls = uniqBy(tilesResponses.reduce((acc, { tile }) => [...acc, ...tile], []), 'format');
                    const tileMatrixSetLinks = uniqBy(tilesResponses.reduce((acc, tilesResponse) => [...acc, ...(tilesResponse.tileMatrixSetLinks || [])], []), 'tileMatrixSet');
                    const { format } = (tileUrls.find((tileUrl) => tileUrl.format === 'application/vnd.mapbox-vector-tile' || tileUrl.format === 'image/png' || tileUrl.format === 'image/png' || tileUrl.format === 'image/png8') || tileUrls[0] || {});
                    return {
                        ...layer,
                        format,
                        tileUrls,
                        tileMatrixSetLinks
                    };
                });
        })
        .then(function({ tileMatrixSetLinks, ...layer }) {
            return axios.all(tileMatrixSetLinks
                .map(({ tileMatrixSetURI, tileMatrixSet, tileMatrixSetLimits }) => {
                    const tileMatrixSetCacheId = `${serviceUrl}:${tileMatrixSet}`;
                    if (tileMatrixSetCache[tileMatrixSetCacheId] !== undefined) {
                        return new Promise((resolve) => resolve(
                            tileMatrixSetCache[tileMatrixSetCacheId]
                                ? { ...tileMatrixSetCache[tileMatrixSetCacheId] }
                                : null
                        ));
                    }
                    return getTileMatrixSet({
                        serviceUrl,
                        tileMatrixSet,
                        tileMatrixSetURI,
                        tileMatrixSetLimits
                    }).then((response) => {

                        if (tileMatrixSetCache[tileMatrixSetCacheId] === undefined) {
                            tileMatrixSetCache[tileMatrixSetCacheId] = !response
                                ? null
                                : tileMatrixSetLimits
                                    ? { ...response, tileMatrixSetLimits }
                                    : response;
                        }
                        return tileMatrixSetCache[tileMatrixSetCacheId]
                            ? { ...tileMatrixSetCache[tileMatrixSetCacheId] }
                            : null;
                    });
                }))
                .then(function(response) {
                    const tileMatrixResponse = response.filter(val => val);
                    const allowedSRS = tileMatrixResponse.reduce((acc, tR) => {
                        return { ...acc, [getSRS(tR.tileMatrixSet)]: true };
                    }, {});

                    const tileMatrixSet = tileMatrixResponse.map((tR) => {
                        const tMS = tR.tileMatrixSet;
                        return {
                            'ows:Identifier': tMS.identifier,
                            'ows:SupportedCRS': tMS.supportedCRS,
                            'TileMatrix': tMS.tileMatrix
                                .map((tM) => ({
                                    'ows:Identifier': tM.identifier,
                                    'ScaleDenominator': tM.scaleDenominator,
                                    'TopLeftCorner': tM.topLeftCorner,
                                    'TileWidth': tM.tileWidth,
                                    'TileHeight': tM.tileHeight,
                                    'MatrixWidth': tM.matrixWidth,
                                    'MatrixHeight': tM.matrixHeight
                                }))
                        };
                    });

                    const matrixIds = tileMatrixResponse.reduce(function(acc, tR) {
                        return {
                            ...acc,
                            [tR.tileMatrixSet.identifier]: tR.tileMatrixSetLimits && tR.tileMatrixSetLimits
                                .map(function({ tileMatrix, maxTileCol, maxTileRow, minTileCol, minTileRow }) {
                                    return {
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
                                    };
                                })
                                || tR.tileMatrixSet && tR.tileMatrixSet.tileMatrix && tR.tileMatrixSet.tileMatrix
                                    .map(({ identifier }) => ({ identifier }))
                        };
                    }, {});
                    return { allowedSRS, tileMatrixSet, matrixIds, tileMatrixResponse, ...layer };
                });
        });
}

export const getTileSetMetadata = (collectionUrls, options) => {
    return axios.all(collectionUrls
        .map(({ url, ...layer }) =>
            collectionUrlToLayer(url, url)
                .then((collection = {}) => {
                    const { links = [] } = collection;
                    const queryablesUrl = (find(links, ({ rel, type }) => rel === 'queryables' && (type === 'application/json' || type === undefined)) || {}).href;
                    return axios.get(getFullHREF(url, queryablesUrl))
                        .then(({ data = {} } = {}) => {
                            const { queryables = {} } = data;
                            return { ...collection, id: layer.id, queryables };
                        })
                        .catch(() => {
                            return { ...collection, id: layer.id };
                        });
                })
        ))
        .then((collections) => {
            const {
                tileMatrixSetId = 'WebMercatorQuad'
            } = options || {};
            const filteredCollections = collections.filter(({ matrixIds }) => matrixIds[tileMatrixSetId]);
            const tileMatrixSet = filteredCollections && filteredCollections[0] && filteredCollections[0].tileMatrixResponse
                && find(filteredCollections[0].tileMatrixResponse, (collection = {}) => collection.tileMatrixSet.identifier === tileMatrixSetId);
            return {
                collections: filteredCollections,
                ...tileMatrixSet
            };
        })
        .then(({ collections, tileMatrixSet, tileMatrixSetLimits }) => {
            if (!tileMatrixSet) {
                return { error: 'tileMatrixSet is undefined' };
            }
            const {
                title = null,
                abstract = null,
                keywords = null,
                pointOfContact = null,
                version = null,
                accessConstraints = null,
                creationDate = Date.now(),
                publicationDate = null,
                revisionDate = null,
                validTillDate = null,
                receivedOnDate = null
            } = options || {}; // options provided client side

            return {
                "title": title, // client side
                "abstract": abstract, // client side
                "keywords": keywords, // client side
                "pointOfContact": pointOfContact, // client side
                "version": version, // client side
                "scope": "Tile Set", // fixed
                "accessConstraints": accessConstraints, // client side
                "dates": {
                    "creation": creationDate, // client side
                    "publication": publicationDate, // client side ?
                    "revision": revisionDate,  // client side ?
                    "validTill": validTillDate,  // client side ?
                    "receivedOn": receivedOnDate  // client side ?
                },
                "layers": collections.map((collection) => ({
                    // /collections/{collectionId}/
                    "id": collection.id,
                    "title": collection.title || collection.id,
                    "description": collection.description,
                    "data_type": null, // missing (why key it snake case?)
                    "geometry_type": null, // missing (why key it snake case?)
                    "min_zoom": null, // missing (why key it snake case?)
                    "max_zoom": null, // missing (why key it snake case?)

                    // /collections/{collectionId}/queryables/
                    "featureAttributes": collection.queryables
                })),

                "tileMatrixSetLink": {

                    // /collections/{collectionId}/tiles/tileMatrixSets/{tileMatrixSetId}
                    // or provided client side if the tileMatrixSets it's one of the default
                    "tileMatrixSet": {
                        "id": tileMatrixSet.identifier,
                        "title": tileMatrixSet.title,
                        "abstract": null, // missing
                        "keywords": null, // missing
                        "supportedCRS": tileMatrixSet.supportedCRS,

                        "wellKnownScaleSet": tileMatrixSet.wellKnownScaleSet, // missing gs
                        "boundingBox": tileMatrixSet.boundingBox, // different format and missing

                        "tileMatrix": tileMatrixSet.tileMatrix.map((tileMatrix) => ({
                            "id": tileMatrix.identifier,
                            "title": null, // missing
                            "abstract": null, // missing
                            "keywords": null, // missing
                            "scaleDenominator": tileMatrix.scaleDenominator,
                            "topLeftCorner": tileMatrix.topLeftCorner,
                            "tileWidth": tileMatrix.tileWidth,
                            "tileHeight": tileMatrix.tileHeight,
                            "matrixHeight": tileMatrix.matrixHeight,
                            "matrixWidth": tileMatrix.matrixWidth
                        }))
                    },

                    "tileMatrixSetLimits": {
                        // /collections/{collectionId}/tiles
                        // or provided client side if the tileMatrixSets it's one of the default
                        "tileMatrixLimits": tileMatrixSetLimits.map((tileMatrixSetLimit) => ({
                            "tileMatrix": tileMatrixSetLimit.tileMatrix,
                            "minTileRow": tileMatrixSetLimit.minTileRow,
                            "maxTileRow": tileMatrixSetLimit.maxTileRow,
                            "minTileCol": tileMatrixSetLimit.minTileCol,
                            "maxTileCol": tileMatrixSetLimit.maxTileCol
                        }))
                    }
                }
            };
        });
};


const searchAndPaginate = (json = {}, startPosition, maxRecords, text, serviceUrl) => {
    const { collections } = json;
    const filteredLayers = collections
        .filter((layer = {}) => !text
            || layer.id && layer.id.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || layer.name && layer.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
            || layer.title && layer.title.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    const layers = filteredLayers
        .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords);
    return axios.all(
        layers.map(function(collection) {
            const { links: collectionLinks } = collection;
            const collectionUrl = ((collectionLinks || []).find(({ rel, type }) =>
                rel === 'collection' && type === 'application/json' // gs
                || rel === 'self' && type === undefined // ii
                || rel === 'self' && type === 'application/json' // e
            ) || {}).href;
            return collectionUrlToLayer(collectionUrl, serviceUrl, collection)
                .then(layer => layer)
                .catch((err) => {
                    return {
                        ...collection,
                        error: err && (err.data || err.message) || 'Cannot get this collection'
                    };
                });
        })
    )
        .then((updatedLayers) => ({
            numberOfRecordsMatched: filteredLayers.length,
            numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
            nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
            records: updatedLayers
        }));
};

const getCollectionUrl = function(url) {
    return axios.get(url)
        .then(({ data }) => {
            const { links = [] } = data;
            const isTiled = links.find(({  rel }) => rel === 'tiles');
            return [
                links.find(({ type, rel }) => rel === 'data' && type === 'application/json' || rel === 'data' && type === undefined),
                isTiled ? data : null
            ];
        })
        .then(([res = {}, rootCollection]) => [getFullHREF(url, res.href), rootCollection]);
};

export const getRecords = function(url, startPosition, maxRecords, text) {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, url));
        });
    }
    return getCollectionUrl(url)
        .then(([parsedUrl, rootCollection]) =>
            axios.get(parsedUrl)
                .then(({ data }) => {
                    const dataWithRootCollection = rootCollection
                        ? {
                            ...data,
                            collections: [
                                rootCollection,
                                ...data.collections
                            ]
                        }
                        : data;
                    capabilitiesCache[url] = {
                        timestamp: new Date().getTime(),
                        data: dataWithRootCollection
                    };
                    return searchAndPaginate(dataWithRootCollection, startPosition, maxRecords, text, url);
                })
        );
};

export const getCollections = function(url) {
    const cacheKey = `${url}:collections`;
    const cached = capabilitiesCache[cacheKey];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(cached.data && cached.data.collections);
        });
    }
    return getCollectionUrl(url)
        .then(([parsedUrl, rootCollection]) =>
            axios.get(parsedUrl)
                .then(({ data }) => {
                    const dataWithRootCollection = rootCollection
                        ? {
                            ...data,
                            collections: [
                                rootCollection,
                                ...data.collections
                            ]
                        }
                        : data;
                    capabilitiesCache[cacheKey] = {
                        timestamp: new Date().getTime(),
                        data: dataWithRootCollection
                    };
                    return dataWithRootCollection && dataWithRootCollection.collections;
                })
        );
};

export const textSearch = function(url, startPosition, maxRecords, text) {
    return getRecords(url, startPosition, maxRecords, text);
};

export const reset = () => {
    Object.keys(capabilitiesCache).forEach(key => {
        delete capabilitiesCache[key];
    });
};
