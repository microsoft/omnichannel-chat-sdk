import { ChatMessageEditedEvent, ChatMessageReceivedEvent } from "@azure/communication-chat";

import { PrintableMessage } from "./types/PrintableMessageType";
import { messageContentMetadata } from "../utilities";

export class WebSocketMessagePrinter {

    static printify(event: ChatMessageReceivedEvent | ChatMessageEditedEvent): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (event) {
            result.id = event.id;
            result.tags = event?.metadata?.tags ? event.metadata.tags.replace(/"/g, "").split(",").filter((tag: string) => tag.length > 0) : [];
            result.bot = event?.metadata?.tags?.includes('public') ? false : true;
            result.card = event?.message?.includes('application/vnd.microsoft.card.adaptive');
            if (!result.card && event?.message) {
                result.content = messageContentMetadata(event?.message);
            }
            result.created = event.createdOn;
        }
        return result;
    }
}
