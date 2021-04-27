# Troubleshooting Guide

This guide is intended to help users to get guidance and help on troubleshooting before reporting it's an issue.

## Determine if it's an Omnichannel Chat SDK concern

1. Check if chat works with our out-of-the-box (OOB) chat widget.
    1. It may be a **misconfiguration** if chat does not work in OOB chat widget.
        1. You can follow this [link](https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-live-chat) to configure a chat widget.
1. Check if issue is reproducible in our [sample apps](samples/)
    1. You can connect to your chat widget with this [link](https://inapp.blob.core.windows.net/public/samples/webchat/index.html) and by following these steps:

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
                https://inapp.blob.core.windows.net/public/samples/webchat/index.html?debug=true&orgId=<b>[your-org-id]</b>&orgUrl=<b>[your-org-url]</b>&widgetId=<b>[your-app-id]</b>
            </pre>

        1. Take a look in the developer `console` and see if there's any errors.
            1. You can filter logs by
                - `error`
                - `failed`
                - `failScenario`

            and see if there's any results from these filters.

        1. Take a look in the `network activity` and see if there's any failures.

If the issue is not reproducible in OOB chat widget or any of the sample apps, then it's most likely an `implementation` issue.

## How to debug your application

1. Enable `debug` mode in your app

    You can enable `debug` mode with the SDK to investigate as follow:

    ```js
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.setDebug(true);

        ...

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

