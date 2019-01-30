
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const { connect } = require('react-redux');
const { compose, withState } = require('recompose');
const { createSelector } = require('reselect');
const { getUpdatedLayer } = require('../../MapStore2/web/client/selectors/styleeditor');
const { get, head, trim, startsWith } = require('lodash');
const { selectStyleWFS, updateFeatureWFS, updateCodeWFS, saveWFSStyle, changeBgWFS } = require('../actions/wfsworkflow');
const wfsWorkflow = require('../epics/wfsworkflow');
const { SketchPicker } = require('react-color');
const tinycolor = require('tinycolor2');
const BorderLayout = require('../../MapStore2/web/client/components/layout/BorderLayout');
const { Nav, NavItem: NavItemRB, Glyphicon, Form, FormControl, FormGroup } = require('react-bootstrap');
const tooltip = require('../../MapStore2/web/client/components/misc/enhancers/tooltip');
const emptyState = require('../../MapStore2/web/client/components/misc/enhancers/emptyState');
const NavItem = tooltip(NavItemRB);
const prettifyXml = require('prettify-xml');
const modes = {
    mbstyle: 'javascript',
    mbs: 'javascript',
    sld: 'xml'
};
const inlineWidgets = [
    {
        type: 'color',
        active: token => token.string && startsWith(trim(token.string, '"'), '#') && tinycolor(trim(token.string, '"')).isValid(),
        style: token => ({backgroundColor: trim(token.string, '"')}),
        Widget: ({token, value, onChange = () => {}}) => (
            <SketchPicker
                color={{ hex: trim(value || token.string, '"') }}
                onChange={color => onChange( token.type === 'string' ? `"${color.hex}"` : `${color.hex}`)}/>
        )
    }
];
const loadingState = require('../../MapStore2/web/client/components/misc/enhancers/loadingState');
const ResizableModal = require('../../MapStore2/web/client/components/misc/ResizableModal');
const Toolbar = require('../../MapStore2/web/client/components/misc/toolbar/Toolbar');
const Editor = loadingState(({ code }) => !code)(require('../../MapStore2/web/client/components/styleeditor/Editor'));
const SideGrid = require('../../MapStore2/web/client/components/misc/cardgrids/SideGrid');

const StyleList = compose(
    connect(
        createSelector(
            [
                state => get(state, 'wfsworkflow.styles'),
                state => get(state, 'wfsworkflow.selectedId')
            ], (availableStyles, enabledStyle) => ({
                availableStyles,
                enabledStyle
            })
        ),
        {
            onSelect: selectStyleWFS
        }
    ),
    loadingState(({ availableStyles }) => !availableStyles)
)(require('../../MapStore2/web/client/components/styleeditor/StyleList'));

const List = () => (
    <div style={{
        width: 250,
        height: '100%',
        position: 'relative'
    }}>
        <BorderLayout>
            <StyleList hideFilter/>
        </BorderLayout>
    </div>
);

const getSelectedStyle = (state) => {
    const styles = get(state, 'wfsworkflow.styles') || [];
    const id = get(state, 'wfsworkflow.selectedId') || '';
    const selected = head(styles.filter(({ name }) => id === name)) || {};
    return selected;
};

const getCode = {
    mbstyle: (styleBody) => JSON.stringify(styleBody, null, 4),
    mbs: (styleBody) => JSON.stringify(styleBody, null, 4),
    sld: (styleBody) => prettifyXml(styleBody)
};

