import HostType from "@microsoft/omnichannel-ic3core/lib/interfaces/HostType";
import ProtocolType from "@microsoft/omnichannel-ic3core/lib/interfaces/ProtocoleType";
import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IChatToken from "./IChatToken";
import INotification from "./INotification";

export default interface IIC3AdapterOptions {
    userId: string;
    userDisplayName?: string;
    conversation?: IConversation
    chatToken?: IChatToken;
    sdkURL?: string;
    sdk?: any; // eslint-disable-line  @typescript-eslint/no-explicit-any
    visitor?: boolean;
    sendHeartBeat?: boolean;
    hostType?: HostType;
    protocolType?: ProtocolType;
    callbackOnNotification?: (notification: INotification) => void;
    callbackOnThreadNotFound?: () => void;
    featureConfig?: {
        ShouldEnableInlinePlaying: boolean
    }
}