import OmnichannelMessage from "../../core/messaging/OmnichannelMessage";
import { PrintableMessage } from "./types/PrintableMessageType";
import { SupportedAdaptiveCards } from "./interfaces/SupportedAdaptiveCards";
import { messageContentMetadata } from "../utilities";

export class OmnichannelMessagePrinter {
    static printify(message: OmnichannelMessage): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (message) {
            result.id = message.id;
            result.tags = message?.tags;
            result.bot = message?.tags?.find((tag: string) => tag === 'public') ? false : true;
            result.card = Object.values(SupportedAdaptiveCards).some(type => message?.content?.includes(type));

            if (!result.card && message?.content) {
                result.content = messageContentMetadata(message?.content);
            }
            result.created = message.timestamp;
        }
        return result;
    }
}