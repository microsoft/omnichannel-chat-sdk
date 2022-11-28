const { build } = require('esbuild');
const GlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default;
const NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default;

build({
    entryPoints: [
        'dist/index.js'
    ],
    bundle: true,
    outfile: 'dist/lib.js',
    format: "cjs",
    plugins: [
        NodeModulesPolyfills(),
        GlobalsPolyfills()
    ],
}).catch(() => process.exit(1))