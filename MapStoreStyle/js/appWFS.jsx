/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ConfigUtils = require('../MapStore2/web/client/utils/ConfigUtils');
ConfigUtils.setLocalConfigurationFile('static/mapstorestyle/localConfig.json');

const appConfig = require('./appConfigWFS');
const plugins = require('./pluginsWFS');

require('./main')(appConfig, plugins);
