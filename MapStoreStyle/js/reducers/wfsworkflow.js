/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { SETUP_DATA_WFS, UPDATE_SELECTED_WFS } = require('../actions/wfsworkflow');

function wfsworkflow(state = null, action) {
    switch (action.type) {
    case SETUP_DATA_WFS: {
        return { ...state, ...action.data };
    }
    case UPDATE_SELECTED_WFS: {
        return { ...state, selectedId: action.id };
    }
    default:
        return state;
    }
}

module.exports = wfsworkflow;

