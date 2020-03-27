/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/actions/controls';
import { updateNode } from '@mapstore/actions/layers';
import { updateAdditionalLayer, removeAdditionalLayer } from '@mapstore/actions/additionallayers';
import { getSelectedLayer } from '@mapstore/selectors/layers';
import { Button as ButtonRB, Glyphicon, FormControl, FormGroup, ControlLabel } from 'react-bootstrap';
import tooltip from '@mapstore/components/misc/enhancers/tooltip';
import GroupField from '@mapstore/components/data/query/GroupField';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import Loader from '@mapstore/components/misc/Loader';
import withLayoutPanel from '@mapstore/plugins/layout/withLayoutPanel';
import Select from 'react-select';


import { getQueryables } from '@js/api/OGC';

const Button = tooltip(ButtonRB);

const updateFilterField = (field = {}, action = {}) => {
    const newField = {
        ...field,
        [action.fieldName]: action.fieldValue,
        type: action.fieldType,
        fieldOptions: {
            ...field.fieldOptions,
            currentPage: action.fieldOptions.currentPage === undefined ? 1 : action.fieldOptions.currentPage
        }
    };
    if (action.fieldName === 'attribute') {
        return {
            ...newField,
            value: action.fieldType === 'string' ? '' : null,
            operator: ''
        };
    }
    if (action.fieldName === 'operator') {
        return {
            ...newField,
            value: null
        };
    }
    return newField;
};

const FilterBuilder = ({
    filterObj = {
        groupFields: [{ id: 1, logic: 'OR', index: 0 }]
    },
    attributes = [],
    groupLevels = 2,
    onChange = () => {}
}) => {
    const { groupFields, filterFields } = filterObj;
    return (
        <GroupField
            attributes={attributes}
            filterFields={filterFields}
            groupFields={groupFields}
            autocompleteEnabled={false}
            groupLevels={groupLevels}
            withContainer={false}
            noBootstrap
            actions={{
                onAddGroupField: (groupId, index) => {
                    const newGroupField = {
                        id: new Date().getTime(),
                        logic: 'OR',
                        groupId: groupId,
                        index: index + 1
                    };
                    onChange({
                        filterFields,
                        groupFields: groupFields
                            ? [...groupFields, newGroupField]
                            : [newGroupField]
                    });
                },
                onAddFilterField: (groupId) => {
                    const newFilterField = {
                        rowId: new Date().getTime(),
                        groupId: groupId,
                        attribute: null,
                        operator: "",
                        value: null,
                        type: null,
                        fieldOptions: {
                            valuesCount: 0,
                            currentPage: 1
                        },
                        exception: null
                    };
                    onChange({
                        filterFields: filterFields
                            ? [...filterFields, newFilterField]
                            : [newFilterField],
                        groupFields
                    });
                },
                onRemoveFilterField: (rowId) => {
                    onChange({
                        filterFields: filterFields.filter((field) => field.rowId !== rowId),
                        groupFields
                    });
                },
                onUpdateFilterField: (rowId, fieldName, fieldValue, fieldType, fieldOptions = {}) => {
                    onChange({
                        filterFields: filterFields.map((field) => {
                            if (field.rowId === rowId) {
                                return updateFilterField(field, {rowId, fieldName, fieldValue, fieldType, fieldOptions});
                            }
                            return field;
                        }),
                        groupFields
                    });
                },
                onUpdateExceptionField: (rowId, exceptionMessage) => {
                    onChange({
                        filterFields: filterFields.map((field) => {
                            if (field.rowId === rowId) {
                                return { ...field, exception: exceptionMessage };
                            }
                            return field;
                        }),
                        groupFields
                    });
                },
                onUpdateLogicCombo: (groupId, logic) => {
                    onChange({
                        filterFields,
                        groupFields: groupFields.map((field) => {
                            if (field.id === groupId) {
                                return { ...field, logic };
                            }
                            return field;
                        })
                    });
                },
                onRemoveGroupField: (groupId) => {
                    onChange({
                        filterFields: filterFields.filter((field) => field.groupId !== groupId),
                        groupFields: groupFields.filter((group) => group.id !== groupId)
                    });
                },
                onChangeCascadingValue: () => {/**/}
            }}/>
    );
};

