const path = require('path');
const R = require('ramda');
const webpack = require('webpack');
const withTypeScript = require('@zeit/next-typescript');
const withQueryFiles = require('./config/withQueryFiles');
const withLinkedDependencies = require('./config/withLinkedDependencies');
const withWebWorkers = require('./config/withWebWorkers');

const withComposedConfig = R.compose(
  withLinkedDependencies,
  withWebWorkers,
  withQueryFiles,
  withTypeScript,
);

module.exports = withComposedConfig({
  webWorkers: /\/graphql\/local\/worker\.ts$/,
  typescriptLoaderOptions: {
    // We have to specify this explicitly so the ts-loader does
    // not incorrectly use one of the linked package's tsconfig.json
    // when only compiling individual file e.g. during
    // hot-module-replacement.
    configFile: path.resolve(__dirname, 'tsconfig.json'),
  },
  linkedDependencies: [
    ['@melonproject/melon.js', 'lib'],
    ['@melonproject/graphql-schema', 'src'],
    ['@melonproject/manager-components', 'src'],
    ['@melonproject/exchange-aggregator', 'src'],
  ],
  distDir: '../dist',
  exportPathMap: () => ({
    '/': { page: '/' },
  }),
  webpack: (config, options) => {
    const graphql = process.env.GRAPHQL || 'local';

    config.resolve.alias = Object.assign({}, config.resolve.alias || {}, {
      '~/shared': path.resolve(__dirname, 'src', 'shared'),
    });

    // Make process.env.DEBUG accessible so we can use the debug package
    // to print debug messages even in a web worker which does not have
    // access to the default lookup strategy of the debug package (local storage).
    config.plugins.push(new webpack.EnvironmentPlugin(['DEBUG']));

    // Code splitting doesn't make much sense in an electron app.
    if (JSON.parse(process.env.ELECTRON_PACKAGE)) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      );
    }

    return config;
  },
});
