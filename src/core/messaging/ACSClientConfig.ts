export default interface ACSClientConfig {
    token: string;
    environmentUrl: string;
    tokenRefresher?: () => Promise<string>;
}