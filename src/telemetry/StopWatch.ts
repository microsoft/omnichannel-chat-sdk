class StopWatch {
    private timeStart?: number;

    public start() {
        this.timeStart = new Date().getTime();
    }

    public stop(): number {
        return new Date().getTime() - this.timeStart!;
    }
}

export default StopWatch;