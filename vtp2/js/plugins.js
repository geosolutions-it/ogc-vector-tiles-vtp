/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import LayoutPlugin from '@mapstore/plugins/Layout';
import MapFooterPlugin from '@mapstore/plugins/MapFooter';
import CRSSelectorPlugin from '@mapstore/plugins/CRSSelector';

import MapPlugin from '@js/plugins/Map';
import LayersPlugin from '@js/plugins/Layers';
import OGCAPICatalogPlugin from '@js/plugins/OGCAPICatalog';
import LayerSettingsPlugin from '@js/plugins/LayerSettings';
import LayerFilterPlugin from '@js/plugins/LayerFilter';

export const plugins = {
    LayoutPlugin,
    MapPlugin,
    LayersPlugin,
    OGCAPICatalogPlugin,
    LayerSettingsPlugin,
    LayerFilterPlugin,
    MapFooterPlugin,
    CRSSelectorPlugin
};

export const requires = {};

export default {
    plugins,
    requires
};
