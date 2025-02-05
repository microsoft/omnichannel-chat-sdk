module.exports = {
    createACSAdapter: () => {
        return {
            end: () => {
                console.log("end");
            },
            fileManager: {
                fileScanner: {
                    end: () => {
                        console.log("file scanner end");
                    },
                },
            },
            chatClient: {
                sendMessage: jest.fn(),
                receiveMessage: jest.fn(),
                endChat: jest.fn(),
            },
        };
    },
};