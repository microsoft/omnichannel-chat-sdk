import { getRuntimeId, isNotEmpty } from "../../src/utils/utilities";

/* eslint-disable @typescript-eslint/no-var-requires */
const { MessageType } = require("../../src");
const utilities = require('../../src/utils/utilities');

describe('Utilities', () => {
    it('utilities.isSystemMessage() should return true if contains "system" tags', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['system']
            }
        }

        expect(utilities.isSystemMessage(message)).toBe(true);
    });

    it('utilities.isSystemMessage() should return false if DOES NOT contain "system" tags', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['random']
            }
        }

        expect(utilities.isSystemMessage(message)).toBe(false);
    });

    it('utilities.isSystemMessage() should not break if `properties.tags` property does not exist', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {}
        }

            const result = utilities.isSystemMessage(message);
            expect(result).toBeDefined();

    });

    it('utilities.isCustomerMessage() should return true if sender id contains "contacts/8:"', () => {
        const message = {
            content: 'sample',
            sender: {
                id: 'https://{host}/v1/users/ME/contacts/8:{uuid}'
            }
        }

        expect(utilities.isCustomerMessage(message)).toBe(true);
    });

    it('utilities.isCustomerMessage() should return false if sender id DOES NOT contain "contacts/8:"', () => {
        const message = {
            content: 'sample',
            sender: {
                id: 'https://{host}/v1/users/ME/contacts/28:{uuid}'
            }
        }

        expect(utilities.isCustomerMessage(message)).toBe(false);
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

        expect(utilities.isClientIdNotFoundErrorMessage(error)).toBe(true);
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

        expect(utilities.isClientIdNotFoundErrorMessage(error)).toBe(false);
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

        expect(utilities.isClientIdNotFoundErrorMessage(error)).toBe(false);
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

});