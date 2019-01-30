const path = require('path');

const extractThemesPlugin = require('./MapStore2/themes.js').extractThemesPlugin;

module.exports = require('./buildConfig')(
    {
        'mapstorestyleWMTS': path.join(__dirname, 'js', 'appWMTS'),
        'mapstorestyleWMS': path.join(__dirname, 'js', 'appWMS'),
        'mapstorestyleWFS': path.join(__dirname, 'js', 'appWFS')
    },
    {
        'themes/default': path.join(__dirname, 'assets', 'themes', 'default', 'theme.less')
    },
    {
        base: __dirname,
        dist: path.join(__dirname, 'dist'),
        framework: path.join(__dirname, 'MapStore2', 'web', 'client'),
        code: [path.join(__dirname, 'js'), path.join(__dirname, 'MapStore2', 'web', 'client')]
    },
    extractThemesPlugin,
    false,
    '/static/mapstorestyle/',
    '.mapstorestyle'
);
