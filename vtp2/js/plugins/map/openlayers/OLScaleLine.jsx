/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ScaleLine from 'ol/control/ScaleLine';

/**
 * @render react
 * @name OLScaleLine
 * @description custom scale line controls enable to configure the dom parent target based on layout type
 * @prop {number} cfg.toolsOptions.scaleLine.containerSelectors object with key related to layout type and query selector as value
 */
function OLScaleLine({
    map,
    layoutType = 'lg',
    containerSelectors = {
        sm: '#ms-layout-body',
        md: '#ms-layout-body',
        lg: '#ms-layout-body'
    }
}) {

    const scaleLine = useRef(null);
    const target = useRef(null);
    const selector = containerSelectors && containerSelectors[layoutType];
    const container = selector && document.querySelector(selector);

    const targetNode = target && target.current;
    const isTargetMounted = !!targetNode;

    useEffect(() => {
        if (map) {
            scaleLine.current = new ScaleLine();
        }
        return () => {
            if (map && scaleLine && scaleLine.current) {
                map.removeControl(scaleLine.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isTargetMounted && layoutType && scaleLine && scaleLine.current && map) {
            map.removeControl(scaleLine.current);
            scaleLine.current.setTarget(target.current);
            map.addControl(scaleLine.current);
        }
    }, [ isTargetMounted, layoutType ]);

    return container ? (
        createPortal(
            <div
                className="ms-scale-line-container"
                ref={target} />,
            container)
    ) : null;
}

export default OLScaleLine;
