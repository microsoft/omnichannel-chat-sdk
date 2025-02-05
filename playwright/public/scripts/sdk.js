const run = async () => {

    const omnichannelConfig = {
        orgId: "ce4db5f6-1c20-ee11-a66d-000d3a0a02f3",
        orgUrl: "https://m-ce4db5f6-1c20-ee11-a66d-000d3a0a02f3.ca.omnichannelengagementhub.com",
        widgetId: "ddb676f7-9881-4c0b-aedf-e8b309118731"
    }

    const { sleep } = window;
    const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
    const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

    await chatSDK.initialize();

    await chatSDK.startChat();

    console.log("Chat started");

    await chatSDK.sendMessage({"content":"hi"});

    const msg = await chatSDK.getMessages();

    console.table(msg);

    const messages = [];

    chatSDK.onNewMessage((message) => {
        messages.push(message);
    });

    await sleep(30000);

    await chatSDK.endChat();

    console.table(messages);

};

run();