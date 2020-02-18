/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useState, useRef } from 'react';
import Filter from '@mapstore/components/misc/Filter';

function OLVectorFeaturesInfo({
    map,
    enabled
}) {
    const isEnabled = useRef(enabled);
    isEnabled.current = enabled;

    const [features, setFeatures] = useState([]);
    const [pixel, setPixel] = useState([]);
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        const onMoveStart = () => {
            if (isEnabled.current) {
                setFeatures([]);
            }
        };
        const onClick = (event) => {
            if (isEnabled.current) {
                const newFeatures = (event.map.getFeaturesAtPixel(event.pixel) || [])
                    .map((olFeature) => ({
                        geomType: olFeature.getType(),
                        layer: olFeature.getProperties()._layer_,
                        properties: olFeature.getProperties() || {}
                    }));
                setFeatures(newFeatures);
                setPixel(event.pixel);
            }
        };
        map.on('movestart', onMoveStart);
        map.on('click', onClick);
    }, []);

    useEffect(() => {
        if (!enabled) {
            setFeatures([]);
        }
    }, [enabled]);
    return features.length > 0 ? (
        <div
            className="shadow-far"
            style={{
                position: 'absolute',
                left: pixel[0],
                top: pixel[1],
                backgroundColor: '#fff',
                maxHeight: 256,
                width: 256,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
            <div style={{ padding: '0 8px 4px 8px' }}><Filter
                filterPlaceholder="Filter by property key"
                filterText={filterText}
                onFilter={(value) => setFilterText(value)}/></div>
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'auto',
                    padding: 8
                }}>
                {features.map((feature, idx) => {
                    return (
                        <div key={idx} style={{ marginBottom: 4, borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
                            <div style={{ marginBottom: 4, display: 'flex', fontSize: 12, wordBreak: 'break-word', fontWeight: 'bold' }}>{feature.layer}</div>
                            {Object.keys(feature.properties)
                                .filter((key) => !filterText
                                || key.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) !== -1)
                                .map((key) => {
                                    return (
                                        <div key={key} style={{ display: 'flex', fontSize: 10, wordBreak: 'break-word' }}>
                                            <div style={{ flex: 1 }}>{key}</div>
                                            <div style={{ flex: 1 }}>{feature.properties[key]}</div>
                                        </div>
                                    );
                                })}
                        </div>
                    );
                })}
            </div>
        </div>
    ) : null;
}

export default OLVectorFeaturesInfo;
