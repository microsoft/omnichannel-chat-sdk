export type PrintableMessage = {
    id: string;
    bot: boolean;
    tags?: string[];
    card: boolean;
    content: string;
    created?: Date
};
