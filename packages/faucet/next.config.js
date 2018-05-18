require('dotenv-extended').config();

const path = require('path');
const R = require('ramda');
const webpack = require('webpack');
const withTypeScript = require('@zeit/next-typescript');
const withLinkedDependencies = require('./config/withLinkedDependencies');

const withComposedConfig = R.compose(withLinkedDependencies, withTypeScript);

module.exports = withComposedConfig({
  typescriptLoaderOptions: {
    // We have to specify this explicitly so the ts-loader does
    // not incorrectly use one of the linked package's tsconfig.json
    // when only compiling individual file e.g. during
    // hot-module-replacement.
    configFile: path.resolve(__dirname, 'tsconfig.json'),
  },
  linkedDependencies: [['@melonproject/melon.js', 'lib']],
  distDir: '../dist',
  exportPathMap: () => ({
    '/': { page: '/' },
  }),
});
