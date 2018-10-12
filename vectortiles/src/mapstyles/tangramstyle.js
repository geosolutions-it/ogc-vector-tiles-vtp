
/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the ISC-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = ({ url, spritesPath, sourceName }) => ({
    "sources": {
        "Daraa": {
            "type": "MVT",
            "url": `${url}/gwc/service/wmts?layer=${sourceName}&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/vnd.mapbox-vector-tile&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}`
        }
    },
    "styles": {
        "_transparent": {
            "base": "polygons",
            "blend": "translucent"
        }
    },
    "layers": {
        "HydrographyCrv": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "lines": {
                    "order": 4,
                    "color": "#00A0C6",
                    "cap": "round",
                    "join": "round",
                    "width": [
                        [
                            8,
                            "1px"
                        ],
                        [
                            13,
                            "2px"
                        ],
                        [
                            14,
                            "4px"
                        ]
                    ]
                }
            }
        },
        "HydrographySrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "polygons": {
                    "order": 5,
                    "color": "#B0E1ED"
                },
                "lines": {
                    "order": 5,
                    "color": "#00A0C6",
                    "width": "1px"
                }
            }
        },
        "CultureSrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "_transparent": {
                    "order": 2.5,
                    "color": "rgba(171, 146, 210, 0.5)"
                }
            }
        },
        "MilitarySrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "_transparent": {
                    "order": 2.5,
                    "color": "rgba(243, 96, 47, 0.5)"
                }
            }
        },
        "AgricultureSrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "_transparent": {
                    "order": 1,
                    "color": "rgba(3, 152, 89, 0.5)"
                }
            }
        },
        "VegetationSrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "polygons": {
                    "order": 1,
                    "color": "#C2E4B9"
                }
            }
        },
        "SettlementSrf": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "polygons": {
                    "order": 2,
                    "color": "#E8C3B2"
                },
                "lines": {
                    "order": 2,
                    "color": "#000000",
                    "width": [
                        [
                            8,
                            "1px"
                        ],
                        [
                            13,
                            "1px"
                        ],
                        [
                            14,
                            "2px"
                        ]
                    ],
                    "cap": "round",
                    "join": "round"
                }
            }
        },
        "UtilityInfrastructurePnt": {
            "data": {
                "source": "Daraa"
            },
            "filter": {
                "$zoom": {
                    "min": 13
                }
            },
            "draw": {
                "points": {
                    "color": "#000000",
                    "size": [
                        [
                            8,
                            "2px"
                        ],
                        [
                            13,
                            "10px"
                        ],
                        [
                            14,
                            "16px"
                        ]
                    ]
                }
            }
        },
        "FacilityPnt": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "points": {
                    "size": "8px",
                    "texture": `${spritesPath}/square.svg`
                }
            }
        },
        "CulturePnt": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "points": {
                    "size": "8px",
                    "texture": `${spritesPath}/square.svg`
                }
            }
        },
        "StructurePnt": {
            "data": {
                "source": "Daraa"
            },
            "draw": {
                "points": {
                    "size": "8px",
                    "texture": `${spritesPath}/square.svg`
                }
            }
        },
        "UtilityInfrastructureCrv": {
            "data": {
                "source": "Daraa"
            },
            "filter": {
                "F_CODE": "AT005"
            },
            "draw": {
                "lines": {
                    "order": 60,
                    "color": "#473895",
                    "width": [
                        [
                            8,
                            "1px"
                        ],
                        [
                            13,
                            "1px"
                        ],
                        [
                            14,
                            "4px"
                        ]
                    ],
                    "cap": "round",
                    "join": "round"
                }
            }
        },
        "TransportationGroundCrvBg": {
            "data": {
                "source": "Daraa",
                "layer": "TransportationGroundCrv"
            },
            "primary": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 3
                },
                "draw": {
                    "lines": {
                        "order": 15,
                        "color": "#000000",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "5px"
                            ],
                            [
                                14,
                                "12px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round"
                    }
                }
            },
            "secondary": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 4
                },
                "draw": {
                    "lines": {
                        "order": 15,
                        "color": "#000000",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "5px"
                            ],
                            [
                                14,
                                "12px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round"
                    }
                }
            },
            "street": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 5
                },
                "draw": {
                    "lines": {
                        "order": 15,
                        "color": "#000000",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "3.5px"
                            ],
                            [
                                14,
                                "9px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round"
                    }
                }
            },
            "bridge": {
                "filter": {
                    "F_CODE": "AQ040",
                    "TRS": 13
                },
                "draw": {
                    "lines": {
                        "order": 14,
                        "color": "#ffffff",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "6px"
                            ],
                            [
                                14,
                                "14px"
                            ]
                        ],
                        "join": "round",
                        "outline": {
                            "color": "#000000",
                            "width": [
                                [
                                    8,
                                    "1px"
                                ],
                                [
                                    13,
                                    "2px"
                                ],
                                [
                                    14,
                                    "3px"
                                ]
                            ]
                        }
                    }
                }
            }
        },
        "TransportationGroundCrv": {
            "data": {
                "source": "Daraa"
            },
            "primary": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 3
                },
                "draw": {
                    "lines": {
                        "order": 50,
                        "color": "#ff0000",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "3px"
                            ],
                            [
                                14,
                                "8px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round"
                    }
                }
            },
            "secondary": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 4
                },
                "draw": {
                    "lines": {
                        "order": 40,
                        "color": "#cb171a",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "3px"
                            ],
                            [
                                14,
                                "8px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round"
                    }
                }
            },
            "street": {
                "filter": {
                    "F_CODE": "AP030",
                    "RIN_ROI": 5
                },
                "draw": {
                    "lines": {
                        "order": 30,
                        "color": "#ffffff",
                        "width": [
                            [
                                8,
                                "1px"
                            ],
                            [
                                13,
                                "2px"
                            ],
                            [
                                14,
                                "6px"
                            ]
                        ],
                        "cap": "round",
                        "join": "round",
                        "outline": {
                            "color": "#000000",
                            "width": "1.5px"
                        }
                    }
                }
            }
        }
    }
});
