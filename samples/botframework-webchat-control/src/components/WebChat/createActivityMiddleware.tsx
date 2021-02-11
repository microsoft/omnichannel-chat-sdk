const createActivityMiddleware = () => {
    console.log('[createActivityMiddleware]');

    // Middleware to customize default activity behavior
    const activityMiddleware = () => (next: any) => (card: any) => {
        console.log(`%c [ActivityMiddleware]`, 'background: #2a9fd4; color: #fff');
        console.log(card);

        if (card.activity) {

            // System message
            if (card.activity.channelData && card.activity.channelData.tags &&
                card.activity.channelData.tags.includes('system')) {
                console.log(`%c [ActivityMiddleware][Message][System] ${card.activity.text}`, 'background: #2a9fd4; color: #fff');
                return (children: any) => (
                    <div key={card.activity.id} className='system-message'>
                        {next(card)(children)}
                    </div>
                );
            }

            if (card.activity.text === undefined || card.activity.text == null) {
                return next(card);
            }

            // Agent message
            if (card.activity.from.role === 'bot') {
                console.log(`%c [ActivityMiddleware][Message][Agent] ${card.activity.text}`, 'background: #2a9fd4; color: #fff');
            }

            // Customer message
            if (card.activity.from.role === 'user') {
                console.log(`%c [ActivityMiddleware][Message][Customer] ${card.activity.text}`, 'background: #2a9fd4; color: #fff');
            }
        }

        return next(card); // Default Behavior
    }

    return activityMiddleware;
}

export default createActivityMiddleware;