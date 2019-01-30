/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const INIT_WFS = 'WFS_WORKFLOW:WFS_INIT';
const SETUP_DATA_WFS = 'WFS_WORKFLOW:SETUP_DATA_WFS';
const SELECT_STYLE_WFS = 'WFS_WORKFLOW:SELECT_STYLE_WFS';
const UPDATE_SELECTED_WFS = 'WFS_WORKFLOW:UPDATE_SELECTED_WFS';
const UPDATE_FEATURE_WFS = 'WFS_WORKFLOW:UPDATE_FEATURE_WFS';
const UPDATE_CODE_WFS = 'WFS_WORKFLOW:UPDATE_CODE_WFS';
const SAVE_WFS_STYLE = 'WFS_WORKFLOW:SAVE_WFS_STYLE';
const CHANGE_BG_WFS = 'WFS_WORKFLOW:CHANGE_BG_WFS';
function initWFS() {
    return {
        type: INIT_WFS
    };
}

function setupDataWFS(data) {
    return {
        type: SETUP_DATA_WFS,
        data
    };
}

function selectStyleWFS(data) {
    return {
        type: SELECT_STYLE_WFS,
        data
    };
}

function updateSelectedWFS(id) {
    return {
        type: UPDATE_SELECTED_WFS,
        id
    };
}

function updateFeatureWFS(remove, id) {
    return {
        type: UPDATE_FEATURE_WFS,
        remove,
        id
    };
}

function updateCodeWFS(id, code) {
    return {
        type: UPDATE_CODE_WFS,
        code,
        id
    };
}

function saveWFSStyle(style) {
    return {
        type: SAVE_WFS_STYLE,
        style
    };
}
function changeBgWFS() {
    return {
        type: CHANGE_BG_WFS
    };
}


module.exports = {
    INIT_WFS,
    initWFS,
    SETUP_DATA_WFS,
    setupDataWFS,
    SELECT_STYLE_WFS,
    selectStyleWFS,
    UPDATE_SELECTED_WFS,
    updateSelectedWFS,
    UPDATE_FEATURE_WFS,
    updateFeatureWFS,
    UPDATE_CODE_WFS,
    updateCodeWFS,
    SAVE_WFS_STYLE,
    saveWFSStyle,
    CHANGE_BG_WFS,
    changeBgWFS
};
