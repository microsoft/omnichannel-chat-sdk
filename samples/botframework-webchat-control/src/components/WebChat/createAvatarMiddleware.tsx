import { AlertCircle } from "react-feather";

const getInitial = (text: string): string => {
    if (text) {
        const initials = text.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '');
        if (initials.length > 1) {
            return initials.substring(0, 2).toUpperCase();
        } else {
            return text.substring(0, 2).toUpperCase();
        }
    }
    return "";
}

const createAvatarMiddleware = () => {
    console.log('[createAvatarMiddleware]');

    // Middleware to display avatar
    const avatarMiddleware = () => (next: any) => (card: any) => {
        console.log(`[AvatarMiddleware]`);
        const {
            activity: {
                channelData: {
                    tags
                },
                from: {
                    name
                },
                text
            },
            fromUser
        } = card;

        console.log(card);
        // System message
        if (tags && tags.includes('system')) {
            console.log(`[AvatarMiddleware][Message][System] ${text}`);

            // Display alert icon
            return (
                <div>
                    <AlertCircle color='red' size={20}/>
                </div>
            )
        }

        if (fromUser === undefined || fromUser === null) {
            return false; // Do not display avatar on unknown message
        }

        // Display avatar on agent/customer messages

        // Agent message
        if (!fromUser) {
            console.log(`[AvatarMiddleware][Message][Agent] ${text}`);
            return (
                <div className='webchat__avatar'>
                    <p className='webchat__avatar_initials'> {getInitial(name)} </p>
                </div>
            )
        }

        // Customer message
        if (fromUser) {
            console.log(`[AvatarMiddleware][Message][Customer] ${text}`);
            return (
                <div className='webchat__avatar'>
                    <p className='webchat__avatar_initials'> {getInitial(name) || 'CU'}  </p>
                </div>
            )
        }

        return next(card); // Default Behavior
    }

    return avatarMiddleware;
}

export default createAvatarMiddleware;