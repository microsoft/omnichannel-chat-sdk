const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

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

// Utility to ensure `LiveWorkItem` is fully created to prevent OC API failures caused by `LiveWorkItem is not found`
const waitForSessionInitialization = async (chatSDK, timeout = 10000, interval = 1000) => {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const run = async () => {
            const retry = async () => {
                if (Date.now() - startTime >= timeout) {
                    reject(new Error("Session initialization took too long"));
                } else {
                    await sleep(interval);
                    await run();
                }
            };

            try {
                const liveWorkItemDetails = await chatSDK.getConversationDetails();
                if (Object.keys(liveWorkItemDetails).length === 0) { // LWI is 'null' caused by API failures
                    await retry();
                }

                resolve("Session initialization completed");
            } catch (err) {
                await retry(); // Other failures
            }
        };

        run();
    });
};

window.sleep = sleep;
window.uuidv4 = uuidv4;
window.patchLoadScript = patchLoadScript;
window.preloadChatAdapter = preloadChatAdapter;
window.waitForSessionInitialization = waitForSessionInitialization;