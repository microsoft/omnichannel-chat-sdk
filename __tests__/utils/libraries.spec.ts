import { getIC3ClientCDNUrl, getIC3AdapterCDNUrl } from "../../src/utils/libraries";

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
});