const SpatialFilter = connect((state) => ({
    enabledFilter: state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.enabled,
    method: state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.drawType,
    feature: state && state.controls && state.controls.spatialFilter && state.controls.spatialFilter.feature
}), {
    onChangeMethod: setControlProperty.bind(null, 'spatialFilter', 'drawType'),
    onEnableFilter: setControlProperty.bind(null, 'spatialFilter', 'enabled'),
    onResetFeature: setControlProperty.bind(null, 'spatialFilter', 'feature', null),
    onShowLayer: updateAdditionalLayer,
    onHideLayer: removeAdditionalLayer
})(({
    feature,
    method,
    enabledFilter,
    spatialField,
    attributes,
    onChange = () => {},
    onChangeMethod = () => {},
    onEnableFilter = () => {},
    onShowLayer = () => {},
    onHideLayer = () => {},
    onResetFeature = () => {}
}) => {
    const HIGHLIGHT_ID = 'HIGHLIGHT';
    const {
        geometry,
        operation,
        attribute
    } = spatialField || {};

    const featureStr = feature && JSON.stringify(feature);
    useEffect(() => {
        if (enabledFilter) {
            onChange({
                ...spatialField,
                geometry: feature && feature.geometry
            });
        }
    }, [ enabledFilter, featureStr ]);

    const geometryStr = geometry && JSON.stringify(geometry);
    const [highlight, setHighlight] = useState();
    useEffect(() => {
        if (highlight && geometryStr) {
            const color =  '#aaff33';
            onShowLayer(HIGHLIGHT_ID, 'SpatialFilter', 'overlay', {
                id: HIGHLIGHT_ID,
                type: 'vector',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry,
                        style: geometry.type === 'Point'
                            ? {
                                fillColor: color,
                                fillOpacity: 0.2,
                                color: '#333333',
                                opacity: 0.75,
                                weight: 3,
                                radius: 6
                            }
                            : {
                                fillColor: color,
                                fillOpacity: 0.2,
                                color: '#333333',
                                opacity: 0.75,
                                weight: 3
                            }
                    }
                ]
            });
        } else {
            onHideLayer({ id: HIGHLIGHT_ID });
        }
    }, [ highlight, geometryStr ]);

    useEffect(() => {
        return () => {
            onHideLayer({ id: HIGHLIGHT_ID });
            onChangeMethod();
            onEnableFilter(false);
            onResetFeature();
        };
    }, []);

    return (
        <div
            style={{ padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                    Spatial Filter
                </div>
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border'
                    }}
                    buttons={[
                        {
                            disabled: !geometry,
                            glyph: highlight ? 'eye-open' : 'eye-close',
                            onClick: () => setHighlight(!highlight)
                        },
                        {
                            disabled: !method,
                            glyph: 'pencil',
                            tooltip: 'Draw geometry on map',
                            bsStyle: enabledFilter ? 'success' : 'default',
                            onClick: !method
                                ? () => {}
                                : () => onEnableFilter(!enabledFilter)
                        },
                        {
                            disabled: !geometry,
                            glyph: 'trash',
                            tooltip: 'Remove spatial filter',
                            onClick: () => {
                                onChange();
                                onChangeMethod();
                                onEnableFilter(false);
                            }
                        }
                    ]}/>
            </div>
            <Select
                style={{
                    marginBottom: 4
                }}
                value={attribute}
                placeholder="Select geometry attribute"
                options={attributes.map(({ id }) => ({
                    value: id,
                    label: id
                }))}
                onChange={(option) => {
                    onChange({
                        ...spatialField,
                        attribute: option && option.value
                    });
                }}/>
            <Select
                style={{
                    marginBottom: 4
                }}
                value={method}
                placeholder="Select geometric method"
                options={[
                    {
                        value: 'Rectangle',
                        label: 'Rectangle'
                    },
                    {
                        value: 'Polygon',
                        label: 'Polygon'
                    },
                    {
                        value: 'Point',
                        label: 'Point'
                    }
                ]}
                onChange={(option) => {
                    onChangeMethod(option && option.value);
                }}/>
            <Select
                style={{
                    marginBottom: 4
                }}
                value={operation}
                placeholder="Select geometric operation"
                options={[
                    {
                        value: 'BBOX',
                        label: 'Bounding Box'
                    },
                    {
                        value: 'DISJOINT',
                        label: 'Disjoint'
                    },
                    {
                        value: 'CONTAINS',
                        label: 'Contains'
                    },
                    {
                        value: 'WITHIN',
                        label: 'Within'
                    }
                ]}
                onChange={(option) => {
                    onChange({
                        ...spatialField,
                        operation: option && option.value
                    });
                }}/>
        </div>
    );
});


const mapQueryablesToTypes = ({ id, type }) => {
    const types = {
        integer: 'number',
        number: 'number',
        string: 'string',
        dateTime: 'date-time',
        date: 'date',
        time: 'time',
        varchar: 'string',
        float4: 'number',
        int8: 'number'
    };
    return {
        attribute: id,
        label: id,
        type: types[type]
    };
};

