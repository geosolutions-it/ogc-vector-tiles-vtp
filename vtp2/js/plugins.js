/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import LayoutPlugin from '@mapstore/plugins/Layout';

import MapPlugin from '@js/plugins/Map';
import LayersPlugin from '@js/plugins/Layers';

export const plugins = {
    LayoutPlugin,
    MapPlugin,
    LayersPlugin
};

export const requires = {};

export default {
    plugins,
    requires
};
