/**
 * @jest-environment jsdom
 */

import createVoiceVideoCalling from '../../src/api/createVoiceVideoCalling';
const VoiceVideoCallingProxy = require('../../src/api/createVoiceVideoCalling').VoiceVideoCallingProxy;

describe('createVoiceVideoCalling', () => {
    (window as any).Microsoft = {};
    (window as any).Microsoft.OmniChannel = {};
    (window as any).Microsoft.OmniChannel.SDK = {};
    (window as any).Microsoft.OmniChannel.SDK.VoiceVideoCalling = {};
    (window as any).Microsoft.OmniChannel.SDK.VoiceVideoCalling.getInstance = () => ({
        load: jest.fn().mockResolvedValue(Promise.resolve()),
        isInitialized: jest.fn().mockResolvedValue(true)
    });

    describe('Functionalities', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createVoiceVideoCalling() should return VoiceVideoCallingProxy', async () => {
            const proxy = await createVoiceVideoCalling();
            expect(proxy).toBeInstanceOf(VoiceVideoCallingProxy);
        });

        it('createVoiceVideoCalling() should call proxy.load()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'load');
            await createVoiceVideoCalling();
            expect(proxy.load).toHaveBeenCalledTimes(1);
        });

        it('createVoiceVideoCalling() with a logger should pass it to proxy.load()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'load');
            const logger = {
                logInfo: () => {}
            };
            await createVoiceVideoCalling({logger});
            expect(proxy.load).toHaveBeenCalledTimes(1);
            expect(proxy.load.mock.calls[0][0]).toMatchObject(logger);
        });
    });
});