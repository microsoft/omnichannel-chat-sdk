# Streaming React Sample

A React + Webpack 5 sample app exercising `onStreamingMessage` and `onNewMessage` against a real Microsoft Contact Center tenant.

**Multi-customer demo mode:** customers paste their widget snippet from the OC admin app, the app extracts the org URL / org ID / widget ID automatically, and connects to their tenant. Anonymous chat only.

## What you see when you run it

### Setup screen (initial)

- **Step 1 · Paste your widget snippet:** textarea where customers paste the `<script>` tag from their OC admin app.
- **Step 2 · Verify extracted values:** live preview of the parsed `widgetId` / `orgId` / `orgUrl` with checkmarks. Inline error if the snippet is malformed or missing fields.
- **Step 3 · Allow this origin in your widget config:** prominent guidance + copy-to-clipboard button for the current page's origin. Customers must add this to their widget's allowed-domains list before the chat can connect.
- **Remember in this browser** checkbox for localStorage persistence.
- **Clear Saved Customer** button (visible if a saved config exists).

### Chat screen (after Start Chat)

Two-pane layout:

- **Top:** Chat bubble UI. User messages right-aligned blue, bot/agent left-aligned gray. Streaming messages render progressively — bubble appears on `start`, content updates with each `streaming` chunk, locks on `final`.
- **Bottom:** Live event log. Color-coded chips: green = `onNewMessage`, blue = `onStreamingMessage`, gray = `sendMessage`, purple = `lifecycle`.

Header controls: **Switch Customer** (back to setup), **Clear Saved Customer** (wipe localStorage), **Start/End Chat**.

### CORS error handling

If the tenant rejects requests because our origin isn't allowlisted, the error banner shows a CORS-specific message with the origin to add — instead of a cryptic "Failed to fetch" error.

## Why this layout for testing streaming

Against a streaming bot, a successful test produces this event sequence:

```
onStreamingMessage:start    msg-abc123
onStreamingMessage:streaming #1 msg-abc123  "Let m"
onStreamingMessage:streaming #2 msg-abc123  "Let me che"
onStreamingMessage:streaming #3 msg-abc123  "Let me check that for"
... (more chunks)
onStreamingMessage:final    msg-abc123  (completed)
onNewMessage                msg-abc123  "Let me check that for you. Currently..."
```

Two empirical confirmations:

1. **Risk 1 mitigation works** — `onNewMessage` fires exactly once at the end with the assembled content, so consumers using only `onNewMessage` continue to receive the message.
2. **No dual-fire** — `onNewMessage` should NOT appear during the streaming chunks (only at the end). If it does, ACS is firing both event types and the SDK needs dedup.

For non-streaming bots, the event log shows `onNewMessage` only — confirms backwards compatibility.

## Local development

### 1. Build the SDK

The sample uses `"file:../.."` to install the local SDK build, so build it first:

```bash
cd ../..   # back to omnichannel-chat-sdk root
npm install
npm run build:tsc
```

### 2. Install sample dependencies

```bash
cd samples/streaming-react
npm install
```

### 3. Run the dev server

```bash
npm start
```

Opens on **http://localhost:3000**. The setup screen prompts for a widget snippet — paste yours and follow the on-screen steps.

### 4. Build for production

```bash
npm run build
```

Output goes to `samples/streaming-react/dist/`. This is what you'd deploy to Azure Static Web Apps.

## Deploying to Azure Static Web Apps

The sample is configured to deploy as a static SPA. Follow these steps to get a public URL.

### 1. Create the Static Web App resource

In the Azure portal:

1. **Create a resource → Static Web App.**
2. Pick a subscription, resource group, and a name (e.g., `oc-streaming-demo`).
3. Plan: **Free** (sufficient for demo traffic).
4. Region: any.
5. **Deployment source:** GitHub.
6. Sign in to GitHub and pick the `microsoft/omnichannel-chat-sdk` repo (or your fork).
7. Branch: `poc/acs-streaming-update` (or whichever branch contains this sample).
8. **Build presets:** Custom.
9. **App location:** `samples/streaming-react`
10. **Output location:** `dist`
11. Skip the API location.
12. Click **Review + create**.

Azure will:
- Provision the SWA resource.
- Auto-create a GitHub Actions workflow at `.github/workflows/azure-static-web-apps-<random-suffix>.yml`.
- Inject a deployment token as a GitHub secret.
- Run the first deploy.

