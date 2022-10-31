# Single Sign-On For Bots

> ❗If you're using Azure Bot Service, please ensure that you've met the following prerequisites:
> ### Using .NET
> - Microsoft.Bot.Builder.Dialogs **v4.17.2** at minimum
> - Microsoft.Bot.Builder.Integration.AspNet.Core **v4.17.2** at minimum

## Using Bot Framework Web Chat Control

```js
const shareObservable = (observable) => {
    let observers = [];
    let subscription;

    return new Observable(observer => {
        if (!subscription) {
            subscription = observable.subscribe({
                complete() {
                    observers.forEach(observer => observer.complete());
                },
                error(err) {
                    observers.forEach(observer => observer.error(err));
                },
                next(value) {
                    observers.forEach(observer => observer.next(value));
                }
            });
        }

        observers.push(observer);

        return () => {
            observers = observers.filter(o => o !== observer);
            if (!observers.length) {
                subscription.unsubscribe();
                subscription = null;
            }
        };
    });
};

class DefaultSubscriber {
    applicable(activity) {
        return true;
    }

    async next(activity) {
        this.observer.next(activity);
        return false;
    }
}

const supportedSignInCardContentTypes = ["application/vnd.microsoft.card.signin", "application/vnd.microsoft.card.oauth"];
const botOauthUrlRegex = /[\S]+.botframework.com\/api\/oauth\/signin\?signin=([\S]+)/;
const signInIds = [];
class BotAuthSubscriber {
    applicable(activity) {
        return activity && activity.attachments && activity.attachments.length && activity.attachments[0] && supportedSignInCardContentTypes.indexOf(activity.attachments[0].contentType) >= 0;
    }

    async apply(activity) {
        this.observer.next(false); // Initially hides sign-in card

        const attachment = activity.attachments[0];
        const signInUrl = attachment.content.buttons[0].value;

        // Extracts Sign In Id
        const result = botOauthUrlRegex.exec(signInUrl);
        const signInId = result[1];

        if (!signInId) {
            return;
        }

        // Ignore authenticated sign-in cards
        if (signInIds.includes(signInId)) {
            return;
        }

        // Extracts Bot Token URL
        let botTokenUrl = undefined;
        if (attachment && attachment.content && attachment.content.tokenPostResource && attachment.content.tokenPostResource.sasUrl) {
            botTokenUrl = attachment.content.tokenPostResource.sasUrl;
        }

        if (!botTokenUrl) {
            return;
        }

        const data = {
            token: this.authToken
        };

        // Posts Auth Token to Bot directly
        const payload = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data);
        }

        try {
            const botAuthResponse = await fetch(botTokenUrl, payload);

            // Sign in through Bot is successful
            if (botAuthResponse.status === 200) {
                signInIds.push(signInId); // Track authenticated sign-in cards
                return;
            }

            // User already signed in
            if (botAuthResponse.status === 404 || botAuthResponse.status === 202) {
                return;
            }
        } catch {

        }

        return activity; // Returns sign-in card by default
    }

    async next(activity) {
        if (this.applicable(activity)) {
            return await this.apply(activity);
        }

        return activity;
    }
}

const createChatAdapterShim = (chatAdapter, subscribers = []) => {
    const internalSubscribers = [];
    const defaultSubscribers = [new DefaultSubscriber()];
    const chatAdapterShim = {
        ...chatAdapter,
        activity$: shareObservable(
          new Observable((observer) => {
            const abortController = new AbortController();
            (async () => {
              try {
                for await (let activity of chatAdapter.activities({ signal: abortController.signal })) {
                  for (const subscriber of [...internalSubscribers, ...subscribers, ...defaultSubscribers]) {
                    subscriber.observer = observer;
                    activity = await subscriber.next(activity);
                    if (!activity) {
                        break;
                    }
                  }
                }
                observer.complete();
              } catch (error) {
                observer.error(error);
              }
            })();

            return () => {
                abortController.abort();
            }
          })
        )
    }

    return chatAdapterShim;
};

// ...

const getAuthToken = async () => {
    const response = await fetch("http://contosohelp.com/token");
    if (response.ok) {
        return await response.text();
    } else {
        return null
    }
};

// Extract authToken
const authToken = await getAuthToken();

const chatSDKConfig = {
    getAuthToken: async () => authToken // Using Authenticated Chat
};

const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
await chatSDK.initialize();

await chatSDK.startChat();

let chatAdapter = await chatSDK.createChatAdapter();

// Create BotAuthSubscriber
const botAuthSubscriber = new BotAuthSubscriber();
botAuthSubscriber.authToken = authToken;

// Create ChatAdapterShim
chatAdapter = createChatAdapterShim(chatAdapter, [botAuthSubscriber]); // Modify default adapter

// ...

return <ReactWebChat
    {...props}
    directLine={chatAdapter}
/>
```