const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const preloadChatAdapter = async () => {
    const {require_libraries, require_WebUtils} = window;
    const chatAdapterUrl = require_libraries().getACSAdapterCDNUrl();
    const loadScript = require_WebUtils().default.loadScript;
    exports = undefined; // Fix for ChatAdapter not available in window object;
    await loadScript(chatAdapterUrl);
};

window.sleep = sleep;
window.preloadChatAdapter = preloadChatAdapter;