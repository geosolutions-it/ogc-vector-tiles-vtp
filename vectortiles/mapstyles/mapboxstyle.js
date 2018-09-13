/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const HydrographyCrv = (source) => [{
    "id": "HydrographyCrv",
    "type": "line",
    "source": source,
    "source-layer": "HydrographyCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "BH140"
        ]
    ],
    "layout": {},
    "paint": {
        "line-color": "#00A0C6",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 2,
            13, 4
        ]
    }
}];

const HydrographySrfLake = (source) => [{
    "id": "HydrographySrfLake",
    "type": "fill",
    "source": source,
    "source-layer": "HydrographySrf",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "BH082"
        ]
    ],
    "layout": {},
    "paint": {
        "fill-color": "#B0E1ED",
        "fill-outline-color": "#00A0C6"
    }
}];

const AgricultureSrf = (source) => [{
    "id": "AgricultureSrf",
    "type": "fill",
    "source": source,
    "source-layer": "AgricultureSrf",
    "layout": {},
    "paint": {
        "fill-color": "rgb(3, 152, 89)",
        "fill-opacity": 0.5
    }
}];

const VegetationSrf = (source) => [{
    "id": "VegetationSrf",
    "type": "fill",
    "source": source,
    "source-layer": "VegetationSrf",
    "layout": {},
    "paint": {
        "fill-color": "#C2E4B9"
    }
}];

const SettlementSrf = (source) => [{
    "id": "SettlementSrfStroke",
    "type": "line",
    "source": source,
    "source-layer": "SettlementSrf",
    "layout": {},
    "paint": {
        "line-color": "#000000",
        "line-width": 2
    }
},
{
    "id": "SettlementSrfFill",
    "type": "fill",
    "source": source,
    "source-layer": "SettlementSrf",
    "layout": {},
    "paint": {
        "fill-color": "#E8C3B2"
    }
}];

const UtilityInfrastructurePnt = (source) => [{
    "id": "UtilityInfrastructurePnt",
    "type": "circle",
    "source": source,
    "source-layer": "UtilityInfrastructurePnt",
    "layout": {},
    "minzoom": 12,
    "paint": {
        "circle-radius": [
            "step", ["zoom"],
            1,
            8, 5,
            13, 8
        ],
        "circle-color": "#000000"
    }
}];

const UtilityInfrastructureCrv = (source) => [{
    "id": "UtilityInfrastructureCrv",
    "type": "line",
    "source": source,
    "source-layer": "UtilityInfrastructureCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AT005"
        ]
    ],
    "layout": {},
    "paint": {
        "line-color": "#473895",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 1,
            13, 4
        ]
    }
}];

const FacilityPnt = (source) => [{
    "id": "FacilityPnt",
    "type": "symbol",
    "source": source,
    "source-layer": "FacilityPnt",
    "layout": {
        "icon-image": "square",
        "icon-size": 0.25
    },
    "paint": {
        "icon-opacity": 1
    }
}];

const CulturePnt = (source) => [{
    "id": "CulturePnt",
    "type": "symbol",
    "source": source,
    "source-layer": "CulturePnt",
    "layout": {
        "icon-image": "square",
        "icon-size": 0.25
    },
    "paint": {
        "icon-opacity": 1
    }
}];

const StructurePnt = (source) => [{
    "id": "StructurePnt",
    "type": "symbol",
    "source": source,
    "source-layer": "StructurePnt",
    "layout": {
        "icon-image": "square",
        "icon-size": 0.25
    },
    "paint": {
        "icon-opacity": 1
    }
}];

const MilitarySrf = (source) => [{
    "id": "MilitarySrf",
    "type": "fill",
    "source": source,
    "source-layer": "MilitarySrf",
    "layout": {},
    "paint": {
        "fill-color": "#f3602f",
        "fill-opacity": 0.5
    }
}];

const CultureSrf = (source) => [{
    "id": "CultureSrf",
    "type": "fill",
    "source": source,
    "source-layer": "CultureSrf",
    "layout": {},
    "paint": {
        "fill-color": "#ab92d2",
        "fill-opacity": 0.5
    }
}];

const TransportationGroundCrv = (source) => [{
    "id": "TransportationGroundCrvBridgeBack",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AQ040"
        ],
        [
            "==",
            "TRS",
            13
        ]
    ],
    "layout": {
        "line-join": "round"
    },
    "paint": {
        "line-color": "#000000",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 9,
            13, 20
        ]
    }
}, {
    "id": "TransportationGroundCrvBridge",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AQ040"
        ],
        [
            "==",
            "TRS",
            13
        ]
    ],
    "layout": {
        "line-join": "round"
    },
    "paint": {
        "line-color": "#ffffff",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 6,
            13, 14
        ]
    }
}, {
    "id": "TransportationGroundCrv",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            3
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#000000",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 5,
            13, 12
        ]
    }
},
{
    "id": "TransportationGroundCrv2",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            4
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#000000",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 5,
            13, 12
        ]
    }
}, {
    "id": "TransportationGroundCrv1444",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            5
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#000000",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 3.5,
            13, 9
        ]
    }
}, {
    "id": "TransportationGroundCrv144",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            5
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#ffffff",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 2,
            13, 6
        ]
    }
}, {
    "id": "TransportationGroundCrv3",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            4
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#cb171a",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 3,
            13, 8
        ]
    }
}, {
    "id": "TransportationGroundCrv1",
    "type": "line",
    "source": source,
    "source-layer": "TransportationGroundCrv",
    "filter": [
        "all",
        [
            "==",
            "F_CODE",
            "AP030"
        ],
        [
            "==",
            "RIN_ROI",
            3
        ]
    ],
    "layout": {
        "line-join": "round",
        "line-cap": "round"
    },
    "paint": {
        "line-color": "#ff0000",
        "line-width": [
            "step", ["zoom"],
            1,
            8, 3,
            13, 8
        ]
    }
}];

module.exports = ({ showRaster, src, spritesPath, sourceName} = {}) => ({
    "version": 8,
    "sources": src,
    "sprite":  `${spritesPath}/sprites`,
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "#ffffff"
            }
        },
        ...(showRaster ? [{
            "id": "landsat8",
            "type": "raster",
            "source": "landsat8",
            "source-layer": "landsat8",
            "paint": {}
        }] : []),
        ...AgricultureSrf(sourceName),
        ...VegetationSrf(sourceName),
        ...SettlementSrf(sourceName),
        ...MilitarySrf(sourceName),
        ...CultureSrf(sourceName),
        ...HydrographyCrv(sourceName),
        ...HydrographySrfLake(sourceName),
        ...TransportationGroundCrv(sourceName),
        ...UtilityInfrastructureCrv(sourceName),
        ...UtilityInfrastructurePnt(sourceName),
        ...FacilityPnt(sourceName),
        ...CulturePnt(sourceName),
        ...StructurePnt(sourceName)
    ]
});