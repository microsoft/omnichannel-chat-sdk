const { TextEncoder: PolyfillTextEncoder, TextDecoder: PolyfillTextDecoder } = require("text-encoding");
// Use polyfill TextEncoder/TextDecoder
global.TextEncoder = PolyfillTextEncoder;
global.TextDecoder = PolyfillTextDecoder;

if (global.window === undefined) {
    const { JSDOM } = require("jsdom");
    const jsdom = new JSDOM();
    const { window } = jsdom;
    global.window = window;
    global.document = window.document;
    global.navigator = window.navigator;
    global.DOMParser = window.DOMParser;
    global.Node = window.Node;
    global.XMLSerializer = window.XMLSerializer;
    global.window.dispatchEvent = ()=> {}
}

global.self = global; // Mock the `self` global variable