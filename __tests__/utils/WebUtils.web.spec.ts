/**
 * @jest-environment jsdom
 */

const WebUtils = require('../../src/utils/WebUtils');

describe('WebUtils', () => {
    it('WebUtils.loadScript() should create <script> element', () => {
        const sampleUrl = 'sample';

        jest.spyOn(document, 'getElementsByTagName').mockReturnValue([] as any);
        jest.spyOn(document, 'createElement');

        WebUtils.loadScript(sampleUrl);
        expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it('WebUtils.loadSCript() should not create duplicate <script> element', () => {
        jest.clearAllMocks();

        const sampleUrl = 'sample';

        jest.spyOn(document, 'getElementsByTagName').mockReturnValue([{src: sampleUrl}] as any);
        jest.spyOn(document, 'createElement');

        WebUtils.loadScript(sampleUrl);
        expect(document.createElement).toHaveBeenCalledTimes(0);
    });
});