export class ACSConversation {
    constructor() {

    }

    public async getMessages() {

    }

    public async getMembers() {

    }

    public async registerOnNewMessage(): Promise<void> {

    }

    public async registerOnThreadUpdate(): Promise<void> {

    }

    public async sendMessage(): Promise<void> {

    }

    public async sendFileMessage(): Promise<void> {

    }

    public async sendFileData():  Promise<void> {

    }

    public async uploadFile() {

    }

    public async downloadFile() {

    }

    public async disconnect(): Promise<void> {

    }
}

class ACSClient {
    constructor() {

    }

    public async initialize(sessionInfo: any): Promise<void> {

    }

    public async joinConversation(): Promise<ACSConversation> {
        const conversation = new ACSConversation();
        return conversation;
    }
}

export default ACSClient;