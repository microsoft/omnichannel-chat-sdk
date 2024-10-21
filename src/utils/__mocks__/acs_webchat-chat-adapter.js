
const acs_webchat_chat_adapter = jest.createMockFromModule('acs_webchat-chat-adapter');

acs_webchat_chat_adapter.createACSAdapter = () => {
    return {
    end : () => {
        console.log("end");
    },
    fileManager : {
        fileScanner : {
            end : () => {
                console.log("file scanner end");
            },
        },
    }
};

};
module.exports = acs_webchat_chat_adapter;