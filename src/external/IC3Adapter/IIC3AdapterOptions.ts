import HostType from "@microsoft/omnichannel-ic3core/lib/interfaces/HostType";
import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IChatToken from "./IChatToken";
import INotification from "./INotification";
import ProtocolType from "@microsoft/omnichannel-ic3core/lib/interfaces/ProtocoleType";

export default interface IIC3AdapterOptions {
    userId: string;
    userDisplayName?: string;
    conversation?: IConversation
    chatToken?: IChatToken;
    sdkURL?: string;
    // visitor: boolean;
    // sendHeartBeat: boolean;
    // hostType: HostType;
    // protocolType: ProtocolType;
    // callbackOnNotification?: (notification: INotification) => void;
}