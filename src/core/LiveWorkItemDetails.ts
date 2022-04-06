import LiveWorkItemState from "./LiveWorkItemState";

export default interface LiveWorkItemDetails {
    state: LiveWorkItemState,
    agentAcceptedOn?: string,
    conversationId: string,
    canRenderPostChat?: string,
    participantType?: string
}