/* eslint-disable @typescript-eslint/no-explicit-any */

import { ACSAdapterLogger } from "../utils/loggers";
import AMSFileManager from "../external/ACSAdapter/AMSFileManager";
import { ChatClient } from "@azure/communication-chat";

type AdapterEgressIngressFunction = (arg: any) => Promise<any>;
type GetStateFunction = (name: string) => unknown;
type SetStateFunction = (name: string, value: unknown) => void;

export interface IChatAdapter {
	egress: AdapterEgressIngressFunction;
	ingress: AdapterEgressIngressFunction;
	getState: GetStateFunction;
	setState: SetStateFunction;
	end : () => void;
	fileManager: AMSFileManager;
}

export type MiddlewareFunction = (adapter: IChatAdapter) => (next: MiddlewareFunction) => (activity: any) => void;

export interface IAdapterInitFeatureOption {
    // Whether to enable adaptive card payload in adapter (payload in JSON string)
    enableAdaptiveCards: boolean;
    // Whether to enable chat thread member join/leave notification
    enableThreadMemberUpdateNotification: boolean;
    // Whether to remove user on browser close event
    enableLeaveThreadOnWindowClosed: boolean;
    // Whether to send sender display name in typing notification
    enableSenderDisplayNameInTypingNotification: boolean;
    // allows to add additional features
    [key: string]: any;
}

interface NotifyErrorEventType {
    notifyErrorEvent: () => void;
}

export type AdapterCreator = (
	token: string,
	acsUserId: string,
	threadId: string,
	acsEnvUrl: string,
	fileManager: AMSFileManager,
	pollingInterval: number,
	errorEventSubscriber: NotifyErrorEventType,
	displayName: string,
	chatClient: ChatClient,
	logger: ACSAdapterLogger,
	featureOption: IAdapterInitFeatureOption) => IChatAdapter;