/**
 * @jest-environment node
 */

import { Role } from "../../src/core/messaging/OmnichannelMessage";
import { getRuntimeId, isNotEmpty } from "../../src/utils/utilities";
import { isClientIdNotFoundErrorMessage, isCustomerMessage, isSystemMessage, getMessageRole} from "../../src/utils/utilities";

/* eslint-disable @typescript-eslint/no-var-requires */
const { MessageType } = require("../../src");

describe('Utilities', () => {

    beforeEach(() => {
        jest.resetModules();
    }
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('utilities.isSystemMessage() should return true if contains "system" tags', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['system']
            }
        }

        expect(isSystemMessage(message)).toBe(true);
    });

    it('utilities.isSystemMessage() should return false if DOES NOT contain "system" tags', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['random']
            }
        }

        expect(isSystemMessage(message)).toBe(false);
    });

    it('utilities.isSystemMessage() should not break if `properties.tags` property does not exist', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {}
        }

        const result = isSystemMessage(message);
        expect(result).toBeDefined();

    });

    it('utilities.isCustomerMessage() should return true if sender id contains "contacts/8:"', () => {
        const message = {
            content: 'sample',
            sender: {
                id: 'https://{host}/v1/users/ME/contacts/8:{uuid}'
            }
        }

        expect(isCustomerMessage(message)).toBe(true);
    });

    it('utilities.isCustomerMessage() should return false if sender id DOES NOT contain "contacts/8:"', () => {
        const message = {
            content: 'sample',
            sender: {
                id: 'https://{host}/v1/users/ME/contacts/28:{uuid}'
            }
        }

        expect(isCustomerMessage(message)).toBe(false);
    });

    it('utilities.isClientIdNotFoundErrorMessage() should return true if error has UserId Not Found error', () => {
        const error = {
            response: {
                status: 401,
                headers: {
                    message: "UserId not found"
                }
            }
        }

        expect(isClientIdNotFoundErrorMessage(error)).toBe(true);
    });

    it('utilities.isClientIdNotFoundErrorMessage() should return false if error has unknown error message', () => {
        const error = {
            response: {
                status: 401,
                headers: {
                    message: "test"
                }
            }
        }

        expect(isClientIdNotFoundErrorMessage(error)).toBe(false);
    });

    it('utilities.isClientIdNotFoundErrorMessage() should return false if error has other error code', () => {
        const error = {
            response: {
                status: 403,
                headers: {
                    message: "test"
                }
            }
        }

        expect(isClientIdNotFoundErrorMessage(error)).toBe(false);
    });
    it("isNotEmpty should return true if the value is not null, undefined or empty string", () => {
        const value = "test";
        expect(isNotEmpty(value)).toBe(true);
    });

    it("isNotEmpty should return false if the value is null", () => {
        const value = null;
        expect(isNotEmpty(value)).toBe(false);
    });

    it("getRuntimeId should return externalRuntimeId if it is not empty", () => {
        const externalRuntimeId = "test";
        expect(getRuntimeId(externalRuntimeId)).toBe(externalRuntimeId);
    });

    it("getRuntimeId should return a new uuid if externalRuntimeId is empty", () => {
        const externalRuntimeId = null;
        expect(getRuntimeId(externalRuntimeId)).not.toBe(externalRuntimeId);
    });

    it('utilities.getMessageRole() should return `system` if message is a system message', () => {
        const message = {
            content: 'system content',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['system']
            }
        };
        expect(getMessageRole(message)).toBe(Role.System);
    });

    it('utilities.getMessageRole() should return `agent` if message is a live agent message', () => {
        const message = {
            content: 'test content',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['public']
            }
        };
        expect(getMessageRole(message)).toBe(Role.Agent);
    });

    it('utilities.getMessageRole() should return `user` if message is customer message', () => {
        const message = {
            content: 'test content',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['ChannelId-lcw,FromCustomer']
            },
            sender: {
                id: 'https://{host}/v1/users/ME/contacts/8:{uuid}'
            }
        };
        expect(getMessageRole(message)).toBe(Role.User);
    });

    it('utilities.getMessageRole() should return `unknown` for random tags', () => {
        const message = {
            messageType: MessageType.UserMessage,
            properties: {
                tags: ''
            },
            tags: ['random']
        };

        expect(getMessageRole(message)).toBe(Role.Unknown);
    });

    it('utilities.getMessageRole() should return `bot` if message.tags is an empty', () => {
        const message = {
            messageType: MessageType.UserMessage,
            properties: {
                tags: ''
            },
            tags: []
        };

        expect(getMessageRole(message)).toBe(Role.Bot);
    });

    it('utilities.getMessageRole() should not break if `properties.tags` property does not exist', () => {
        const message = {
            content: 'test',
            messageType: MessageType.UserMessage,
            properties: {}
        }

        const result = getMessageRole(message);
        expect(result).toBeDefined();

    });
});