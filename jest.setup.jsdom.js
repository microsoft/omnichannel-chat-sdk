const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
    global.window.dispatchEvent = () => { }
}

global.self = global; // Mock the `self` global variable