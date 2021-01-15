import IChatToken from "../external/IC3Adapter/IChatToken";

interface IVoiceVideoCallingParams {
    environment?: string;
    logger?: any;
    chatToken: IChatToken;
    OCClient: any;
    selfVideoHTMLElementId: string;
    remoteVideoHTMLElementId: string;
}

interface IAcceptCallConfig {
    withVideo?: boolean;
}

class VoiceVideoCallingProxy {
    private static _instance: VoiceVideoCallingProxy;
    private debug: boolean;
    private proxy: any;
    private callingParams?: IVoiceVideoCallingParams;
    private logger: any;

    private constructor() {
        this.debug = false;
        this.proxy = window.Microsoft.OmniChannel.SDK.VoiceVideoCalling;
    }

    public static getInstance(): VoiceVideoCallingProxy {
        if (!this._instance) {
            this._instance = new VoiceVideoCallingProxy();
        }
        return this._instance;
    }

    public setDebug(flag: boolean) {
        this.debug = flag;
    };

    public async load(params: any = {}): Promise<void> {
        if (params.logger) {
            this.logger = params.logger;
        }

        this.proxy.getInstance().load(params);
    }

    public isInitialized(): boolean {
        return this.proxy.getInstance().isInitialized();
    }

    public async initialize(params: IVoiceVideoCallingParams): Promise<void> {
        this.debug && console.debug(`[VoiceVideoCallingProxy] VoiceVideoCallingParams: ${JSON.stringify(params)}`);
        this.callingParams = params;

        this.debug && console.debug(`[VoiceVideoCallingProxy][initialize] _isLoaded: ${this.proxy.getInstance()._isLoaded}`);
        if (!this.proxy.getInstance()._isLoaded) {
            await this.proxy.getInstance().load(this.logger || {});
        }

        this.proxy.getInstance().initialize({
            skypeid: this.callingParams?.chatToken.visitorId,
            accesstoken: this.callingParams?.chatToken.token,
            environment: this.callingParams?.environment || 'prod',
            selfVideoHTMLElementId: this.callingParams?.selfVideoHTMLElementId,
            remoteVideoHTMLElementId: this.callingParams?.selfVideoHTMLElementId
        });
    }

    public registerEvent(eventName: string, callback: Function): void {
        this.proxy.getInstance().registerEvent(eventName, (params: any) => {
            const {callId} = params;
            this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}] callId: ${callId}`);
            if (callId !== this.callingParams?.chatToken.chatId) {
                return;
            }
            callback(params);
        });
    }

    public isMicrophoneMuted(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().isMicrophoneMuted({callId});
    }

    public async acceptCall(params: IAcceptCallConfig): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        this.proxy.getInstance().acceptCall({callId, withVideo: params.withVideo || false});
    }

    public async rejectCall(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        this.proxy.getInstance().rejectCall({callId});
    }

    public async toggleMute(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        this.proxy.getInstance().toggleMute({callId});
    }

    public isRemoteVideoEnabled(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().isRemoteVideoEnabled({callId});
    }

    public isLocalVideoEnabled(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().isLocalVideoEnabled({callId});
    }

    public async toggleLocalVideo(): Promise<void> {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().toggleLocalVideo({callId});
    }

    public isInACall(): boolean {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().isInACall({callId});
    }

    public renderVideoStreams(): void {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().renderVideoStreams({callId});
    }

    public disposeVideoRenderers(): void {
        const callId = this.callingParams?.chatToken.chatId;
        return this.proxy.getInstance().disposeVideoRenderers({callId});
    }

    public dispose(): void {
        this.proxy.getInstance().dispose();
        this.callingParams = undefined;
    }

    public onCallAdded(callback: Function): void {
        const eventName = 'callAdded';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }

    public onLocalVideoStreamAdded(callback: Function): void {
        const eventName = 'localVideoStreamAdded';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }

    public onLocalVideoStreamRemoved(callback: Function): void {
        const eventName = 'localVideoStreamRemoved';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }

    public onRemoteVideoStreamAdded(callback: Function): void {
        const eventName = 'remoteVideoStreamAdded';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }

    public onRemoteVideoStreamRemoved(callback: Function): void {
        const eventName = 'remoteVideoStreamRemoved';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }

    public onCallDisconnected(callback: Function): void {
        const eventName = 'callDisconnected';
        this.debug && console.log(`[VoiceVideoCallingProxy][${eventName}]`);
        this.registerEvent(eventName, callback);
    }
}

const createVoiceVideoCalling = async (params: any = {}) => {
    const proxy = VoiceVideoCallingProxy.getInstance();
    await proxy.load(params.loader);
    return Promise.resolve(proxy);
}

export default createVoiceVideoCalling;