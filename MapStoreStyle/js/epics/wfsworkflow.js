/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const axios = require('../../MapStore2/web/client/libs/ajax');
const { get, head, isObject } = require('lodash');
const { INIT_WFS, CHANGE_BG_WFS, initWFS, setupDataWFS, SELECT_STYLE_WFS, updateSelectedWFS, UPDATE_FEATURE_WFS, UPDATE_CODE_WFS, SAVE_WFS_STYLE, selectStyleWFS } = require('../actions/wfsworkflow');
const { SET_CONTROL_PROPERTY, setControlProperty } = require('../../MapStore2/web/client/actions/controls');
const { addLayer, removeLayer, updateNode } = require('../../MapStore2/web/client/actions/layers');
const { layersSelector } = require('../../MapStore2/web/client/selectors/layers');
const VectorTileUtils = require('../../MapStore2/web/client/utils/VectorTileUtils');
const { error, success } = require('../../MapStore2/web/client/actions/notifications');
const uuidv1 = require('uuid/v1');
const url = require('url');
const { MAP_CONFIG_LOADED } = require('../../MapStore2/web/client/actions/config');

const groupId = 'WFS VTP';

const getFormat = ({ type = '', ...link }) => {

    if (type.toLocaleLowerCase().indexOf('geocss') !== -1) {
        return {
            ...link,
            f: 'css'
        };
    }
    if (type.toLocaleLowerCase().indexOf('sld') !== -1) {
        return {
            ...link,
            f: 'sld'
        };
    }
    return {
        ...link,
        f: 'mbstyle'
    };
};

const getNormalizedStyles = (result) => {
    const styles = get(result, 'styles.styles') || [];
    return styles
    .reduce((arr, { links, ...style }) => {
        return [
            ...arr,
            ...links.map((link) => {
                const data = getFormat(link);
                return {
                    link,
                    originalId: style.id,
                    id: style.id + data.f,
                    format: data.f,
                    name: style.id + data.f,
                    title: style.id.replace('_', ' '),
                    translated: links.length > 1 && data.f === 'sld',
                    _abstract: links.length > 1 && data.f === 'sld' ?
                    'translated server side' : '',
                    bodyUrl: link.href
                };
            }).filter(({format}) => format !== 'css')]
        ;
    }, []);
};
const vtpConfigLoaded = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .take(1)
        .switchMap(() => {
            return Rx.Observable.of(
                setControlProperty('leftmenu', 'activePlugin', 'WFSPanel')
            );
        });

const vtpTriggerInit = (action$) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter(({ control, value }) => control === 'leftmenu' && value === 'WFSPanel')
        .take(1)
        .switchMap(() => {
            return Rx.Observable.of(initWFS());
        });

const vtpSaveWFS = (action$, store) =>
    action$.ofType(SAVE_WFS_STYLE)
        .switchMap((action) => {
            const originalId = get(action, 'style.originalId');
            const code = get(action, 'style.code');
            const type = get(action, 'style.link.type');
            const [ username, password ] = (get(action, 'style.auth') || '').split('/');
            const service = get(store.getState(), 'wfsworkflow.service');
            return Rx.Observable.defer(() => axios.put(`${service.stylesUrl}${originalId}?f=${type}`, code, {
                    headers: {
                        'Content-Type': type
                    },
                    auth: {
                        username,
                        password
                    }
                }))
                .switchMap(() => {
                    return Rx.Observable.of(
                        success({
                            title: "Success",
                            message: `${originalId} style has been saved`,
                            uid: "saveSuccess",
                            autoDismiss: 5
                        })
                    );
                })
                .catch((e) => {
                    return Rx.Observable.of(
                        error({
                            title: "Error",
                            message: `${originalId} style could not be saved${e.message && ` - ${e.message}`}`,
                            uid: "saveError",
                            autoDismiss: 5
                        })
                    );
                });
        });

const vtpWFSBg = (action$, store) =>
    action$.ofType(CHANGE_BG_WFS)
    .switchMap(() => {
        const bg = get(store.getState(), 'controls.map.style.backgroundColor');
        return Rx.Observable.of(
            setControlProperty('map', 'style', {backgroundColor: bg === '#201747' ? '#f2f2f2' : '#201747'})
        );
    });