const SplittedEditor = compose(
    connect(
        createSelector(
            [
                getSelectedStyle
            ], ({ splitted, format, name }) => ({
                splitted: splitted.filter(() => getCode[format]),
                format,
                name
            })
        ),
        {
            onEditCode: updateCodeWFS,
            onRemove: updateFeatureWFS.bind(null, true)
        }
    ),
    withState('selected', 'onSelect'),
    emptyState(({ splitted }) => splitted.length === 0, {
        glyph: 'exclamation-mark',
        title: 'Edit Not Available',
        description: 'Named layers in current style deos not match available layers'
    }),
)(
    ({ selected, onSelect, splitted = [], format, name, onEditCode = () => {}, onRemove = () => {} }) => {

        const { style, ...data } = head(splitted.filter(part => part.name === selected)) || splitted[0] || {};

        return (<BorderLayout
            key={name}
            header={
                splitted.length > 1 && <Nav
                    bsStyle="pills"
                    activeKey={data.name}
                    style={{ borderBottom: '1px solid #ddd', padding: 9}}
                    onSelect={(key) => onSelect(key)}>
                    {splitted.map(part => (
                         <NavItem
                            style={{ width: 120, margin: 'auto', textOverflow: 'ellipsis' }}
                            bsSize="sm"
                            tooltip={part.name}
                            eventKey={part.name}>
                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{part.name}</div>
                         </NavItem>
                    ))}
                </Nav>
            }>
            <BorderLayout
                header={<div style={{ padding: 9, borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
                <h4 style={{ flex: 1, margin: 0 }}><Glyphicon glyph="1-stilo"/>{' ' + data.name}</h4>
                    <Toolbar
                        btnDefaultProps={{
                            bsStyle: 'primary',
                            className: 'square-button-md'
                        }}
                        buttons={
                            [
                                {
                                    glyph: 'trash',
                                    tooltip: 'Remove layer',
                                    visible: splitted.length > 1,
                                    onClick: () => onRemove(data.name)
                                }
                            ]
                        }/>
                </div>}>
                <Editor
                    theme="neo"
                    key={data.name}
                    inlineWidgets={inlineWidgets}
                    mode={modes[format]}
                    waitTime={0}
                    code={getCode[format](style.code)}
                    onChange={(code) => {
                        if (format === 'mbstyle') {
                            try {
                                let json = JSON.parse(code);
                                onEditCode({ style, ...data}, json);
                            } catch(e) {
                                //
                            }
                        } else {
                            onEditCode({ style, ...data}, code);
                        }
                    }}
                />
            </BorderLayout>
        </BorderLayout>);

    }
);

const SplitView = compose(
    connect(
        createSelector(
            [
                state => get(state, 'wfsworkflow.sources.collections'),
                getSelectedStyle
            ], (collections, selected) => ({
                collections: collections && collections
                    .filter(({ name }) =>
                    selected && selected.splitted && !(head(selected.splitted.filter(part => part.name === name)))
                    ),
                    selected
            })
        ),
        {
            onSelect: updateFeatureWFS.bind(null, false),
            onSave: saveWFSStyle,
            onChangeBg: changeBgWFS
        }
    ),
    withState('showCode', 'onShowCode', true),
    withState('showLayer', 'onShowLayer'),
    withState('auth', 'onChangeAuth')
)(({
    collections = [],
    selected,
    onSelect = () => { },
    showCode,
    onShowCode = () => {},
    showLayer,
    onShowLayer,
    onSave = () => {},
    onChangeAuth = () => {},
    onChangeBg = () => {},
    auth
}) => {

    return selected.name ? (
        <div
            style={{
                width: 500,
                height: 'auto',
                position: 'relative',
                overflow: 'auto',
                borderLeft: '1px solid #ddd'
            }}>
            <BorderLayout
                header={
                    <div style={{ padding: 10, zIndex: 1000, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    <Toolbar
                        btnDefaultProps={{
                            bsStyle: 'primary',
                            className: 'square-button-md'
                        }}
                        buttons={
                            [
                                {
                                    glyph: showCode ? 'pencil' : 'code',
                                    tooltip: showCode ? 'Edit current style' : 'Show full style',
                                    onClick: () => onShowCode(!showCode)
                                },
                                {
                                    glyph: 'floppy-disk',
                                    tooltip: 'Save current style',
                                    disabled: selected.translated,
                                    visible: !!(showCode && selected.name.toLowerCase().indexOf('override') !== -1),
                                    onClick: () => onSave({ ...selected, auth })
                                },
                                {
                                    glyph: 'plus',
                                    tooltip: 'Add an available layer from WFS3 collection',
                                    visible: !!(!showCode && selected && selected.splitted && selected.splitted.length < 12),
                                    onClick: () => onShowLayer(true)
                                },
                                {
                                    glyph: 'adjust',
                                    tooltip: 'Change background color',
                                    onClick: () => onChangeBg()
                                }
                            ]
                        }/>
                        { !!(showCode && selected.name.toLowerCase().indexOf('override') !== -1) && <Form>
                            <FormGroup style={{ margin: '8px 0' }} controlId="auth">
                                <FormControl
                                    type="password"
                                    placeholder="auth"
                                    onChange={(event) => {
                                        onChangeAuth(event.target.value);
                                    }}/>
                            </FormGroup>
                        </Form>}
                        <ResizableModal
                            title="Available layers"
                            onClose={() => onShowLayer(false)}
                            show={showLayer}>
                            <div style={{paddingBottom: 30}}>
                            <SideGrid
                                size="sm"
                                items={collections
                                    .map(({ name }) => ({
                                        title: name,
                                        preview: <Glyphicon glyph="1-layer"/>,
                                        onClick: () => {
                                            onSelect(name);
                                            onShowLayer(false);
                                        }
                                    }))}/>
                            </div>
                        </ResizableModal>
                    </div>
                }>
                {showCode ?
                    <Editor
                        key={selected.name}
                        theme="neo"
                        mode={modes[selected.format]}
                        readOnly
                        code={getCode[selected.format](selected.code, true)}/> :
                    <SplittedEditor />}
            </BorderLayout>
        </div>
    ) : null;
});

class WFSPanel extends React.Component {
    static propTypes = {
        selectedLayer: PropTypes.array,
        title: PropTypes.string
    };
    render() {
        return (
            <BorderLayout
                className="ms-style-editor-container"
                header={<div style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #ddd'}}><h4 style={{margin: 0}}>
                WFS3 VTP Extension Demo
                </h4>
                <div>{this.props.title}</div>
                </div>}
                footer={<div style={{ height: 0 }} />}>
                <div style={{ flex: 1, display: 'flex', height: '100%' }}>
                    <List />
                    <SplitView />
                </div>
            </BorderLayout>
        );
    }
}

const selector = createSelector(
    [
        getUpdatedLayer,
        state => get(state, 'wfsworkflow.service')
    ], (selectedLayer, { title } = {}) => ({
        selectedLayer,
        title
    })
);

const WFSPanelPlugin = connect(selector
)(WFSPanel);

module.exports = {
    WFSPanelPlugin: assign(WFSPanelPlugin, {
        LeftMenu: {
            priority: 1,
            glyph: '1-stilo',
            position: 0,
            size: '100%',
            tooltip: 'Styles'
        }
    }),
    reducers: {
        styleeditor: require('../../MapStore2/web/client/reducers/styleeditor'),
        wfsworkflow: require('../reducers/wfsworkflow')
    },
    epics: wfsWorkflow
};
