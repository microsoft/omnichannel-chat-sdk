import { getACSAdapterCDNUrl, getIC3AdapterCDNUrl, getIC3ClientCDNUrl, getMsfpEmbedScript } from "../../src/utils/libraries";

describe('Libraries', () => {
    it('IC3Client should come from a production URL', () => {
        const productionUrl = "https://comms.omnichannelengagementhub.com/release";
        const ic3ClientCDNurl = getIC3ClientCDNUrl();
        expect(ic3ClientCDNurl.includes(productionUrl)).toBe(true);
    });

    it('WebChatIC3Adapter should come from a production URL', () => {
        const productionUrl = "https://webchatic3.blob.core.windows.net/webchat-ic3adapter";
        const ic3AdapterCDNUrl = getIC3AdapterCDNUrl();
        expect(ic3AdapterCDNUrl.includes(productionUrl)).toBe(true);
    });

    it('WebChatACSAdapter should come from a production URL', () => {
        const productionUrl = "https://unpkg.com/acs_webchat-chat-adapter";
        const acsAdapterCDNUrl = getACSAdapterCDNUrl();
        expect(acsAdapterCDNUrl.includes(productionUrl)).toBe(true);
    });

    it('getMsfpEmbedScript should include definition of renderSurvey and the Embed script', () => {
        const embedScript = "https://oc-cdn-ocprod.azureedge.net/livechatwidget/WebChatControl/lib/Embed.min.js";
        const renderSurveyFunction = "function renderSurvey";
        const msfpEmbedScript = getMsfpEmbedScript();
        expect(msfpEmbedScript.includes(embedScript)).toBe(true);
        expect(msfpEmbedScript.includes(renderSurveyFunction)).toBe(true);
    });
});