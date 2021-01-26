import IChatToken from "../external/IC3Adapter/IChatToken";

interface IVoiceVideoCallingParams {
    environment?: string;
    logger?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    chatToken: IChatToken;
    OCClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    selfVideoHTMLElementId: string;
    remoteVideoHTMLElementId: string;
}

interface IEventPayload {
    callId: string;
    spoolCallId: string;
}

interface IAcceptCallConfig {
    withVideo?: boolean;
}

enum SecondaryChannelType {
    Voice = 192370000,
    Video = 192380000,
    Cobrowse = 192390000
}

enum SecondaryChannelEvents {
    Accept = 'accept',
    Reject = 'reject',
    Connect = 'connect',
    End = 'end'
}

export class VoiceVideoCallingProxy {
    private static _instance: VoiceVideoCallingProxy;
    private debug: boolean;
    private proxy: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private proxyInstance: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private callingParams?: IVoiceVideoCallingParams;
    private logger: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    private constructor() {
        this.debug = false;
        this.proxy = window.Microsoft.OmniChannel.SDK.VoiceVideoCalling;
        this.proxyInstance = this.proxy.getInstance();
    }

    public static getInstance(): VoiceVideoCallingProxy {
        if (!this._instance) {
            this._instance = new VoiceVideoCallingProxy();
        }
        return this._instance;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public async load(params: any = {}): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (params.logger) {
            this.logger = params.logger;
        }

        this.proxyInstance.load(params);
    }

    public isInitialized(): boolean {
        return this.proxyInstance.isInitialized();
    }

    public async initialize(params: IVoiceVideoCallingParams): Promise<void> {
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy] VoiceVideoCallingParams: ${JSON.stringify(params)}`);
        this.callingParams = params;

        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][initialize] _isLoaded: ${this.proxyInstance._isLoaded}`);
        if (!this.proxyInstance._isLoaded) {
            await this.proxyInstance.load(this.logger || {});
        }

        this.proxyInstance.initialize({
            skypeid: this.callingParams?.chatToken.visitorId,
            accesstoken: this.callingParams?.chatToken.token,
            environment: this.callingParams?.environment || 'prod',
            selfVideoHTMLElementId: this.callingParams?.selfVideoHTMLElementId,
            remoteVideoHTMLElementId: this.callingParams?.remoteVideoHTMLElementId
        });
    }

    public addEventListener(eventName: string, callback: Function): void {
        this.proxyInstance.registerEvent(eventName, (params: IEventPayload) => {
            const {callId} = params;
            /* istanbul ignore next */
            this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}] callId: ${callId}`);
            if (callId !== this.callingParams?.chatToken.chatId) {
                return;
            }
            callback(params);
        });
    }

    public isMicrophoneMuted(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.isMicrophoneMuted({callId});
    }

    public async acceptCall(params: IAcceptCallConfig = {}): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][acceptCall] callId: ${callId}`);
        /* istanbul ignore next */
        this.debug && console.log(params);

        this.proxyInstance.acceptCall({callId, withVideo: params.withVideo || false});

        const body = {
            SecondaryChannelType: params.withVideo? SecondaryChannelType.Video: SecondaryChannelType.Voice,
            SecondaryChannelEventType: SecondaryChannelEvents.Accept
        }

        try {
            this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
            /* istanbul ignore next */
            this.debug && console.log(`[VoiceVideoCallingProxy][acceptCall][makeSecondaryChannelEventRequest]`);
        } catch (e) {
            console.error(`[VoiceVideoCallingProxy][acceptCall][makeSecondaryChannelEventRequest] Failure ${e}`);
        }
    }

    public async rejectCall(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][rejectCall] callId: ${callId}`);

        this.proxyInstance.rejectCall({callId});

        const body = {
            SecondaryChannelType: this.isRemoteVideoEnabled()? SecondaryChannelType.Video: SecondaryChannelType.Voice,
            SecondaryChannelEventType: SecondaryChannelEvents.Reject
        }

        try {
            this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
            /* istanbul ignore next */
            this.debug && console.log(`[VoiceVideoCallingProxy][rejectCall][makeSecondaryChannelEventRequest]`);
        } catch (e) {
            console.error(`[VoiceVideoCallingProxy][rejectCall][makeSecondaryChannelEventRequest] Failure ${e}`);
        }
    }

    public async stopCall(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][stopCall] callId: ${callId}`);
        this.proxyInstance.stopCall({callId});
    }

    public async toggleMute(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        this.proxyInstance.toggleMute({callId});
    }

    public isRemoteVideoEnabled(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.isRemoteVideoEnabled({callId});
    }

    public isLocalVideoEnabled(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.isLocalVideoEnabled({callId});
    }

    public async toggleLocalVideo(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.toggleLocalVideo({callId});
    }

    public isInACall(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.isInACall({callId});
    }

    public renderVideoStreams(): void {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.renderVideoStreams({callId});
    }

    public disposeVideoRenderers(): void {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxyInstance.disposeVideoRenderers({callId});
    }

    public close(): void {
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][close]`);
        this.proxyInstance.dispose();
        this.callingParams = undefined;
    }

    public onCallAdded(callback: Function): void {
        const eventName = 'callAdded';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onLocalVideoStreamAdded(callback: Function): void {
        const eventName = 'localVideoStreamAdded';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onLocalVideoStreamRemoved(callback: Function): void {
        const eventName = 'localVideoStreamRemoved';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onRemoteVideoStreamAdded(callback: Function): void {
        const eventName = 'remoteVideoStreamAdded';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onRemoteVideoStreamRemoved(callback: Function): void {
        const eventName = 'remoteVideoStreamRemoved';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onCallDisconnected(callback: Function): void {
        const eventName = 'callDisconnected';
        /* istanbul ignore next */
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, async (params: IEventPayload) => {

            const body = {
                SecondaryChannelType: SecondaryChannelType.Voice,
                SecondaryChannelEventType: SecondaryChannelEvents.End
            }

            try {
                this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
                this.debug && console.log(`[VoiceVideoCallingProxy][onCallDisconnected][makeSecondaryChannelEventRequest]`);
            } catch (e) {
                console.error(`[VoiceVideoCallingProxy][onCallDisconnected][makeSecondaryChannelEventRequest] Failure ${e}`);
            }

            callback(params);
        });
    }
}

const createVoiceVideoCalling = async (params: any = {}): Promise<VoiceVideoCallingProxy> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const proxy = VoiceVideoCallingProxy.getInstance();
    await proxy.load(params.logger);
    return Promise.resolve(proxy);
}

export default createVoiceVideoCalling;