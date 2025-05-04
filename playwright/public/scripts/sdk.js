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
        widgetId: ""
    };

    const { sleep } = window;
    const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;
    const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);



    await chatSDK.initialize();

    await chatSDK.startChat();


    const messages = [];

    try {
        await sleep(10000);
        chatSDK.onNewMessage((message) => {
            console.log("*************** New Message Alert ************************", JSON.stringify(message));
            messages.push(message);
        }, { rehydrate: true });
    } catch (err) {
        runtimeContext.errorMessage = `${err.message}`;
        runtimeContext.errorObject = `${err}`;
    }

    console.log("TURN OFFF THE LIGHTS NOW");
    await sleep(10000);

    try {
        console.table(await chatSDK.getMessages());

    } catch (error) {
        console.log("*************** Error getting messages ************************", JSON.stringify(error));

    }

    try {
        console.log("TURN ON THE LIGHTS NOW");

        await sleep(10000);
        await chatSDK.sendMessage({ "content": "hi" });
    } catch (err) {
        console.log("*************** Error sending message ************************", JSON.stringify(err));

    }

    try {
        await sleep(5000);
        console.log("*************** ALL MESSAGES ************************");
        console.table(await chatSDK.getMessages());
    } catch (error) {
        console.log("*************** Error getting messages ************************", JSON.stringify(error));
    }

    try {

        console.log("*************** Pushed Messages ************************");
        console.table(messages);
        console.log("*************** ENDING CHAT MID FLY ************************");
    } catch (error) {
        console.log("*************** Error getting messages ************************", JSON.stringify(error));
    }

    try {
        await sleep(5000);
        await chatSDK.endChat();

        await sleep(5000);
        console.log("*************** ALL MESSAGES BEFORE END CHAT ************************");
        console.table(await chatSDK.getMessages());

    } catch (error) {
        console.log("*************** Error getting messages ************************", JSON.stringify(error));

    }
};

run();