### 2. Verify the workflow runs

Once Azure auto-creates the workflow file, push to the branch (or merge a PR) and watch the GitHub Actions run. After it succeeds, your SWA URL (`https://<random-name>.azurestaticapps.net`) serves the app.

### 3. (Optional) Configure a custom domain

In the SWA resource → Custom domains, add your domain. Update the DNS records as instructed by the portal.

### 4. Verify `staticwebapp.config.json` is being picked up

The repo includes `samples/streaming-react/staticwebapp.config.json` which configures SPA fallback routing (any path falls back to `index.html`) and disables aggressive caching. This file is automatically detected at deploy time when it's at the SWA's app root.

## Customer demo flow

When you run the demo for a customer:

1. Send them the SWA URL (e.g., `https://oc-streaming-demo.azurestaticapps.net`).
2. They paste their widget snippet into Step 1.
3. They verify extracted values in Step 2.
4. They add our origin to their widget's allowed domains in their OC admin app (the URL Step 3 displays). **Recommend doing this on a *test* widget config, not production.** The exact navigation is:
   - Customer Service admin center
   - Workstreams → [their workstream] → Chat widget
   - Behaviors → "Allow this widget on the following domains"
5. They come back to the demo and click **Start Chat**.
6. They send messages, watch the event log + bubble UI on the right.

If they're testing a streaming bot, the event log empirically shows the streaming chunks + the post-`final` `onNewMessage` fire-through (Risk 1 mitigation working).

## Architecture notes

- **Runtime config, not build-time:** the original sample read tenant credentials from `process.env` at build time. This version reads them from a textarea at runtime — required for multi-customer hosting where you can't bake credentials into the bundle.
- **Single bubble per message id:** `bubbles` is a `Map<string, BubbleState>`. Both `onNewMessage` and `onStreamingMessage` upsert the same map keyed by message id. This dedups the visible UI even if both events fire for the same message (they can, per the Risk 1 mitigation: streaming chunks fire onStreamingMessage, then the final fires onNewMessage too).
- **Append-only event log:** every SDK event becomes a log entry, never deleted. Reflects the raw protocol behavior.
- **No external state library:** plain React `useState` with `Map`. For a sample, simplicity beats Redux/Zustand.
- **Webpack 5 + Node polyfills:** `node-polyfill-webpack-plugin` provides browser shims for `crypto`/`stream`/`buffer` that `@azure/communication-chat` needs at runtime. Without it, the SDK fails to initialize in the browser.
- **localStorage only:** no server-side state. One config persisted per browser. Use the **Clear Saved Customer** button to wipe.
- **Anonymous chat only:** for demos. Authenticated-chat tenants need a separate auth flow (token endpoint, etc.) which is out of scope for this sample. If you need auth, fork the sample and add a `chatSDKConfig.getAuthToken` callback.

## Common issues

**"Could not parse snippet" on Step 2:** Make sure you copied the entire `<script>` tag including the `data-app-id`, `data-org-id`, and `data-org-url` attributes. The OC admin app sometimes wraps with extra HTML — paste the raw `<script>` tag.

**CORS error on Start Chat:** Your tenant's widget config doesn't allowlist this app's origin. The error banner shows the exact origin to add. Add it in the OC admin app under your widget's "Allow this widget on the following domains" setting.

**`global is not defined` runtime error:** Polyfill plugin not loading. Verify `node-polyfill-webpack-plugin` is in `node_modules` and listed in `webpack.config.js` plugins.

**Two `onNewMessage` events per streaming response:** The SDK currently assumes ACS does not fire `chatMessageReceived` alongside streaming events. If you observe this dual-fire happening for the same message id, document the timing and message ids, then update `ACSConversation.registerOnStreamingMessage` to track fire-through-ed message ids and skip duplicate `onNewMessage` invocations.

**`onNewMessage` doesn't fire at all on a streaming response:** The backwards-compat fire-through isn't working. Verify the SDK build is up to date (`npm run build:tsc` in the SDK root, then re-run `npm install` in `samples/streaming-react/` to refresh the local link).

**Bubble shows but never updates:** SDK initialized but events aren't firing. Check browser DevTools console for ACS connection errors. Most likely a credentials, network, or CORS issue rather than an SDK bug.
