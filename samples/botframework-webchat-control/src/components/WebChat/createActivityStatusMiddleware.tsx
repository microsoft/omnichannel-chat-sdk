enum SendStatus {
    Sending = "sending",
    SendFailed = "send failed",
    Sent = "sent"
}

const isSystemActivity = (card: any) => {
    return card.activity.channelData && card.activity.channelData.tags &&
    card.activity.channelData.tags.includes('system');
}

const isAgentActivity = (card: any) => {
    return card.activity.from.role === 'bot'
}

const isCustomerActivity = (card: any) => {
    return card.activity.from.role === 'user'
}

const createActivityStatusMiddleware = () => {
    const activityStatusMiddleware = () => (next: any) => (card: any) => {
        console.log(`%c [activityStatusMiddleware]`, "background: #238636; color: #fff");
        console.log(card);

        let activityType = '';
        if (isSystemActivity(card)) {
            activityType = 'System';
        } else if (isAgentActivity(card)) {
            activityType = 'Agent';
        } else if (isCustomerActivity(card)) {
            activityType = 'Customer';
        }

        console.log(`%c [activityStatusMiddleware][Message][${activityType}] ${card.activity.text}`, "background: #238636; color: #fff");

        // Custom handler on different send status
        if (card.sendState === SendStatus.Sent) {
            console.log(`%c [activityStatusMiddleware][Message][${activityType}][Status] Sent!`, "background: #238636; color: #fff");
        } else if (card.sendState === SendStatus.Sending) {
            console.log(`%c [activityStatusMiddleware][Message][${activityType}][Status] Sending...`, "background: #238636; color: #fff");
        } else if (card.sendState === SendStatus.SendFailed) {
            console.log(`%c [activityStatusMiddleware][Message][${activityType}][Status] Failed :(`, "background: #238636; color: #fff");
        }
    };

    return activityStatusMiddleware;
  };

  export default createActivityStatusMiddleware;