const LayerFilter = withLayoutPanel(({
    enabled,
    selectedLayer,
    onClose = () => {},
    onChange = () => {}
}) => {
    const {
        id: layerId,
        name,
        type: layerType,
        url,
        layerFilter = {
            groupFields: [{ id: 1, logic: 'OR', index: 0 }]
        }
    } = selectedLayer || {};
    const [queryables, setQueryables] = useState();
    const [loadingQueryables, setLoadingQueryables] = useState(false);
    const { spatialField, groupFields, filterFields } = layerFilter;
    const [filter, setFilter] = useState({ groupFields, filterFields });
    const [spatial, setSpatial] = useState({ spatialField });

    useEffect(() => {
        if (!layerId) {
            onClose();
        } else {
            setFilter(layerFilter);
        }
        if ((layerType === 'ogc-tile' || layerType === 'ogc-features') && url && enabled) {
            setLoadingQueryables(true);
            getQueryables(url)
                .then((response) => {
                    setQueryables(response);
                    setLoadingQueryables(false);
                })
                .catch(() => setLoadingQueryables(false));
        }
    }, [layerType, layerId, enabled]);
    if (!enabled) {
        return null;
    }
    if (loadingQueryables) {
        return (
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                <Loader size={100}/>
            </div>
        );
    }
    if (!queryables) {
        return (
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    textAlign: 'center'
                }}>
                <div>
                    <div style={{ fontStyle: 'italic' }}>This type of layer does not support queryables</div>
                    <hr />
                    <div style={{ fontStyle: 'italic' }}>You can use input area to enter a filter</div>
                    <FormGroup
                        controlId="filter"
                        key="filter">
                        <ControlLabel>CQL filter</ControlLabel>
                        <FormControl
                            defaultValue={selectedLayer && selectedLayer.params && selectedLayer.params.filter || ''}
                            type="text"
                            placeholder="Enter filter..."
                            onChange={(event) => {
                                if (!event.target.value) {
                                    const params = omit({ ...selectedLayer.params }, ['filter', 'filter-lang']);
                                    return onChange(selectedLayer.id, 'layers',
                                        { params: {...params}, '_v_': Date.now() }
                                    );
                                }
                                return onChange(selectedLayer.id, 'layers', {
                                    params: {
                                        ...selectedLayer.params,
                                        'filter': event.target.value,
                                        'filter-lang': 'cql-text'
                                    },
                                    '_v_': Date.now()
                                });
                            }} />
                    </FormGroup>
                </div>
            </div>
        );
    }
    const geomAttributes = queryables && queryables.filter(({ type }) => type === 'geometry' || type === 'bytea');
    return (
        <BorderLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                    <div style={{ flex: 1 }}>
                        {name}
                    </div>
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md no-border'
                        }}
                        buttons={[
                            {
                                glyph: 'filter',
                                tooltip: 'Apply filter',
                                onClick: () => {
                                    onChange(selectedLayer.id, 'layers', {
                                        layerFilter: { ...filter, ...spatial }, _v_: Date.now()
                                    });
                                }
                            }
                        ]}/>
                </div>
            }>
            <div style={{ position: 'absolute', width: '100%' }}>
                <div style={{ margin: '8px 8px 0 8px' }}>
                    Attributes Filter
                </div>
                <FilterBuilder
                    filterObj={filter}
                    attributes={queryables
                        .map(mapQueryablesToTypes)
                        .filter(({ type }) => type)}
                    onChange={(newFilterObj) => {
                        setFilter(newFilterObj);
                    }}
                />
                {geomAttributes.length > 0 &&
                    <SpatialFilter
                        layerId={layerId}
                        attributes={geomAttributes}
                        spatialField={spatial && spatial.spatialField}
                        onChange={(newSpatialField) => {
                            setSpatial({
                                spatialField: newSpatialField
                            });
                        }}
                    />}
            </div>
        </BorderLayout>
    );
}, { defaultWidth: 300 });

const LayerFilterPlugin = (props) => {
    return props.enabled
        ? <LayerFilter
            key={props.selectedLayer && props.selectedLayer.id}
            { ...props }/>
        : null;
};

const PLUGIN_NAME = 'LayerFilter';

const TOCButton = connect(createSelector([
    state => get(state, 'controls.toc.activePanel')
], (activePanel) => ({
    enabled: activePanel === PLUGIN_NAME
})), {
    onClick: setControlProperty.bind(null, 'toc', 'activePanel', PLUGIN_NAME)
})(({ status, enabled, onClick, ...props }) => {
    return !enabled && status === 'LAYER'
        ? <Button
            {...props}
            tooltip="Filter layer features"
            onClick={() => onClick()}>
            <Glyphicon glyph="filter-layer"/>
        </Button>
        : null;
});

export default createPlugin(PLUGIN_NAME, {
    component: connect(
        createSelector([
            state => get(state, 'controls.toc.activePanel'),
            getSelectedLayer
        ], (activePanel, selectedLayer) => ({
            enabled: activePanel === PLUGIN_NAME,
            selectedLayer: selectedLayer || {}
        })),
        {
            onClose: setControlProperty.bind(null, 'toc', 'activePanel', ''),
            onChange: updateNode
        }
    )(LayerFilterPlugin),
    containers: {
        Layers: {
            priority: 1,
            tool: TOCButton,
            panel: true
        }
    }
});
