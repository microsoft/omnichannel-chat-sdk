import AriaTelemetry from '../../src/telemetry/AriaTelemetry';

describe('AriaTelemetry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('AriaTelemetry.disable() have telemetry enabled by default', () => {
        jest.spyOn(AriaTelemetry, 'disable');

        expect((AriaTelemetry as any)._disable).toBe(false);
    });

    it('AriaTelemetry.disable() should disable telemetry', () => {
        AriaTelemetry.disable();
        expect((AriaTelemetry as any)._disable).toBe(true);
    });
});