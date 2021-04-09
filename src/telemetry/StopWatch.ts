class StopWatch {
    private timeStart?: number;

    public start(): void {
        this.timeStart = new Date().getTime();
    }

    public stop(): number {
        return new Date().getTime() - this.timeStart!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
}

export default StopWatch;