import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IChatToken from "./IChatToken";

export default interface IIC3AdapterOptions {
    userId: string;
    userDisplayName?: string;
    conversation?: IConversation
    chatToken?: IChatToken;
    sdkURL?: string;
    sdk?: any;
    // visitor: boolean;
    // sendHeartBeat: boolean;
    // hostType: HostType;
    // protocolType: ProtocolType;
    // callbackOnNotification?: (notification: INotification) => void;
}