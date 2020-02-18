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
import ToolbarPlugin from '@mapstore/plugins/Toolbar';
import ZoomInPlugin from '@mapstore/plugins/ZoomIn';
import ZoomOutPlugin from '@mapstore/plugins/ZoomOut';
import ZoomAllPlugin from '@mapstore/plugins/ZoomAll';
import BackgroundSelectorPlugin from '@mapstore/plugins/BackgroundSelector';
import OmnibarPlugin from '@mapstore/plugins/Omnibar';
import BurgerMenuPlugin from '@mapstore/plugins/BurgerMenu';
import MapImportPlugin from '@mapstore/plugins/MapImport';
import MapExportPlugin from '@mapstore/plugins/MapExport';
import HelpLinkPlugin from '@mapstore/plugins/HelpLink';
import ScaleBoxPlugin from '@mapstore/plugins/ScaleBox';

import MapPlugin from '@js/plugins/Map';
import LayersPlugin from '@js/plugins/Layers';
import OGCAPICatalogPlugin from '@js/plugins/OGCAPICatalog';
import LayerSettingsPlugin from '@js/plugins/LayerSettings';
import LayerFilterPlugin from '@js/plugins/LayerFilter';
import MapLoadingPlugin from '@js/plugins/MapLoading';
import LogoPlugin from '@js/plugins/Logo';
import MapTypePlugin from '@js/plugins/MapType';
import TileSetMetadataPlugin from '@js/plugins/TileSetMetadata';

export const plugins = {
    LayoutPlugin,
    MapPlugin,
    LayersPlugin,
    OGCAPICatalogPlugin,
    LayerSettingsPlugin,
    LayerFilterPlugin,
    MapFooterPlugin,
    CRSSelectorPlugin,
    MapLoadingPlugin,
    ToolbarPlugin,
    ZoomInPlugin,
    ZoomOutPlugin,
    ZoomAllPlugin,
    BackgroundSelectorPlugin,
    OmnibarPlugin,
    BurgerMenuPlugin,
    MapImportPlugin,
    MapExportPlugin,
    HelpLinkPlugin,
    LogoPlugin,
    ScaleBoxPlugin,
    MapTypePlugin,
    TileSetMetadataPlugin
};

export const requires = {};

export default {
    plugins,
    requires
};
