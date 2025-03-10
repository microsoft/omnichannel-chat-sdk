/**
 * This is a test JS file to test the SDK simulating an scenario, this is to test the SDK locally
 *  1.- Enable the JS in the ../index.html file
 *  2.- go to server and run `node app.js`
 *  3.- go to localhost:8080 and open the console
 *
 * important : index.html wont run locally in the browser without a server behind , because there are security validations for AMS iframe.
 */

const run = async () => {

    // cpsBotId if needed, add it here 
    const omnichannelConfig = {
        orgId: "",
        orgUrl: "",
        widgetId: "9046913e-aefb-4230-bd5e-9f16284f7b81"
    };

    const { sleep } = window;
    const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
    const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

    await chatSDK.initialize();

    await chatSDK.startChat();

    console.table(await chatSDK.getMessages());

    const messages = [];

    try {
        chatSDK.onNewMessage((message) => {
            console.log("*************** New Message Alert ************************", JSON.stringify(message));

            messages.push(message);
        }, { rehydrate: true });
    } catch (err) {
        runtimeContext.errorMessage = `${err.message}`;
        runtimeContext.errorObject = `${err}`;
    }
    await sleep(30000);

    await chatSDK.sendMessage({ "content": "hi" });
    await sleep(30000);
    console.log("*************** ALL MESSAGES ************************");
    console.table(await chatSDK.getMessages());


    console.log("*************** Pushed Messages ************************");
    console.table(messages);
    console.log("*************** ENDING CHAT MID FLY ************************");

    await sleep(10000);
    await chatSDK.endChat();


    await sleep(60000);
    console.log("*************** ALL MESSAGES BEFORE END CHAT ************************");
    console.table(await chatSDK.getMessages());

};

run();