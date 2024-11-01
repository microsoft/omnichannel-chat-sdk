import { getACSAdapterCDNUrl } from "../../src/utils/libraries";

describe('Libraries', () => {
    it('WebChatACSAdapter should come from a production URL', () => {
        const productionUrl = "https://unpkg.com/acs_webchat-chat-adapter";
        const acsAdapterCDNUrl = getACSAdapterCDNUrl();
        expect(acsAdapterCDNUrl.includes(productionUrl)).toBe(true);
    });
});