/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {head} = require('lodash');
const ConfirmModal = require('@mapstore/components/maps/modals/ConfirmModal');
const LayerMetadataModal = require('@mapstore/components/TOC/fragments/LayerMetadataModal');
const Proj4js = require('proj4').default;
const Message = require('@mapstore/components/I18N/Message');
const Toolbar = require('@mapstore/components/misc/toolbar/Toolbar');

class TOCToolbar extends React.Component {

    static propTypes = {
        groups: PropTypes.array,
        buttons: PropTypes.array,
        selectedLayers: PropTypes.array,
        generalInfoFormat: PropTypes.string,
        selectedGroups: PropTypes.array,
        onToolsActions: PropTypes.object,
        text: PropTypes.object,
        activateTool: PropTypes.object,
        options: PropTypes.object,
        style: PropTypes.object,
        settings: PropTypes.object,
        layerMetadata: PropTypes.object,
        wfsdownload: PropTypes.object,
        maxDepth: PropTypes.number,
        metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func])
    };

    static defaultProps = {
        groups: [],
        buttons: [],
        selectedLayers: [],
        selectedGroups: [],
        onToolsActions: {
            onZoom: () => {},
            onNewWidget: () => {},
            onBrowseData: () => {},
            onQueryBuilder: () => {},
            onUpdate: () => {},
            onRemove: () => {},
            onClear: () => {},
            onSettings: () => {},
            onUpdateSettings: () => {},
            onRetrieveLayerData: () => {},
            onHideSettings: () => {},
            onReload: () => {},
            onAddLayer: () => {},
            onAddGroup: () => { },
            onDownload: () => {},
            onGetMetadataRecord: () => {},
            onHideLayerMetadata: () => {},
            onShow: () => {}
        },
        maxDepth: 3,
        text: {
            settingsText: '',
            opacityText: '',
            elevationText: '',
            saveText: '',
            closeText: '',
            confirmDeleteText: '',
            confirmDeleteMessage: '',
            confirmDeleteCancelText: '',
            createWidgetTooltip: '',
            addLayerTooltip: '',
            addLayerToGroupTooltip: '',
            addGroupTooltip: '',
            addSubGroupTooltip: '',
            zoomToTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            settingsTooltip: {
                LAYER: '',
                GROUP: ''
            },
            featuresGridTooltip: '',
            downloadToolTooltip: '',
            trashTooltip: {
                LAYER: '',
                LAYERS: '',
                GROUP: ''
            },
            reloadTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            layerMetadataTooltip: '',
            layerMetadataPanelTitle: '',
            layerFilter: ''

        },
        activateTool: {
            activateToolsContainer: true,
            activateRemoveLayer: true,
            activateZoomTool: true,
            activateQueryTool: true,
            activateDownloadTool: true,
            activateSettingsTool: true,
            activateAddLayer: true,
            activateAddGroup: true,
            includeDeleteButtonInSettings: false,
            activateMetedataTool: true,
            activateLayerFilterTool: true
        },
        options: {
            modalOptions: {},
            settingsOptions: {}
        },
        style: {
            chartStyle: {}
        },
        settings: {},
        layerMetadata: {},
        wfsdownload: {},
        metadataTemplate: null
    };

    state = {
        showDeleteDialog: false
    };

    isNestedGroup = () => {
        const splitIdGroups = this.props.selectedGroups.map(g => g.id.split('.'));
        return head(splitIdGroups.reduce((a, b) => a[0] === b[0] ? b : [false], splitIdGroups[0]));
    }

    isLoading = () => {
        return head(this.props.selectedLayers.filter(l => l.loading));
    }
    /**
     * retrieve current status based on selected layers and groups
     * 'DESELECT' no selection
     * 'LAYER' single layer selection
     * 'LAYERS' multiple layer selection
     * 'GROUP' single group selection, it select also children layers
     * 'GROUPS' multiple group selection, it select also children layers
     * 'LAYER_LOAD_ERROR' single layer selection with error
     * 'LAYERS_LOAD_ERROR' multiple layer selection with error, all selected layer have an error
     */
    getStatus = () => {
        const {selectedLayers, selectedGroups} = this.props;
        const isSingleGroup = this.isNestedGroup();
        let status = selectedLayers.length === 0 & selectedGroups.length === 0 ? 'DESELECT' : '';
        status = selectedLayers.length === 1 & selectedGroups.length === 0 ? 'LAYER' : status;
        status = isSingleGroup ? 'GROUP' : status;
        status = selectedLayers.length > 1 & selectedGroups.length === 0 ? 'LAYERS' : status;
        status = selectedGroups.length > 1 && !isSingleGroup ? 'GROUPS' : status;
        status = this.props.selectedLayers.length > 0 && this.props.selectedLayers.filter(l => l.loadingError === 'Error').length === this.props.selectedLayers.length ? `${status}_LOAD_ERROR` : status;
        return status;
    }
    getSelectedGroup = () => {
        return this.props.selectedGroups.length > 0 && this.props.selectedGroups[this.props.selectedGroups.length - 1];
    };
    getSelectedNodeDepth = () => {
        if (this.getStatus() === 'DESELECT') {
            return 0;
        }
        return this.getSelectedGroup().id.split('.').length + 1;
    };
    addLayer = () => {
        const group = this.getSelectedGroup();
        this.props.onToolsActions.onAddLayer(group && group.id);
    };
    addGroup = () => {
        const group = this.getSelectedGroup();
        this.props.onToolsActions.onAddGroup(group && group.id);
    };
    render() {
        const status = this.getStatus();
        const currentEPSG = this.checkBbox();
        const epsgIsSupported = currentEPSG && Proj4js.defs(currentEPSG);

        const layerMetadataModal = (<LayerMetadataModal
            key="toollayermetadatamodal"
            layerMetadata={this.props.layerMetadata}
            metadataTemplate={this.props.metadataTemplate}
            hideLayerMetadata={this.props.onToolsActions.onHideLayerMetadata}
            layerMetadataPanelTitle={this.props.text.layerMetadataPanelTitle} />);
        return this.props.activateTool.activateToolsContainer ? (
            <>
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md',
                        bsStyle: 'primary',
                        tooltipPosition: 'top'
                    }}
                    buttons={[
                        // MOVE TO CATALOG
                        {
                            visible: this.props.activateTool.activateAddLayer && (status === 'DESELECT' || status === 'GROUP')
                                ? true : false,
                            tooltip: status === 'GROUP' ? this.props.text.addLayerToGroupTooltip : this.props.text.addLayerTooltip,
                            glyph: 'add-layer',
                            onClick: this.addLayer
                        },
                        /* {
                            visible: this.props.activateTool.activateAddGroup && (status === 'DESELECT' || status === 'GROUP') && this.getSelectedNodeDepth() <= this.props.maxDepth
                                ? true : false,
                            tooltip: status === 'GROUP' ? this.props.text.addSubGroupTooltip : this.props.text.addGroupTooltip,
                            glyph: 'add-folder',
                            onClick: this.addGroup
                        },*/
                        {
                            visible: this.props.activateTool.activateZoomTool && (status === 'LAYER' || status === 'GROUP' || status === 'LAYERS' || status === 'GROUPS') && currentEPSG
                                ? true : false,
                            tooltip: epsgIsSupported
                                ? this.props.text.zoomToTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER']
                                : <Message msgId="toc.epsgNotSupported" msgParams={{epsg: currentEPSG || ' '}}/>,
                            glyph: 'zoom-to',
                            style: epsgIsSupported ? { opacity: 1.0, cursor: 'pointer' } : { opacity: 0.5, cursor: 'default' },
                            onClick: epsgIsSupported ? this.zoomTo : () => {}
                        },
                        // MOVE TO TOC ITEM SETTINGS
                        /* {
                            visible: this.props.activateTool.activateSettingsTool && (status === 'LAYER' || status === 'GROUP' || status === 'LAYER_LOAD_ERROR') && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.settingsTooltip[status === 'LAYER_LOAD_ERROR' ? 'LAYER' : status],
                            active: this.props.settings.expanded,
                            bsStyle: this.props.settings.expanded ? 'success' : 'primary',
                            glyph: 'wrench',
                            onClick: () => this.showSettings(status)
                        },*/
                        /* {
                            visible: this.props.activateTool.activateLayerFilterTool && (status === 'LAYER' || status === 'LAYER_LOAD_ERROR') && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.layerFilterTooltip,
                            glyph: 'filter-layer',
                            onClick: this.props.onToolsActions.onQueryBuilder
                        },*/
                        // MOVE TO FEATURE EDITOR PLUGIN
                        /* {
                            visible: this.props.activateTool.activateQueryTool && status === 'LAYER' && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.featuresGridTooltip,
                            glyph: 'features-grid',
                            onClick: this.browseData
                        },*/
                        {
                            visible: this.props.activateTool.activateRemoveLayer && (status === 'LAYER' || status === 'GROUP' || status === 'LAYERS' || status === 'GROUPS' || status === 'LAYER_LOAD_ERROR' || status === 'LAYERS_LOAD_ERROR') && this.props.selectedLayers.length > 0 && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.trashTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER'],
                            active: this.state.showDeleteDialog,
                            bsStyle: this.props.settings.showDeleteDialog ? 'success' : 'primary',
                            glyph: 'trash',
                            onClick: this.displayDeleteDialog
                        },
                        {
                            visible: !this.isLoading() && status === 'LAYER_LOAD_ERROR' || status === 'LAYERS_LOAD_ERROR'
                                ? true : false,
                            tooltip: this.props.text.reloadTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER'],
                            glyph: 'refresh',
                            onClick: this.reload
                        },
                        // MOVE TO WIDGET BUILDER PLUGIN
                        /* {
                            visible: this.props.activateTool.activateWidgetTool && (status === 'LAYER') && this.props.selectedLayers.length === 1 && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.createWidgetTooltip,
                            glyph: 'stats',
                            onClick: this.props.onToolsActions.onNewWidget
                        },*/
                        {
                            visible: this.props.activateTool.activateDownloadTool && status === 'LAYER' && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded
                                ? true : false,
                            tooltip: this.props.text.downloadToolTooltip,
                            bsStyle: this.props.wfsdownload.expanded ? "success" : "primary",
                            glyph: 'download',
                            onClick: this.download
                        },
                        {
                            visible: this.props.activateTool.activateMetedataTool && (status === 'LAYER') && this.props.selectedLayers[0].catalogURL && !this.props.settings.expanded && !this.props.wfsdownload.expanded
                                ? true : false,
                            tooltip: this.props.text.layerMetadataTooltip,
                            bsStyle: this.props.layerMetadata.expanded ? 'success' : 'primary',
                            glyph: 'info-sign',
                            onClick: () => this.showMetadata()
                        },
                        ...this.props.buttons
                            .map((Element) => ({
                                status: this.getStatus(),
                                className: 'square-button-md',
                                bsStyle: 'primary',
                                selectedLayers: this.props.selectedLayers,
                                selectedGroups: this.props.selectedGroups,
                                Element,
                                activateTool: this.props.activateTool
                            })
                            )
                    ]}/>
                <ConfirmModal
                    ref="removelayer"
                    show= {this.state.showDeleteDialog}
                    onHide={this.closeDeleteDialog}
                    onClose={this.closeDeleteDialog}
                    onConfirm={this.removeNodes}
                    titleText={this.props.selectedGroups && this.props.selectedGroups.length ? this.props.text.confirmDeleteLayerGroupText : this.props.text.confirmDeleteText}
                    cancelText={this.props.text.confirmDeleteCancelText}
                    body={this.props.selectedGroups && this.props.selectedGroups.length ? this.props.text.confirmDeleteLayerGroupMessage : this.props.text.confirmDeleteMessage} />
                {layerMetadataModal}
            </>) : null;
    }

    browseData = () => {
        this.props.onToolsActions.onBrowseData({
            url: this.props.selectedLayers[0].search.url || this.props.selectedLayers[0].url,
            name: this.props.selectedLayers[0].name,
            id: this.props.selectedLayers[0].id
        });
    }

    download = () => {
        this.props.onToolsActions.onDownload({
            url: this.props.selectedLayers[0].search.url || this.props.selectedLayers[0].url,
            name: this.props.selectedLayers[0].name,
            id: this.props.selectedLayers[0].id
        });
    }

    checkBbox = () => {
        const layersBbox = this.props.selectedLayers.filter(l => l.bbox).map(l => l.bbox);
        const uniqueCRS = layersBbox.length > 0 ? layersBbox.reduce((a, b) => a.crs === b.crs ? a : {crs: 'differentCRS'}) : {crs: 'differentCRS'};
        return !!head(layersBbox) && uniqueCRS.crs !== 'differentCRS' && uniqueCRS.crs;
    }

    zoomTo = () => {
        const layersBbox = this.props.selectedLayers.filter(l => l.bbox).map(l => l.bbox);
        const bbox = layersBbox.length > 1 ? layersBbox.reduce((a, b) => {
            return {
                bounds: {
                    maxx: a.bounds.maxx > b.bounds.maxx ? a.bounds.maxx : b.bounds.maxx,
                    maxy: a.bounds.maxy > b.bounds.maxy ? a.bounds.maxy : b.bounds.maxy,
                    minx: a.bounds.minx < b.bounds.minx ? a.bounds.minx : b.bounds.minx,
                    miny: a.bounds.miny < b.bounds.miny ? a.bounds.miny : b.bounds.miny
                }, crs: b.crs};
        }, layersBbox[0]) : layersBbox[0];
        this.props.onToolsActions.onZoom(bbox.bounds, bbox.crs);
    }

    showSettings = (status) => {
        if (!this.props.settings.expanded) {
            if (status === 'LAYER' || status === 'LAYER_LOAD_ERROR') {
                this.props.onToolsActions.onSettings( this.props.selectedLayers[0].id, 'layers', {opacity: parseFloat(this.props.selectedLayers[0].opacity !== undefined ? this.props.selectedLayers[0].opacity : 1)});
            } else if (status === 'GROUP') {
                this.props.onToolsActions.onSettings(this.props.selectedGroups[this.props.selectedGroups.length - 1].id, 'groups', {});
            }
        } else {
            this.props.onToolsActions.onHideSettings();
        }
    }

    showMetadata = () => {
        if (!this.props.layerMetadata.expanded) {
            this.props.onToolsActions.onGetMetadataRecord();
        } else {
            this.props.onToolsActions.onHideLayerMetadata();
        }
    }

    removeNodes = () => {
        this.props.selectedLayers.forEach((layer) => {
            this.props.onToolsActions.onRemove(layer.id, 'layers');
        });
        this.props.selectedGroups.forEach((group) => {
            this.props.onToolsActions.onRemove(group.id, 'groups');
        });
        this.props.onToolsActions.onClear();
        this.closeDeleteDialog();
    }

    reload = () => {
        this.props.selectedLayers.forEach((layer) => {
            this.props.onToolsActions.onShow(layer.id, {visibility: true});
            this.props.onToolsActions.onReload(layer.id);
        });
    }

    closeDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false
        });
    };

    displayDeleteDialog = () => {
        this.setState({
            showDeleteDialog: true
        });
    };

}

module.exports = TOCToolbar;
