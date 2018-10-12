/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

require('./css/style.css');

const { join, template } = require('lodash');

const openlayersMap = require('./lib/openlayers');
const tinycolor = require('tinycolor2');

const center = { lng: 32.61751911206343, lat: 36.09650048440878 };
const zoom = 13;

const axios = require('axios');
axios.get('./wfsConfig.json')
    .then(({ data }) => {
        const { maps } = data;
        const mapsContainer = document.getElementById('vt-container');

        let olMaps = [];

        const colorInputs = [
            '#ff33aa',
            '#33ffaa',
            '#aaaaaa',
            '#440044'
        ].map((value) => {
            
            const input = document.createElement('input');
            input.setAttribute('value', value);
            input.style.backgroundColor = value;
            input.style.color = tinycolor.mostReadable(value, ['#000', '#fff']).toHexString();
            input.onchange = (event) => {
                const color = tinycolor(event.target.value).toHexString();
                input.style.backgroundColor = color;
                input.style.color = tinycolor.mostReadable(color, ['#000', '#fff']).toHexString();
            };
            return input;
        });

        const inputs = document.createElement('div');
        const applyColor = document.createElement('button');
        applyColor.innerHTML = '⭮';
        const editor = document.createElement('div');
        editor.setAttribute('class', 'vt-color-editor');

        colorInputs.forEach(input => {
            inputs.appendChild(input);
        });

        editor.appendChild(inputs);
        editor.appendChild(applyColor);

        maps.forEach(({ id, title, schemeId, urls, baseUrl, type }, idx) => {

            const container = document.createElement('div');
            container.setAttribute('class', `vt-pos-${idx} vt-map-container`);
            const desc = document.createElement('div');
            desc.setAttribute('class', 'vt-map-desc');
            desc.innerHTML = title;
            const target = document.createElement('div');
            target.setAttribute('id', id);
            target.setAttribute('class', 'vt-map-target');

            container.appendChild(desc);
            container.appendChild(target);

            mapsContainer.appendChild(container);

            if (urls) {
                const popup = document.createElement('div');
                popup.setAttribute('class', 'ol-popup');
                const popupCloser = document.createElement('a');
                popupCloser.setAttribute('class', 'ol-popup-closer');
                const popupContent = document.createElement('div');
                popupContent.setAttribute('class', 'ol-popup-content');
                popup.appendChild(popupCloser);
                popup.appendChild(popupContent);

                container.appendChild(popup);
                const buildUrls = urls.map(url => `${baseUrl}${template(url)({ schemeId })}`);
                olMaps.push(
                    openlayersMap(id, olMaps, {
                        urls: buildUrls,
                        center,
                        zoom,
                        epsg: schemeId,
                        popup,
                        popupCloser,
                        popupContent,
                        type,
                        colorInputs,
                        applyColor
                    })
                );
            }
        });

        const requests = [
            {
                url: '/geoserver/wfs3',
                comment: 'WFS API',
                path: [],
                params: {}
            },
            {
                url: '/geoserver/wfs3/collections/',
                comment: 'WFS Tile Request',
                path: ['{layerName}', 'tiles', '{schemeId}', '{z}', '{y}', '{x}'],
                params: {}
            }
        ];

        const snippet = requests.map(req => {
            const params = req.params && Object.keys(req.params).map((key) => `<b>${key}</b>=<i>${req.params[key]}</i>`) || '';
            return '<div class="vt-comment"><small>' + req.comment + '</small></div>' + req.url + join((req.path || []).map(val => `<b>${val}</b>`), '/') + join(params, ' &');
        }, '');

        const snippetDOM = document.getElementById('vt-snippet');
        snippetDOM.innerHTML = '<div>' + join(snippet, '<br/>') + '</div>';

        snippetDOM.appendChild(editor);

        document.body.removeChild(document.getElementById('loading'));
    });
