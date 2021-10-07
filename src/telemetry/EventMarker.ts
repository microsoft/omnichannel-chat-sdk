export const startEvent = (event: string): string => {
    return `${event}Started`;
}

export const completeEvent = (event: string): string => {
    return `${event}Completed`;
}

export const failEvent = (event: string): string => {
    return `${event}Failed`;
}