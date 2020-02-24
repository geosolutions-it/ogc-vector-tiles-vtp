/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { useEffect, useRef } from 'react';
import Draw, { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';

const GeoJSONFormat = new GeoJSON();

const getDrawOptions = (type) => {
    switch (type) {
    case 'Point': {
        return {
            type: 'Point'
        };
    }
    case 'Polygon': {
        return {
            type: 'Polygon'
        };
    }
    case 'Rectangle': {
        return {
            type: 'Circle',
            geometryFunction: createBox()
        };
    }
    default:
        return {
            type: 'Circle',
            geometryFunction: createBox()
        };
    }
};

function SpatialFilterSupport({
    map,
    enabled,
    drawType,
    onAddFeature = () => {},
    onRemoveFeature = () => {}
}) {

    const drawInteraction = useRef(null);
    const drawOverlay = useRef(null);

    const removeDraw = () => {
        onRemoveFeature();
        if (map && map.removeInteraction
        && drawInteraction && drawInteraction.current
        && drawOverlay && drawOverlay.current) {
            map.removeInteraction(drawInteraction.current);
            drawOverlay.current.getSource().clear();
            map.removeLayer(drawOverlay.current);
        }
    };

    useEffect(() => {
        removeDraw();
        if (map && enabled) {
            const source = new VectorSource({ wrapX: false });
            drawOverlay.current = new VectorLayer({
                source,
                zIndex: 9999
            });
            drawInteraction.current = new Draw({
                source: source,
                ...getDrawOptions(drawType)
            });
            map.addLayer(drawOverlay.current);
            map.addInteraction(drawInteraction.current);
            drawInteraction.current.on('drawstart', () => {
                drawOverlay.current.getSource().clear();
                onRemoveFeature();
            });
            drawInteraction.current.on('drawend', (event) => {
                const olFeature = event.feature && event.feature.clone();
                const featureProjection = map.getView().getProjection().getCode();
                const extent = olFeature.getGeometry().transform(featureProjection, 'EPSG:4326').getExtent();
                const jsonString = GeoJSONFormat.writeFeature(olFeature, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326'
                });
                const feature = JSON.parse(jsonString);
                onAddFeature({
                    ...feature,
                    geometry: {
                        ...(feature && feature.geometry),
                        extent
                    }
                });
            });
        }
        return () => removeDraw();
    }, [ enabled, drawType ]);


    return null;
}

export default SpatialFilterSupport;
