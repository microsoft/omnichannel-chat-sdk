class VoiceVideoCallingProxy {
    private static _instance: VoiceVideoCallingProxy;
    private proxy: any;

    private constructor() {
        this.proxy = window.Microsoft.OmniChannel.SDK.VoiceVideoCalling;
    }

    public static getInstance(): VoiceVideoCallingProxy {
        if (!this._instance) {
            this._instance = new VoiceVideoCallingProxy();
        }
        return this._instance;
    }

    public async load(params: any = {}): Promise<void> {
        this.proxy.getInstance().load(params);
    }

    public isInitialized(): boolean {
        return this.proxy.getInstance().isInitialized();
    }

    public async initialize(params: any = {}): Promise<void> {
        this.proxy.getInstance().load(params);
    }

    public registerEvent(eventName: string, callback: Function): void {
        this.proxy.getInstance().registerEvent(eventName, callback);
    }

    public isMicrophoneMuted(params: any): boolean {
        return this.proxy.getInstance().isMicrophoneMuted(params);
    }

    public async acceptCall(params: any): Promise<void> {
        this.proxy.getInstance().acceptCall(params);
    }

    public async rejectCall(params: any): Promise<void> {
        this.proxy.getInstance().rejectCall(params);
    }

    public async toggleMute(params: any): Promise<void> {
        this.proxy.getInstance().toggleMute(params);
    }

    public isRemoteVideoEnabled(params: any): boolean {
        return this.proxy.getInstance().isRemoteVideoEnabled(params);
    }

    public isLocalVideoEnabled(params: any): boolean {
        return this.proxy.getInstance().isLocalVideoEnabled(params);
    }

    public async toggleLocalVideo(params: any): Promise<void> {
        return this.proxy.getInstance().toggleLocalVideo(params);
    }

    public isInACall(params: any): boolean {
        return this.proxy.getInstance().isInACall(params);
    }

    public renderVideoStreams(params: any): void {
        return this.proxy.getInstance().renderVideoStreams(params);
    }

    public disposeVideoRenderers(params: any): void {
        return this.proxy.getInstance().disposeVideoRenderers(params);
    }

    public dispose(): void {
        this.proxy.getInstance().dispose();
    }
}

const createVoiceVideoCalling = async (params: any = {}) => {
    const proxy = VoiceVideoCallingProxy.getInstance();
    await proxy.load(params);
    return Promise.resolve(proxy);
}

export default createVoiceVideoCalling;