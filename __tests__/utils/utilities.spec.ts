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

    it('utilities.isSystemMessage() should return true if DOES NOT contain "system" tags', () => {
        const message = {
            content: 'sample',
            messageType: MessageType.UserMessage,
            properties: {
                tags: ['random']
            }
        }

        expect(utilities.isSystemMessage(message)).toBe(false);
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
});