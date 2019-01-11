/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {compose, withState} = require('recompose');
const {head, trim, startsWith, get} = require('lodash');
const {TOCPlugin, reducers, epics} = require('../../MapStore2/web/client/plugins/TOC');
const {errorStyle, resetStyleEditor} = require('../../MapStore2/web/client/actions/styleeditor');
const {getUpdatedLayer, getAllStyles, errorStyleSelector} = require('../../MapStore2/web/client/selectors/styleeditor');
const {updateNode} = require('../../MapStore2/web/client/actions/layers');

const BorderLayout = require('../../MapStore2/web/client/components/layout/BorderLayout');
const StyleList = require('../../MapStore2/web/client/components/styleeditor/StyleList');
const emptyState = require('../../MapStore2/web/client/components/misc/enhancers/emptyState');
const {updateStyle, getOriginalStyle} = require('../../MapStore2/web/client/utils/VectorTileUtils');
const {updateSettingsParams} = require('../../MapStore2/web/client/actions/layers');
const { SketchPicker } = require('react-color');
const tinycolor = require('tinycolor2');
const {
    Reader: sldReader
} = require('@nieuwlandgeo/sldreader/src/index');
const loadingState = require('../../MapStore2/web/client/components/misc/enhancers/loadingState');
const Editor = loadingState(({ code }) => !code)(require('../../MapStore2/web/client/components/styleeditor/Editor'));

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

const getStyleObj = state => {
    const layer = getUpdatedLayer(state);
    const currentStyle = layer.availableStyles && head((layer.availableStyles || []).filter(({name}) => name === (layer.style || layer.availableStyles && layer.availableStyles[0] && layer.availableStyles[0].name)));
    return currentStyle || {};
};

const LIST_WIDTH = 256;
const modes = {
    mbs: 'javascript',
    sld: 'xml'
};

const getCode = {
    mbs: (styleBody) => JSON.stringify(styleBody, null, 4),
    sld: (styleBody) => styleBody
};

const updateCode = {
    mbs: (code, {onUpdateNode, onReset, layer, enabledStyle, onError}) => {
        try {
            const styleBody = JSON.parse(code);
            const availableStyles = (layer && layer.availableStyles || []).map(style => ({
                ...style,
                styleBody: style.name === enabledStyle ? styleBody : style.styleBody
            }));
            onUpdateNode(layer.id, 'layers', {availableStyles});
            onReset();
        } catch(e) {
            onError('Error');
        }
    },
    sld: (code, {onUpdateNode, onReset, layer, enabledStyle, onError}) => {

        const styleObj = sldReader(code);
        if (!styleObj.layers || styleObj.layers && styleObj.layers.length === 1 && !styleObj.layers[0].styles) {
            onError('Error');
        } else {
            try {
                const styleBody = code;
                const availableStyles = (layer && layer.availableStyles || []).map(style => ({
                    ...style,
                    styleBody: style.name === enabledStyle ? styleBody : style.styleBody
                }));
                onUpdateNode(layer.id, 'layers', {availableStyles});
                onReset();
            } catch(e) {
                onError('Error');
            }
        }
    }
};
const parseCode = (style = {}) => {
    if (!style.code) return '';
    if (style.format === 'mbstyle') {
        return JSON.stringify(style.code, null, 4);
    }
    return style.code;
};

const comment = {
    mbstyle: 'MapBox Style - edit mode (render client side)',
    css: 'GeoCSS Style - read only mode (render as SLD client side)',
    sld: 'SLD Style - edit mode (render client side)'
};

const VectorStyleEditor = compose(
    connect(
        createSelector(
            [
                getUpdatedLayer,
                getAllStyles,
                getStyleObj,
                errorStyleSelector,
                state => get(state, 'controls.editor.style')
            ], (layer, { defaultStyle, enabledStyle, availableStyles }, {styleBody, format}, error, style) => ({
                layer,
                defaultStyle,
                enabledStyle,
                availableStyles,
                mode: modes[format],
                code: getCode[format] && getCode[format](styleBody) || styleBody,
                format,
                error: error.edit || null,
                vtStyle: style || {}
            })
        ),
        {
            onSelect: updateSettingsParams,
            onError: errorStyle.bind(null, 'edit'),
            onReset: resetStyleEditor,
            onUpdateNode: updateNode
        }
    ),
    emptyState(({layer}) => !(layer && layer.name)),
    withState('filterText', 'onFilter', '')
)((props) => {
    return (
        <div style={{ display: 'flex', position: 'relative', height: '100%', width:
        props.layer && (props.layer.type === 'vectortile' || props.layer.type === 'wms' && props.layer.format !== 'image/png') ? 700 : 256, overflowX: 'hidden'}}>
            <div style={{ width: LIST_WIDTH, overflowX: 'hidden'}}>
                <StyleList {...props}/>
            </div>
            {props.layer && props.layer.type === 'vectortile' && <div style={{ flex: 1, overflowX: 'hidden'}}>
                <Editor
                    key={props.enabledStyle}
                    inlineWidgets={inlineWidgets}
                    theme="neo"
                    {...props}
                    waitTime={0}
                    onChange={(code) => {
                        if (updateCode[props.format]) return updateCode[props.format](code, props);
                        return null;
                    }}/>
            </div>}
            {props.layer && props.layer.type === 'wms' && props.layer.format !== 'image/png' &&
            <div style={{ flex: 1, overflowX: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', borderLeft: '1px solid #ddd'}}>
                <div style={{ textAlign: 'center', padding: 12, borderBottom: '1px solid #ddd'}}>
                    {comment[props.vtStyle.format] || 'Loading...'}
                </div>
                <div style={{ flex: 1, overflowX: 'hidden', position: 'relative'}}>
                <Editor
                key={`${props.enabledStyle}:${props.layer && props.layer.id || ''}`}
                inlineWidgets={inlineWidgets}
                theme="neo"
                readOnly={props.vtStyle.format === 'css'}
                mode={modes[props.vtStyle.format]}
                code={props.vtStyle.format !== 'css' ? parseCode(props.vtStyle) : getOriginalStyle(props.layer).code}
                waitTime={0}
                onChange={(codeString) => {
                    try {
                        const code = props.vtStyle.format === 'mbstyle' ? JSON.parse(codeString) : codeString;
                        updateStyle(props.layer, {
                            ...props.vtStyle,
                            code
                        });
                        props.onSelect({ _v_: Date.now() }, true);
                    } catch(e) { /**/ }
                }}/></div></div>
            }
        </div>
    );
});

class TOC extends React.Component {
    static propTypes = {
        selectedLayer: PropTypes.array
    };

    render() {
        return (
            <BorderLayout
                className="ms-style-editor-container"
                footer={<div style={{ height: 0 }} />}
                columns={[
                    <div className={`ms-toc-container ${this.props.selectedLayer.name ? ' ms-toc-compact' : ''}`} style={{width: this.props.selectedLayer.name ? 180 : LIST_WIDTH, order: -1}}>
                        <TOCPlugin {...this.props}/>
                    </div>
                ]}>
                <VectorStyleEditor/>
            </BorderLayout>
        );
    }
}

module.exports = {
    TOCPlugin: assign(connect(
        createSelector(
            [
                getUpdatedLayer
            ], (selectedLayer) => ({
                selectedLayer
            })
        )
    )(TOC), {
        LeftMenu: {
            priority: 1,
            glyph: '1-layer',
            position: 0,
            size: '100%',
            tooltip: 'Layers'
        }
    }),
    reducers: {
        ...reducers,
        styleeditor: require('../../MapStore2/web/client/reducers/styleeditor')
    },
    epics
};
