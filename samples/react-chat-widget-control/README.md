# React-Chat-Widget Control

Sample react app using [Omnichannel Chat SDK](https://github.com/microsoft/omnichannel-chat-sdk) with [React Chat Widget](https://github.com/Wolox/react-chat-widget) as third party web control.

## Scenario Checklist

The sample app includes the following scenarios:

- [x] Start Chat
- [x] End Chat
- [x] Incoming messages
- [x] Incoming image attachments
- [x] Outgoing messages
- [x] Outgoing file attachments
- [ ] Receive typing
- [x] Send typing
- [ ] Receive agent end session event
- [ ] Download transcript
- [ ] Email transcript
- [ ] Pre-Chat Survey
- [x] Reconnect existing chat
- [ ] Escalation to Voice & Video

## Prerequisites
- [React](https://reactjs.org/)
- [React Chat Widget v3.0.5](https://github.com/Wolox/react-chat-widget)

## Getting Started

### 1. Configure a chat widget

If you haven't set up a chat widget yet. Please follow these instructions on:

https://docs.microsoft.com/en-us/dynamics365/omnichannel/administrator/add-chat-widget

### 2. **Copy** the widget snippet code from the **Code snippet** section and save it somewhere. It will be needed later on.

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

### 3. **Copy** of [.env.config](.env.config) to [.env](.env)

```
cp .env.config .env
```

Notice [.env](.env) is in [.gitignore](.gitignore)

### 4. **Add** your chat widget config to [.env](.env)

```
# Chat Widget Config
REACT_APP_orgId='[your-org-id]'
REACT_APP_orgUrl='[your-org-url]'
REACT_APP_widgetId='[your-app-id]'
```

### 5. Install the project with `yarn install` and run the application with `yarn start`