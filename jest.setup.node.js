const { JSDOM } = require("jsdom");
const { TextEncoder, TextDecoder } = require("util");

if (global.window === undefined) {
    const jsdom = new JSDOM();

     const { window } = jsdom;

     global.window = global;

    global.document = global.document;
    global.navigator = global.navigator;
    global.DOMParser = global.DOMParser;
    global.Node = global.Node;
    global.XMLSerializer = global.XMLSerializer;
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

global.self = global; 