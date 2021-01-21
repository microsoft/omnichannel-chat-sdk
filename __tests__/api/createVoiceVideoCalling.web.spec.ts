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
        initialize: jest.fn(),
        isInitialized: jest.fn().mockResolvedValue(true),
        registerEvent: jest.fn((eventName: string, callback: Function) => {}),
        isMicrophoneMuted: jest.fn()
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

        it('VoiceVideoCallingProxy.isMicrophoneMuted() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
                environment: 'prod',
                logger: {
                    logInfo: () => {}
                },
                chatToken: {chatId: 'chatId'},
                OCClient: {
                    makeSecondaryChannelEventRequest: () => {}
                },
                selfVideoHTMLElementId: 'selfVideoHTMLElementId',
                remoteVideoHTMLElementId: 'remoteVideoHTMLElementId'
            };

            await proxy.initialize(params);
            jest.spyOn(proxy, 'isMicrophoneMuted');

            proxy.isMicrophoneMuted();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.onCallAdded() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onCallAdded(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('VoiceVideoCallingProxy.onLocalVideoStreamAdded() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onLocalVideoStreamAdded(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('VoiceVideoCallingProxy.onLocalVideoStreamRemoved() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onLocalVideoStreamRemoved(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('VoiceVideoCallingProxy.onRemoteVideoStreamAdded() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onRemoteVideoStreamAdded(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('VoiceVideoCallingProxy.onRemoteVideoStreamRemoved() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onRemoteVideoStreamRemoved(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('VoiceVideoCallingProxy.onCallDisconnected() should call VoiceVideoCallingProxy.addEventListener()', async () => {
            const proxy = await VoiceVideoCallingProxy.getInstance();
            jest.spyOn(proxy, 'addEventListener');
            proxy.onCallDisconnected(() => {});
            expect(proxy.addEventListener).toHaveBeenCalledTimes(1);
        });
    });
});