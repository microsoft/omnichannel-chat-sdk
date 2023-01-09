const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const patchLoadScript = () => {
    const { require_WebUtils} = window;
    const loadScript = require_WebUtils().default.loadScript;
    require_WebUtils().default.loadScript = async (scriptUrl, callbackOnload, callbackError, retries, attempt) => {
        exports = undefined;
        await loadScript(scriptUrl, callbackOnload, callbackError, retries, attempt);
    }
};

const preloadChatAdapter = async () => {
    const {require_libraries, require_WebUtils} = window;
    const chatAdapterUrl = require_libraries().getACSAdapterCDNUrl();
    const loadScript = require_WebUtils().default.loadScript;
    exports = undefined; // Fix for ChatAdapter not available in window object;
    await loadScript(chatAdapterUrl);
};

window.sleep = sleep;
window.patchLoadScript = patchLoadScript;
window.preloadChatAdapter = preloadChatAdapter;