import { ChatMessage } from "@azure/communication-chat";
import { PrintableMessage } from "./types/PrintableMessageType";

export class PollingMessagePrinter {
    static printify(message: ChatMessage): PrintableMessage {
        const result: PrintableMessage = {} as PrintableMessage;
        if (message) {
            result.id = message.id;
            result.tags = message && message.metadata?.tags ? message.metadata.tags.replace(/"/g, "").split(",").filter((tag: string) => tag.length > 0) : [];
            result.isAdaptiveCard = (message?.content?.message?.includes('application/vnd.microsoft.card.adaptive') === true) ? true : false;
            if (!result.isAdaptiveCard && message?.content?.message) {
                result.content = this.messageContentMetadata(message.content?.message);
            }
        }
        console.log('[ACSClient][PollingMessagePrinter] Message received ::; POLLING => ', JSON.stringify(result));
        return result;
    }

    static messageContentMetadata(message: string): string {
        if (!message) {
            return '0';
        }
        const first = message?.charAt(0);
        const last = message?.charAt(message?.length - 1);
        const size = message?.length;
        return `${first}${size}${last}`;
    }
}