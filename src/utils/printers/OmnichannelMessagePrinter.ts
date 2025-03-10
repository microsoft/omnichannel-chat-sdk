import OmnichannelMessage from "../../core/messaging/OmnichannelMessage";
import { PrintableMessage } from "./types/PrintableMessageType";
import { messageContentMetadata } from "../utilities";

export class OmnichannelMessagePrinter {
    static printify(message: OmnichannelMessage): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (message) {
            result.id = message.id;
            result.tags = message?.tags;
            result.bot = message?.tags?.find((tag: string) => tag === 'public') ? false : true;
            result.card = (message?.content?.includes('application/vnd.microsoft.card.adaptive') === true) ? true : false;
            if (!result.card && message?.content) {
                result.content = messageContentMetadata(message?.content);
            }
            result.created = message.timestamp;
        }
        return result;
    }
}