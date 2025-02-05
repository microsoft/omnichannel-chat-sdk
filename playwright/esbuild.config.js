const { build } = require('esbuild');
const { polyfillNode } = require("esbuild-plugin-polyfill-node");
const path = require('path');

const AzureCommunicationChatPolyfills = () => {
    return {
        name: 'AzureCommunicationChatPolyfill',
        setup: ({onResolve}) => {
            onResolve({filter: /@azure\/communication-chat/}, args => {
                // Polyfill Chat Package to support real-time notifications on Browser
                if (args.path === '@azure/communication-chat') {
                    const defaultPath = require.resolve('@azure/communication-chat');
                    const basePath = path.dirname(path.dirname(defaultPath))
                    const esmPath = path.join(basePath, 'dist-esm', 'src','index.js');
                    return {
                        path: esmPath.toString()
                    }
                }
            })
        }
    }
}

build({
    entryPoints: [
        'dist/index.js'
    ],
    bundle: true,
    outfile: 'dist/lib.js',
    format: "cjs",
    platform: "browser",
    plugins: [
        polyfillNode({
            polyfills: {
                crypto: true
            }
        }),
        AzureCommunicationChatPolyfills()
    ],
}).catch(() => process.exit(1))