/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const axios = require('../../MapStore2/web/client/libs/ajax');
const assign = require('object-assign');
const {isArray, castArray, isNil, head} = require('lodash');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {setControlProperty} = require('../../MapStore2/web/client/actions/controls');
const {updateNode, selectNode, UPDATE_SETTINGS_PARAMS, changeLayerProperties} = require('../../MapStore2/web/client/actions/layers');
const {loadedStyle, loadingStyle} = require('../../MapStore2/web/client/actions/styleeditor');

const {layersSelector} = require('../../MapStore2/web/client/selectors/layers');
const {getUpdatedLayer} = require('../../MapStore2/web/client/selectors/styleeditor');
const uuidv1 = require('uuid/v1');
const url = require('url');

const makeValidMBStyle = (mbsStyle = {}, layer = {}) => {
    const name = layer.name;
    const spriteUrl = mbsStyle.sprite && url.parse(mbsStyle.sprite);
    const sprite = spriteUrl && spriteUrl.host && spriteUrl.path && `${spriteUrl.protocol}//${spriteUrl.host}${spriteUrl.path}`
        || spriteUrl && spriteUrl.path && `${window.location.protocol}//${window.location.host}${spriteUrl.path}`;
    return {
        version: 8,
        name,
        sources: {
            [name]: {
                type: 'vector'
            }
        },
        ...(sprite ? {sprite} : {}),
        layers: (mbsStyle.layers || [])
            .map(style => ({
                ...style,
                id: uuidv1(),
                source: name
            }))
    };
};

const getLocalStyles = ({availableStyles = [], ...layer}) => {
    const styles = availableStyles;
    let responses = [];
    let count = styles.length;
    return new Promise(function(resolve) {
        if (!styles || styles.length === 0) {
            resolve([]);
        } else {
            styles.forEach(({href}, idx) =>
                axios.get(href)
                    .then(({data}) => {
                        const styleBody = styles[idx].format === 'mbs' && makeValidMBStyle(data, layer) || data;
                        responses[idx] = assign({}, styles[idx], {styleBody});
                        count--;
                        if (count === 0) resolve(responses.filter(val => val));
                    })
                    .catch(() => {
                        responses[idx] = assign({}, styles[idx]);
                        count--;
                        if (count === 0) resolve(responses.filter(val => val));
                    })
                );
        }
    });
};

const initVectorStyles = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const layers = [{}, ...layersSelector(store.getState()).filter(({type}) => type === 'vectortile')];
            return Rx.Observable
                .from(layers
                    .map((layer) =>
                    Rx.Observable.defer(() => getLocalStyles(layer || {}).then((availableStyles) => assign({}, layer, {availableStyles})))
                ))
                .mergeAll()
                .scan((oldRes, newRes) => {
                    return isArray(oldRes) ? [...oldRes, newRes] : [oldRes, newRes];
                })
                .switchMap((updateLayers) => {
                    const newLayers = castArray(updateLayers);
                    return newLayers.length !== layers.length ? Rx.Observable.empty()
                    : Rx.Observable.concat(
                        Rx.Observable.from(newLayers.map(({id, availableStyles}) => updateNode(id, 'layer', availableStyles ? {availableStyles} : {}))),
                        Rx.Observable.of(loadedStyle(), selectNode('vtp:daraa_vtp', 'layer'))
                    );

                })
                .startWith(loadingStyle(status));
        });

const updateMapBgColor = (action$, store) =>
    action$.ofType(UPDATE_SETTINGS_PARAMS)
        .filter(({newParams}) => newParams && !isNil(newParams.style))
        .switchMap(({newParams}) => {
            const layer = {...getUpdatedLayer(store.getState()), style: newParams.style};
            const currentStyle = layer.style && head((layer.availableStyles || []).filter(({name}) => name === (layer.style || layer.availableStyles && layer.availableStyles[0] && layer.availableStyles[0].name)));
            return Rx.Observable.of(
                setControlProperty('map', 'style', currentStyle.backgroundColor ? { backgroundColor: currentStyle.backgroundColor } : {backgroundColor: '#f2f2f2'}),
                changeLayerProperties(currentStyle.backgroundLayer || 'none', {visibility: true})
            );
        });
module.exports = {
    initVectorStyles,
    updateMapBgColor
};
