# Troubleshooting Guide

This guide is intended to help users to get guidance and help on troubleshooting before reporting it's an issue.

## How To
- [Determine if it's an Omnichannel Chat SDK concern](#determine-if-its-an-omnichannel-chat-sdk-concern)
- [Debugging your application](#debugging-your-application)
- [Determine the version of ChatSDK installed](#determine-the-version-of-chatsdk-installed)
  - [Using command-line](#using-command-line)
  - [In console panel of Web Developer Tools](#in-console-panel-of-web-developer-tools)

## Determine if it's an Omnichannel Chat SDK concern

1. Check if chat works with our out-of-the-box (OOB) chat widget.
    1. It may be a **misconfiguration** if chat does not work in OOB chat widget.
        1. You can follow this [link](https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-live-chat) to configure a chat widget.
1. Check if issue is reproducible in our [sample apps](samples/)
    1. You can connect to your chat widget with this [link](https://aka.ms/omnichannel-chat-sdk/botframework-webchat-control) and by following these steps:

        1. **Copy** the widget snippet code from the **Code snippet** section and save it somewhere. It will be needed later on.

            It should look similar to this:

            ```html
            <script
                id="Microsoft_Omnichannel_LCWidget"
                src="[your-src]"
                data-app-id="[your-app-id]"
                data-org-id="[your-org-id]"
                data-org-url="[your-org-url]"
            >
            </script>
            ```

        1. **Update** the URL and reload the page.

            It should look similar to this:

            <pre>
                https://aka.ms/omnichannel-chat-sdk/botframework-webchat-control?debug=true&orgId=<b>[your-org-id]</b>&orgUrl=<b>[your-org-url]</b>&widgetId=<b>[your-app-id]</b>
            </pre>

        1. Take a look in the developer `console` and see if there's any errors.
            1. You can filter logs by
                - `error`
                - `failed`
                - `failScenario`

            and see if there's any results from these filters.

        1. Take a look in the `network activity` and see if there's any failures.

If the issue is not reproducible in OOB chat widget or any of the sample apps, it could be possible that's an `implementation` issue.

## Debugging your application

1. Enable `debug` mode in your app

    You can enable `debug` mode with the SDK to investigate as follow:

    ```js
    const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
    chatSDK.setDebug(true);

    // ...

    await chatSDK.initialize();
    ```

1. Investigate via developer `console`
    1. You can filter logs by
        - `error`
        - `failed`
        - `failScenario`

    and see if there's any results from these filters.

1. Investigate via `network activity`
    1. You can check in the `network activity` if there's any failures


## Determine the version of ChatSDK installed

### Using command-line

1. Run `npm list @microsoft/omnichannel-chat-sdk` on the command-line

### In console panel of Web Developer Tools

1. Enable `debug` mode

    ```js
    const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
    chatSDK.setDebug(true);

    // ...

    await chatSDK.initialize();
    ```

1. In the developer `console`, filter logs by `occhatsdk_events`

1. Expand the `properties` property, then look for `ChatSDKVersion`


