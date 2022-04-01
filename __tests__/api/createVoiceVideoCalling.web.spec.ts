/**
 * @jest-environment jsdom
 */

import createVoiceVideoCalling from '../../src/api/createVoiceVideoCalling';
const VoiceVideoCallingProxy = require('../../src/api/createVoiceVideoCalling').VoiceVideoCallingProxy;

describe('createVoiceVideoCalling', () => {
    (window as any)["Microsoft.Omnichannel.Calling.SDK"] = {};
    (window as any)["Microsoft.Omnichannel.Calling.SDK"].VoiceVideoCalling = {};
    (window as any)["Microsoft.Omnichannel.Calling.SDK"].VoiceVideoCalling.getInstance = () => ({
        load: jest.fn().mockResolvedValue(Promise.resolve()),
        initialize: jest.fn(),
        isInitialized: jest.fn().mockResolvedValue(true),
        registerEvent: jest.fn((eventName: string, callback: Function) => {}),
        isMicrophoneMuted: jest.fn(),
        acceptCall: jest.fn(),
        rejectCall: jest.fn(),
        stopCall: jest.fn(),
        toggleMute: jest.fn().mockResolvedValue(Promise.resolve()),
        isRemoteVideoEnabled: jest.fn().mockResolvedValue(true),
        isLocalVideoEnabled: jest.fn().mockResolvedValue(true),
        toggleLocalVideo: jest.fn().mockResolvedValue(Promise.resolve()),
        isInACall: jest.fn().mockResolvedValue(true),
        renderVideoStreams: jest.fn(),
        disposeVideoRenderers: jest.fn(),
        dispose: jest.fn()
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
            expect(proxy.load.mock.calls[0][0].logger).toMatchObject(logger);
        });

        it('VoiceVideoCallingProxy.isMicrophoneMuted() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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

        it('VoiceVideoCallingProxy.acceptCall() should have ChatId defined', async () => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'acceptCall');

            await proxy.acceptCall();
            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.rejectCall() should have ChatId defined', async () => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'rejectCall');

            await proxy.rejectCall();
            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.stopCall() should have ChatId defined', async () => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'stopCall');

            await proxy.stopCall();
            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.toggleMute() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'toggleMute');

            proxy.toggleMute();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.isRemoteVideoEnabled() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'isRemoteVideoEnabled');

            proxy.isRemoteVideoEnabled();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.isLocalVideoEnabled() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'isLocalVideoEnabled');

            proxy.isLocalVideoEnabled();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.toggleLocalVideo() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'toggleLocalVideo');

            await proxy.toggleLocalVideo();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.isInACall() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'isInACall');

            proxy.isInACall();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.renderVideoStreams() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'renderVideoStreams');

            proxy.renderVideoStreams();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.disposeVideoRenderers() should have ChatId defined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'disposeVideoRenderers');

            proxy.disposeVideoRenderers();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams.chatToken.chatId).not.toBe(undefined);
        });

        it('VoiceVideoCallingProxy.close() should have callingParams undefined', async() => {
            const proxy = await createVoiceVideoCalling();

            const params = {
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
            jest.spyOn(proxy, 'close');

            proxy.close();

            expect((proxy as typeof VoiceVideoCallingProxy).callingParams).toBe(undefined);
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