const vtpWFSRequest = (action$, store) =>
    action$.ofType(INIT_WFS)
        .switchMap(() => {

            return Rx.Observable
                .defer(() => axios.get('/static/mapstorestyle/wfs3Servicies.json').then(({ data }) => data))
                .switchMap((services) => {
                    const { query = {}} = url.parse(get(store.getState(), 'routing.location.search'), true);
                    const service = services[query.wfs3] || services.geo_solutions;
                    const requestUrls = [
                        {
                            name: 'sources',
                            url: service.collectionsUrl
                        },
                        {
                            name: 'styles',
                            url: service.stylesUrl
                        }
                    ];
                    return Rx.Observable
                        .defer(() => axios.all(requestUrls
                            .map(({ url: _url, name }) =>
                                axios.get(_url)
                                    .then(({ data }) => ({ name, data }))
                                    .catch(() => null)
                                )
                            )
                        )
                        .switchMap((response) => {
                            const result = response
                                .filter(val => val)
                                .reduce((group, { name, data }) => ({
                                    ...group,
                                    [name]: data
                                }), { });
                            return Rx.Observable
                                .defer(() => axios.all((getNormalizedStyles(result) || [])
                                    .map(({ bodyUrl, ...style }) =>
                                        axios.get(bodyUrl)
                                            .then(({ data }) => ({ ...style, code: data }))
                                            .catch(() => style)
                                        )
                                    )
                                )
                                .switchMap((newStyles) => {
                                    return Rx.Observable.defer(() => {
                                        const mbstylesWithSprite = newStyles.filter((style) => style.format === 'mbstyle' && style.code && style.code.sprite);
                                        const otherStyles = newStyles.filter((style) => !(style.format === 'mbstyle' && style.code && style.code.sprite));
                                        return axios.all([
                                            ...mbstylesWithSprite.map(style =>
                                                axios(`${style.code.sprite}.json`)
                                                    .then(({data: spriteData}) => {
                                                        return {
                                                            ...style,
                                                            spriteData,
                                                            spriteUrl: `${style.code.sprite}.png`
                                                        };
                                                    })
                                                    .catch(() => style)),
                                            ...otherStyles.map((style) => new Promise((resolve) => resolve(style)))
                                        ]);
                                    }).switchMap((styles) => {
                                        const collections = (get(result, 'sources.collections') || []);
                                        const stylesWithSplitCode = styles.map((style = {}) => {
                                            let splitted = [];
                                            try {
                                                splitted = VectorTileUtils.splitCode(style.format, style.code)
                                                    .map((code) => {
                                                        const layer = head(collections.filter(({ name }) => name === code.layer));
                                                        if (!layer) {
                                                            return null;
                                                        }
                                                        return {
                                                            ...layer,
                                                            style: {
                                                                ...code,
                                                                spriteData: style.spriteData,
                                                                spriteUrl: style.spriteUrl
                                                            }
                                                        };
                                                    }).filter((val, idx) => val && idx < 12);
                                            } catch(e) {
                                                splitted = [];
                                            }
                                            return {
                                                ...style,
                                                splitted
                                            };
                                        }).filter(({ splitted }) => splitted.length > 0);
                                        const mbstyles = stylesWithSplitCode.filter(sty => sty.format === 'mbstyle').sort((a, b) => a.title > b.title ? 1 : -1);
                                        const slds = stylesWithSplitCode.filter(sty => sty.format === 'sld' && !sty.translated).sort((a, b) => a.title > b.title ? 1 : -1);
                                        const translated = stylesWithSplitCode.filter(sty => sty.format === 'sld' && sty.translated).sort((a, b) => a.title > b.title ? 1 : -1);
                                        const allStyles = [ ...slds, ...mbstyles, ...translated ];
                                        const firstStyle = head(allStyles);
                                        return Rx.Observable.of(
                                            setupDataWFS({ service, sources: { collections }, styles: allStyles}),
                                            ...(firstStyle && firstStyle.name && [selectStyleWFS({ style: firstStyle.name })] || [])
                                        );
                                    });
                                });
                        });
                });
        });

const vtpWFSelectStyle = (action$, store) =>
    action$.ofType(SELECT_STYLE_WFS)
        .switchMap(({ data }) => {
            const state = store.getState();
            const styles = get(state, 'wfsworkflow.styles');
            const layers = layersSelector(state);
            const wfsLayers = layers.filter(layer => layer.group === groupId);
            const selected = head(styles.filter(({ name }) => data.style === name));
            return Rx.Observable.of(
                updateSelectedWFS(selected.name)
            )
            .concat(
                Rx.Observable
                    .from(wfsLayers)
                    .mergeMap((layer) => {
                        return Rx.Observable.of(removeLayer(layer.id));
                    }),
                Rx.Observable
                    .from(selected.splitted)
                    .mergeMap((layer) => {
                        return Rx.Observable.of(
                            addLayer({
                                ...layer,
                                id: uuidv1(),
                                group: groupId,
                                type: 'wfs3'
                            })
                        );
                    })
            );
        });

