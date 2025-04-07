import { ChatMessage, ChatMessageEditedEvent, ChatMessageReceivedEvent } from "@azure/communication-chat";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import OmnichannelMessage from "../../../core/messaging/OmnichannelMessage";

export type MessageType = OmnichannelMessage | ChatMessage | ChatMessageReceivedEvent | ChatMessageEditedEvent | IMessage;
