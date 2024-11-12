import { AdapterErrorEvent } from "./AdapterErrorEvent";

export interface IErrorEventSubscriber {
	notifyErrorEvent(adapterErrorEvent: AdapterErrorEvent): void;
}