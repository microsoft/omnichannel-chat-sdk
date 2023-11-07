import IChatToken from "../external/IC3Adapter/IChatToken";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

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

enum CallingEvents {
    CallAdded = 'callAdded',
    LocalVideoStreamAdded = 'localVideoStreamAdded',
    LocalVideoStreamRemoved = "localVideoStreamRemoved",
    RemoteVideoStreamAdded = "remoteVideoStreamAdded",
    RemoteVideoStreamRemoved = "remoteVideoStreamRemoved",
    CallDisconnected = "callDisconnected",
    ParticipantDisconnected = "participantDisconnected",
    IncomingCallEnded = "incomingCallEnded"
}

export class VoiceVideoCallingProxy {
    private static _instance: VoiceVideoCallingProxy;
    private debug: boolean;
    private callClientName: string;
    private logger: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private proxy: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private proxyInstance: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private callingParams?: IVoiceVideoCallingParams;
    private callId?: string;
    private scenarioMarker?: ScenarioMarker;

    private constructor() {
        this.debug = false;
        this.callClientName = 'ElevateToVoiceVideo';
        this.proxy = (window as any)["Microsoft.Omnichannel.Calling.SDK"].VoiceVideoCalling; // eslint-disable-line @typescript-eslint/no-explicit-any
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

    public useScenarioMarker(scenarioMarker: ScenarioMarker): void {
        this.scenarioMarker = scenarioMarker;
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

        this.scenarioMarker?.startScenario(TelemetryEvent.InitializeVoiceVideoCallingSDK);

        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][initialize] _isLoaded: ${this.proxyInstance._isLoaded}`);
        if (!this.proxyInstance._isLoaded) {
            await this.proxyInstance.load({
                logger: this.logger || undefined
            });
        }

        try {
            await this.proxyInstance.initialize({
                callClientName: this.callClientName,
                accesstoken: this.callingParams?.chatToken.voiceVideoCallToken?.Token || this.callingParams?.chatToken.token,
                selfVideoHTMLElementId: this.callingParams?.selfVideoHTMLElementId,
                remoteVideoHTMLElementId: this.callingParams?.remoteVideoHTMLElementId
            });

            this.scenarioMarker?.completeScenario(TelemetryEvent.InitializeVoiceVideoCallingSDK);
        } catch (error) {
            console.log(error);
            this.scenarioMarker?.failScenario(TelemetryEvent.InitializeVoiceVideoCallingSDK);
        }
    }

    public addEventListener(eventName: string, callback: Function): void {
        this.proxyInstance.registerEvent(eventName, (params: IEventPayload) => {
            const {callId} = params;

            if (eventName === CallingEvents.CallAdded) {
                this.callId = callId;
            }

            /* istanbul ignore next */
            this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}] callId: ${callId}`);
            if (callId !== this.callId) {
                return;
            }
            callback(params);
        });
    }

    public isMicrophoneMuted(): boolean {
        const {callClientName, callId} = this;
        return this.proxyInstance.isMicrophoneMuted({callClientName, callId});
    }

    public async acceptCall(params: IAcceptCallConfig = {}): Promise<void> {
        const {callClientName, callId} = this;

        this.scenarioMarker?.startScenario(params.withVideo? TelemetryEvent.AcceptVideoCall: TelemetryEvent.AcceptVoiceCall, {
            CallId: callId || ''
        });

        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][acceptCall] callId: ${callId}`);
        /* istanbul ignore next */
        this.debug && console.debug(params);

        try {
            await this.proxyInstance.acceptCall({callClientName, callId, withVideo: params.withVideo || false});
        } catch {
            const exceptionDetails = {
                response: params.withVideo? "AcceptVideoCallFailed": "AcceptVoiceCallFailed"
            };

            this.scenarioMarker?.failScenario(params.withVideo? TelemetryEvent.AcceptVideoCall: TelemetryEvent.AcceptVoiceCall, {
                CallId: callId || '',
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });
        }

        const body = {
            SecondaryChannelType: params.withVideo? SecondaryChannelType.Video: SecondaryChannelType.Voice,
            SecondaryChannelEventType: SecondaryChannelEvents.Accept
        }

        try {
            this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
            this.scenarioMarker?.completeScenario(params.withVideo? TelemetryEvent.AcceptVideoCall: TelemetryEvent.AcceptVoiceCall, {
                CallId: callId || ''
            });

            /* istanbul ignore next */
            this.debug && console.debug(`[VoiceVideoCallingProxy][acceptCall][makeSecondaryChannelEventRequest]`);
        } catch (e) {
            const exceptionDetails = {
                response: "OCClientMakeSecondaryChannelEventRequestFailed"
            };

            this.scenarioMarker?.failScenario(params.withVideo? TelemetryEvent.AcceptVideoCall: TelemetryEvent.AcceptVoiceCall, {
                CallId: callId || '',
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`[VoiceVideoCallingProxy][acceptCall][makeSecondaryChannelEventRequest] Failure ${e}`);
        }
    }

    public async rejectCall(): Promise<void> {
        const {callClientName, callId} = this;

        this.scenarioMarker?.startScenario(TelemetryEvent.RejectCall, {
            CallId: callId || ''
        });

        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][rejectCall] callId: ${callId}`);
        try {
            await this.proxyInstance.rejectCall({callClientName, callId});
            this.scenarioMarker?.completeScenario(TelemetryEvent.RejectCall, {
                CallId: callId || ''
            });
        } catch {
            const exceptionDetails = {
                response: "RejectCallFailed"
            };

            this.scenarioMarker?.failScenario(TelemetryEvent.RejectCall, {
                CallId: callId || '',
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });
        }

        const body = {
            SecondaryChannelType: this.isRemoteVideoEnabled()? SecondaryChannelType.Video: SecondaryChannelType.Voice,
            SecondaryChannelEventType: SecondaryChannelEvents.Reject
        }

        try {
            this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
            /* istanbul ignore next */
            this.debug && console.debug(`[VoiceVideoCallingProxy][rejectCall][makeSecondaryChannelEventRequest]`);
        } catch (e) {
            const exceptionDetails = {
                response: "OCClientMakeSecondaryChannelEventRequestFailed"
            };

            this.scenarioMarker?.failScenario(TelemetryEvent.RejectCall, {
                CallId: callId || '',
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`[VoiceVideoCallingProxy][rejectCall][makeSecondaryChannelEventRequest] Failure ${e}`);
        }
    }

    public async stopCall(): Promise<void> {
        const {callClientName, callId} = this;

        this.scenarioMarker?.startScenario(TelemetryEvent.StopCall, {
            CallId: callId || ''
        });

        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][stopCall] callId: ${callId}`);

        const forEveryone = this.callingParams?.chatToken.voiceVideoCallToken?.Token? true: false; // Not supported on skype identity
        try {
            await this.proxyInstance.stopCall({callClientName, callId, forEveryone});
            this.scenarioMarker?.completeScenario(TelemetryEvent.StopCall, {
                CallId: callId || ''
            });
        } catch {
            this.scenarioMarker?.failScenario(TelemetryEvent.StopCall, {
                CallId: callId || '',
            });
        }
    }

    public async toggleMute(): Promise<void> {
        const {callClientName, callId} = this;
        return this.proxyInstance.toggleMute({callClientName, callId});
    }

    public isRemoteVideoEnabled(): boolean {
        const {callClientName, callId} = this;
        return this.proxyInstance.isRemoteVideoEnabled({callClientName, callId});
    }

    public isLocalVideoEnabled(): boolean {
        const {callClientName, callId} = this;
        return this.proxyInstance.isLocalVideoEnabled({callClientName, callId});
    }

    public async toggleLocalVideo(): Promise<void> {
        const {callClientName, callId} = this;
        return this.proxyInstance.toggleLocalVideo({callClientName, callId});
    }

    public isInACall(): boolean {
        const {callClientName, callId} = this;
        return this.proxyInstance.isInACall({callClientName, callId});
    }

    public renderVideoStreams(): void {
        const {callClientName, callId} = this;
        return this.proxyInstance.renderVideoStreams({callClientName, callId});
    }

    public disposeVideoRenderers(): void {
        const {callClientName, callId} = this;
        return this.proxyInstance.disposeVideoRenderers({callClientName, callId});
    }

    public close(): void {
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][close]`);
        this.proxyInstance.dispose();
        this.callingParams = undefined;
        this.callId = undefined;
    }

    public onCallAdded(callback: Function): void {
        const eventName = CallingEvents.CallAdded;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onLocalVideoStreamAdded(callback: Function): void {
        const eventName = CallingEvents.LocalVideoStreamAdded;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onLocalVideoStreamRemoved(callback: Function): void {
        const eventName = CallingEvents.LocalVideoStreamRemoved;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onRemoteVideoStreamAdded(callback: Function): void {
        const eventName = CallingEvents.RemoteVideoStreamAdded;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onRemoteVideoStreamRemoved(callback: Function): void {
        const eventName = CallingEvents.RemoteVideoStreamRemoved;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, callback);
    }

    public onCallDisconnected(callback: Function): void {
        const eventName = CallingEvents.CallDisconnected;
        /* istanbul ignore next */
        this.debug && console.debug(`[VoiceVideoCallingProxy][${eventName}]`);
        this.addEventListener(eventName, async (params: IEventPayload) => {
            const body = {
                SecondaryChannelType: SecondaryChannelType.Voice,
                SecondaryChannelEventType: SecondaryChannelEvents.End
            }

            this.scenarioMarker?.startScenario(TelemetryEvent.OnCallDisconnected, {
                CallId: this.callId || ''
            });

            try {
                this.callingParams?.OCClient.makeSecondaryChannelEventRequest(this.callingParams?.chatToken.requestId, body);
                this.debug && console.debug(`[VoiceVideoCallingProxy][onCallDisconnected][makeSecondaryChannelEventRequest]`);
                this.scenarioMarker?.completeScenario(TelemetryEvent.OnCallDisconnected, {
                    CallId: this.callId || ''
                });
            } catch (e) {
                console.error(`[VoiceVideoCallingProxy][onCallDisconnected][makeSecondaryChannelEventRequest] Failure ${e}`);

                const exceptionDetails = {
                    response: 'OCClientMakeSecondaryChannelEventRequestFailed'
                }
                this.scenarioMarker?.failScenario(TelemetryEvent.OnCallDisconnected, {
                    CallId: this.callId || '',
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });
            }

            this.clearRemoteVideoElementChildren();
            callback(params);
        });
    }

    private clearRemoteVideoElementChildren() {
        // Remove remoteVideoHTMLElement children if any or video won't be rendered properly
        if (this.callingParams?.remoteVideoHTMLElementId) {
            const remoteVideoElement = document.getElementById(this.callingParams?.remoteVideoHTMLElementId);
            while (remoteVideoElement?.firstChild) {
                /* istanbul ignore next */
                this.debug && console.debug('[VoiceVideoCallingProxy][clearRemoteVideoElement]');
                remoteVideoElement.firstChild.remove();
            }
        }
    }
}

const createVoiceVideoCalling = async (params: any = {}): Promise<VoiceVideoCallingProxy> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const proxy = VoiceVideoCallingProxy.getInstance();
    await proxy.load({
        logger: params.logger || undefined
    });
    return Promise.resolve(proxy);
}

export default createVoiceVideoCalling;