const baseCode = {
    sld: ({ name }) =>
    `<sld:Name>${name}</sld:Name>
    <sld:UserStyle>
        <sld:FeatureTypeStyle>
            <sld:Rule>
                <sld:PolygonSymbolizer>
                    <sld:Fill>
                        <sld:CssParameter name="fill">#ddd</sld:CssParameter>
                    </sld:Fill>
                    <sld:Stroke>
                        <sld:CssParameter name="stroke">#333</sld:CssParameter>
                    </sld:Stroke>
                </sld:PolygonSymbolizer>
                <sld:LineSymbolizer>
                    <sld:Stroke>
                        <sld:CssParameter name="stroke">#333</sld:CssParameter>
                    </sld:Stroke>
                </sld:LineSymbolizer>
                <sld:PointSymbolizer>
                    <sld:Graphic>
                        <sld:Mark>
                            <sld:WellKnownName>circle</sld:WellKnownName>
                            <sld:Fill>
                                <sld:CssParameter name="fill">#333</sld:CssParameter>
                            </sld:Fill>
                        </sld:Mark>
                        <sld:Size>6</sld:Size>
                    </sld:Graphic>
                </sld:PointSymbolizer>
            </sld:Rule>
        </sld:FeatureTypeStyle>
    </sld:UserStyle>`,
    mbstyle: ({ name }) => [
        {
            "type": "fill",
            "source-layer": name,
            "layout": {},
            "paint": {
                "fill-color": "#ddd"
            },
            "id": uuidv1(),
            "source": name
        },
        {
            "type": "line",
            "source-layer": name,
            "layout": {},
            "paint": {
                "line-color": "#333",
                "line-width": 2
            },
            "id": uuidv1(),
            "source": name
        },
        {
            "type": "circle",
            "source-layer": name,
            "layout": {},
            "paint": {
                "circle-color": "#333",
                "circle-radius": 4
            },
            "id": uuidv1(),
            "source": name
        }
    ]
};
const vtpUpdateCodeWFS = (action$, store) =>
    action$.ofType(UPDATE_CODE_WFS)
        .switchMap((action) => {
            const state = store.getState();
            const styles = get(state, 'wfsworkflow.styles');
            const selectedId = get(state, 'wfsworkflow.selectedId');
            const id = get(action, 'id.name');
            const layers = layersSelector(state);
            const layer = head(layers.filter(ly => ly.name === id));
            const selected = head(styles.filter(({ name }) => selectedId === name));
            const newStyles = styles.map((stl) => {
                if (stl.name === selectedId) {
                    const splitted = stl.splitted
                        .map(part => {
                            if (part.name === id) {
                                return {
                                    ...part,
                                    style: {
                                        ...part.style,
                                        code: action.code
                                    }
                                };
                            }
                            return part;
                        });
                    const sourceName = head(Object.keys(isObject(selected) && get(selected, 'code.sources') || {}));
                    const code = VectorTileUtils.wrapSplittedStyle(stl.format, splitted.map(part => part.style), sourceName);
                    return {
                        ...stl,
                        code,
                        splitted
                    };
                }
                return stl;
            });
            return Rx.Observable.of(
                updateNode(layer.id, 'layer', { style: { ...layer.style, code: action.code } }),
                setupDataWFS({ styles: newStyles })
            );
        });

const vtpAddRemoveWFS = (action$, store) =>
    action$.ofType(UPDATE_FEATURE_WFS)
        .switchMap((action) => {
            const state = store.getState();
            const styles = get(state, 'wfsworkflow.styles');
            const selectedId = get(state, 'wfsworkflow.selectedId');
            const selected = head(styles.filter(({ name }) => selectedId === name));
            if (!action.remove) {
                const collections = get(state, 'wfsworkflow.sources.collections');
                const layer = head(collections.filter(({ name }) => action.id === name));
                const newLayer = {
                    ...layer,
                    style: {
                        format: selected.format,
                        layer: layer.name,
                        code: baseCode[selected.format](layer)
                    }
                };
                const newStyles = styles.map((stl) => {
                    if (stl.name === selectedId) {
                        const splitted = [
                            ...stl.splitted,
                            newLayer
                        ];
                        const sourceName = head(Object.keys(isObject(selected) && get(selected, 'code.sources') || {}));
                        const code = VectorTileUtils.wrapSplittedStyle(stl.format, splitted.map(part => part.style), sourceName);
                        return {
                            ...stl,
                            code,
                            splitted
                        };
                    }
                    return stl;
                });
                return Rx.Observable.of(
                    addLayer({
                        ...newLayer,
                        id: uuidv1(),
                        group: groupId,
                        type: 'wfs3'
                    }),
                    setupDataWFS({ styles: newStyles })
                );
            }
            const layers = layersSelector(state);
            const layer = head(layers.filter(ly => ly.name === action.id));
            const newStyles = styles.map((stl) => {
                if (stl.name === selectedId) {
                    const splitted = stl.splitted.filter(part => part.name !== action.id);
                    const sourceName = head(Object.keys(isObject(selected) && get(selected, 'code.sources') || {}));
                    const code = VectorTileUtils.wrapSplittedStyle(stl.format, splitted.map(part => part.style), sourceName);
                    return {
                        ...stl,
                        code,
                        splitted
                    };
                }
                return stl;
            });
            return Rx.Observable.of(
                removeLayer(layer.id),
                setupDataWFS({ styles: newStyles })
            );
        });
module.exports = {
    vtpTriggerInit,
    vtpWFSRequest,
    vtpWFSelectStyle,
    vtpAddRemoveWFS,
    vtpUpdateCodeWFS,
    vtpSaveWFS,
    vtpWFSBg,
    vtpConfigLoaded
};
