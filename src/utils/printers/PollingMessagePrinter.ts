import { ChatMessage } from "@azure/communication-chat";
import { PrintableMessage } from "./types/PrintableMessageType";
import { SupportedAdaptiveCards } from "./interfaces/SupportedAdaptiveCards";
import { messageContentMetadata } from "../utilities";

export class PollingMessagePrinter {
    static printify(message: ChatMessage): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (message) {
            result.id = message.id;
            result.tags = message && message.metadata?.tags ? message.metadata.tags.replace(/"/g, "").split(",").filter((tag: string) => tag.length > 0) : [];
            result.card = Object.values(SupportedAdaptiveCards).some(type => message?.content?.message?.includes(type));
            result.bot = result.tags?.find((tag: string) => tag === 'public') ? false : true;
            if (!result.card && message?.content?.message) {
                result.content = messageContentMetadata(message.content?.message);
            }
            result.created = message.createdOn;
        }
        return result;
    }
}