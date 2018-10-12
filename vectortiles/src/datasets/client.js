/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

require('./css/style.css');

const { join } = require('lodash');

const openlayersMap = require('./lib/openlayers');
const tinycolor = require('tinycolor2');

const axios = require('axios');
axios.get('./datasetConfig.json')
    .then(({ data = {} }) => {

        const url = data.url;
        const layersName = data.sources;
        const buttonsContainer =  document.createElement('div');
        const minZoom = data.minZoom;
        const buttons = layersName.map(({layer, color, center, zoom, label}) => {
            const btn = document.createElement('button');
            btn.innerHTML = label || layer;
            btn.style.color = tinycolor.mostReadable(color, ['#000', '#fff']).toHexString();
            btn.style.backgroundColor = color;
            buttonsContainer.appendChild(btn);
            return {
                btn,
                color,
                center,
                zoom
            };
        });
    
        openlayersMap({
            target: 'vt-openlayers-map',
            center: data.center || layersName[0].center,
            zoom: data.zoom || layersName[0].zoom,
            url,
            buttons,
            layersName,
            minZoom
        });

        const requests = [];

        const snippet = requests.map(req => {
            const params = req.params && Object.keys(req.params).map((key) => `<b>${key}</b>=<i>${req.params[key]}</i>`) || '';
            return '<div class="vt-comment"><small>' + req.comment + '</small></div>' + req.url + join((req.path || []).map(val => `<b>${val}</b>`), '/') + join(params, ' &');
        }, '');

        const snippetDOM = document.getElementById('vt-snippet');
        snippetDOM.innerHTML = '<div>' + join(snippet, '<br/>') + '</div>';

        snippetDOM.appendChild(buttonsContainer);

        document.body.removeChild(document.getElementById('loading'));
    });
