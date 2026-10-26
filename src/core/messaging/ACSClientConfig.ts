import { ChatTokenUnauthorizedRecovery } from "../../utils/chatTokenUnauthorizedRecovery";

export default interface ACSClientConfig {
    token: string;
    environmentUrl: string;
    tokenRefresher?: () => Promise<string>;
    /** Recovers chat requests that fail with 401 while the token has not expired. */
    unauthorizedRecovery?: ChatTokenUnauthorizedRecovery;
}