/**
 * @jest-environment jsdom
 */

const WebUtils = require('../../src/utils/WebUtils');

describe('WebUtils', () => {
    it('WebUtils.loadScript() should create <script> element', async () => {
        const sampleUrl = 'sample';

        jest.spyOn(document, 'createElement');

        WebUtils.loadScript(sampleUrl);
        expect(document.createElement).toHaveBeenCalledTimes(1);
    });
});