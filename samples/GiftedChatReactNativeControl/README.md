# Gifted Chat React Native Control

Sample react-native app using [Omnichannel Chat SDK](https://github.com/microsoft/omnichannel-chat-sdk) with [gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat) as third party react-native control.

## Scenario Checklist

The sample app includes the following scenarios:

- [x] Start Chat
- [x] End Chat
- [x] Incoming messages
- [x] Incoming image attachments
- [ ] Incoming file attachments of other supported formats
- [x] Outgoing messages
- [x] Outgoing file attachments
- [x] Receive typing
- [x] Send typing
- [x] Receive agent end session event
- [ ] Download transcript
- [ ] Email transcript
- [ ] Pre-Chat Survey

## Prerequisites
- [React Native v0.61.5](https://reactnative.dev/)

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
orgId='[your-org-id]'
orgUrl='[your-org-url]'
widgetId='[your-app-id]'
```

### 5. Install the project with `npm install` and run the application with `npm run android` or `npm run ios`