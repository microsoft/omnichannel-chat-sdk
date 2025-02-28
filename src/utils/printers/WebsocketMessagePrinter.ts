import { ChatMessageEditedEvent, ChatMessageReceivedEvent } from "@azure/communication-chat";

import { PrintableMessage } from "./types/PrintableMessageType";

export class WebSocketMessagePrinter {

    static printify(event: ChatMessageReceivedEvent | ChatMessageEditedEvent): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (event) {
            result.id = event.id;
            result.tags = [];
            result.isAdaptiveCard = event?.message?.includes('application/vnd.microsoft.card.adaptive');
            if (!result.isAdaptiveCard) {
                result.content = this.messageContentMetadata(event?.message);
            }
        }
        console.log('[ACSClient][WebSocketMessagePrinter] Message received ::; WS => ', JSON.stringify(result));
        return result;
    }

    static messageContentMetadata(message: string | undefined): string {
        const first = message?.charAt(0);
        const last = message?.charAt(message?.length - 1);
        const size = message?.length;
        return `${first}${size}${last}`;
    }

}
