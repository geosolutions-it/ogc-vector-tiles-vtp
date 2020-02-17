/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    BingLayer: require('@mapstore/components/map/openlayers/plugins/BingLayer').default,
    GoogleLayer: require('@mapstore/components/map/openlayers/plugins/GoogleLayer').default,
    GraticuleLayer: require('@mapstore/components/map/openlayers/plugins/GraticuleLayer').default,
    MapQuest: require('@mapstore/components/map/openlayers/plugins/MapQuest').default,
    OSMLayer: require('@mapstore/components/map/openlayers/plugins/OSMLayer').default,
    OverlayLayer: require('@mapstore/components/map/openlayers/plugins/OverlayLayer').default,
    TileProviderLayer: require('@mapstore/components/map/openlayers/plugins/TileProviderLayer').default,
    VectorLayer: require('@mapstore/components/map/openlayers/plugins/VectorLayer').default,
    WFS3Layer: require('@mapstore/components/map/openlayers/plugins/WFS3Layer').default,
    WMSLayer: require('@mapstore/components/map/openlayers/plugins/WMSLayer').default,
    WMTSLayer: require('@mapstore/components/map/openlayers/plugins/WMTSLayer').default,

    OGCFeaturesLayer: require('@js/components/map/openlayers/plugins/OGCFeaturesLayer').default,
    OGCTileLayer: require('@js/components/map/openlayers/plugins/OGCTileLayer').default
};
