/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from 'react';
import { createPlugin, getConfiguredPlugin } from '@mapstore/utils/PluginsUtils';
import { TOCPlugin, reducers, epics } from '@mapstore/plugins/TOC';
import withLayoutPanel from '@mapstore/plugins/layout/withLayoutPanel';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import GroupNode from '@js/components/GroupNode';
import LayerNode from '@js/components/LayerNode';
import PropTypes from 'prop-types';

const TOCPluginPanel = withLayoutPanel(TOCPlugin, { defaultWidth: 300 });

function TOCContainer({
    items = [],
    layoutPanelProps = {},
    ...props
}, context) {

    const [panels, setPanels] = useState([]);
    const [buttons, setButtons] = useState([]);
    const [nodeButtons, setNodeButtons] = useState([]);

    useEffect(() => {
        setButtons(items.map(({ tool }) => tool).filter(val => val));
        setNodeButtons(items.map(({ nodeButton }) => nodeButton).filter(val => val));
        setPanels(items
            .map(({ panel, ...impl }) => {
                if (!panel) {
                    return null;
                }
                if (panel && panel.Component) {
                    return panel.Component;
                }
                return getConfiguredPlugin({ ...impl }, context.loadedPlugins, <div />);
            })
            .filter(val => val));
    }, []);

    const { containerWidth, onResize, ..._layoutPanelProps } = layoutPanelProps;
    const renderedPanels = panels.map( (Panel, idx) => <Panel key={idx} layoutPanelProps={_layoutPanelProps}/>);
    return (
        <BorderLayout
            columns={renderedPanels}
            className="ms-toc">
            <TOCPluginPanel
                { ...props }
                buttons={buttons}
                nodeButtons={nodeButtons}
                layoutPanelProps={layoutPanelProps}
                layerNodeComponent={LayerNode}
                groupNodeComponent={GroupNode}/>
        </BorderLayout>
    );
}

TOCContainer.contextTypes = {
    loadedPlugins: PropTypes.object
};

export default createPlugin('Layers', {
    component: TOCContainer,
    containers: {
        Layout: {
            priority: 1,
            glyph: '1-layer',
            position: 4,
            size: 'auto',
            tooltip: 'Layers',
            container: 'left-menu'
        }
    },
    reducers,
    epics
});
