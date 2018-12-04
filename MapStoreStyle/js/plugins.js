/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        MapPlugin: require('./plugins/Map'),
        TOCPlugin: require('./plugins/TOC'),
        LeftMenuPlugin: require('./plugins/LeftMenu'),
        BrandNavbarPlugin: require('./plugins/BrandNavbar'),
        MapLoadingPlugin: require('./plugins/MapLoading'),
        IdentifyPlugin: require('./plugins/Identify'),

        BackgroundSelectorPlugin: require('../MapStore2/web/client/plugins/BackgroundSelector'),
        ToolbarPlugin: require('../MapStore2/web/client/plugins/Toolbar'),
        ZoomInPlugin: require('../MapStore2/web/client/plugins/ZoomIn'),
        ZoomOutPlugin: require('../MapStore2/web/client/plugins/ZoomOut')
    },
    requires: {}
};
