const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./libs/parts.js');
const pkg = require('./package.json');

const PATHS = {
  app: path.join(__dirname, 'app'),
  style: [
    path.join(__dirname, 'app', 'main.css'),
    path.join(__dirname, 'node_modules', 'purecss'),
  ],
  build: path.join(__dirname, 'build')
};

const common = {
  entry: {
    style: PATHS.style,
    app: PATHS.app,
    vendor: Object.keys(pkg.dependencies)
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
case 'build':
  config = merge(common,
                 {
                   devtool: 'source-map',
                   output: {
                     path: PATHS.build,
                     filename: '[name].[chunkhash].js',
                     chunkFilename: '[chunkhash].js'
                   }
                 },

                 parts.clean(PATHS.build),

                 parts.setFreeVariable(
                   'process.env.NODE_ENV',
                   'production'
                 ),
                 parts.extractBundle({
                   name: 'vendor',
                   entries: ['vue']
                 }),
                 parts.minify(),
                 parts.extractCSS(PATHS.style),
                 parts.purifyCSS([PATHS.app])
                );
  break;
default:
  config = merge(common,
                 {
                   devtool: 'eval-source-map'
                 },
                 parts.setupCSS(PATHS.style),
                 parts.devServer({
                   host: process.env.HOST,
                   port: process.env.PORT
                 })
                );
}

module.exports = validate(config);
