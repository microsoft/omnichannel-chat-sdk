const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = (_env, argv) => {
    const isProd = argv.mode === 'production';

    return {
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProd ? 'bundle.[contenthash].js' : 'bundle.js',
            clean: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            // The SDK has a conditional require('react-native') for cross-platform
            // support. We're not in React Native here — silence the warning.
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
            }),
            // Mirror the polyfill pattern from playwright/esbuild.config.js so that
            // @azure/communication-chat's real-time notifications work in the browser.
            // Webpack 5 dropped Node polyfills; node-polyfill-webpack-plugin restores them.
            new NodePolyfillPlugin(),
            // Suppress the harmless 'react-native' resolution warning.
            new webpack.IgnorePlugin({ resourceRegExp: /^react-native$/ }),
        ],
        devServer: {
            static: { directory: path.join(__dirname, 'public') },
            port: 3000,
            hot: true,
            historyApiFallback: true,
        },
        devtool: isProd ? 'source-map' : 'inline-source-map',
    };
};
