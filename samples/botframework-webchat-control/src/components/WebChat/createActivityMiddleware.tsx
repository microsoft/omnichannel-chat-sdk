const createActivityMiddleware = () => {
    console.log('[createActivityMiddleware]');
    const activityMiddleware = () => (next: any) => (card: any) => {
        console.log(`%c [ActivityMiddleware]`, 'background: #2a9fd4; color: #fff');
        console.log(card);
        return next(card); // Default Behaviour
    }

    return activityMiddleware;
}

export default createActivityMiddleware;