import { ConfigurationManager } from "../../utils/transformLiveChatConfig";

const createTypingIndicatorMiddleware = (sendTypingEvent = () => {}) => {
    console.log('[createTypingIndicatorMiddleware]');

    const typingIndicatorMiddleware = () => (next: any) => (card: any) => {
        console.log(`%c [typingIndicatorMiddleware]`, "background: #2266e3; color: #fff");
        console.log(card);

        const {
            activeTyping,
            visible
        } = card;

        if (!activeTyping || (ConfigurationManager.liveChatVersion === 1 && !visible)) {
            return null;
        }

        const typers = Object.keys(activeTyping).map(key => activeTyping[key]);
        const typingUser = typers.filter((typer) => typer.role === 'user');

        // Send typing on user typing
        if (typingUser.length && ConfigurationManager.liveChatVersion === 2 && !visible) {
            sendTypingEvent();
            return null;
        }

        return (
            typers && typers.length > 0 && (
                <div className='webchat__typingIndicator'>
                    <div className='bubble' style={{ background: '#2266e3' }}></div>
                    <div className='bubble' style={{ background: '#2266e3' }}></div>
                    <div className='bubble' style={{ background: '#2266e3' }}></div>
                    <div> {`${typers[0].name || 'Agent'} is typing...`} </div>
                </div>
            )
        );
    }

    return typingIndicatorMiddleware;
}

export default createTypingIndicatorMiddleware;