import { ChatMessage, ChatMessageEditedEvent, ChatMessageReceivedEvent } from "@azure/communication-chat";

import { MessageType } from "./types/MessageType";
import OmnichannelMessage from "../../core/messaging/OmnichannelMessage";
import { OmnichannelMessagePrinter } from "./OmnichannelMessagePrinter";
import { PollingMessagePrinter } from "./PollingMessagePrinter";
import { PrintableMessage } from "./types/PrintableMessageType";
import { WebSocketMessagePrinter } from "./WebsocketMessagePrinter";

export enum PrinterType {
    Polling = "Polling",
    WebSocket = "WebSocket",
    Omnichannel = "Rest"
}

export class MessagePrinterFactory {
    static getPrinter(printerType: PrinterType) {
        switch (printerType) {
        case PrinterType.Polling:
            return PollingMessagePrinter;
        case PrinterType.WebSocket:
            return WebSocketMessagePrinter;
        case PrinterType.Omnichannel:
            return OmnichannelMessagePrinter;
        default:
            throw new Error("Invalid printer type");
        }

    }

    static printifyMessage = async (message: MessageType, printerType: PrinterType): Promise<PrintableMessage> => {
        const printer = this.getPrinter(printerType);
        switch (printerType) {
        case PrinterType.Polling:
            return (printer as typeof PollingMessagePrinter).printify(message as ChatMessage);
        case PrinterType.WebSocket:
            return (printer as typeof WebSocketMessagePrinter).printify(message as ChatMessageReceivedEvent | ChatMessageEditedEvent);
        case PrinterType.Omnichannel:
            return (printer as typeof OmnichannelMessagePrinter).printify(message as OmnichannelMessage);
        default:
            throw new Error("Invalid printer type");
        }
    }
}