/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { createShallowSelectorCreator } from '@mapstore/utils/ReselectUtils';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import { layersSelector } from '@mapstore/selectors/layers';

const compareSelector = (selector) => {
    return createShallowSelectorCreator(
        (a, b) => {
            if (isObject(a) && isObject(b)) {
                const aStr = JSON.stringify(a);
                const bStr = JSON.stringify(b);
                return aStr === bStr;
            }
            return a === b || !isNil(a) && !isNil(b);
        }
    )(selector, compared => compared);
};

export const selectOGCTileVisibleLayers = compareSelector(state => layersSelector(state).filter((layer) => layer.type === 'ogc-tile' && layer.visibility !== false));
