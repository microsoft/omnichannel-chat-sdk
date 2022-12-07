export default class AMSEndpoints {
    public static readonly rootDomain = "teams.microsoft.com";
    public static readonly uploadImagePattern = /v1\/objects\/(.+-.+-.+-.+)\/content\/imgpsh/;
    public static readonly getImageViewStatusPattern = /v1\/objects\/(.+-.+-.+-.+)\/views\/imgpsh_fullsize_anim\/status/;
    public static readonly getImageViewPattern = /v1\/objects\/(.+-.+-.+-.+)\/views\/imgpsh_fullsize_anim/;
}