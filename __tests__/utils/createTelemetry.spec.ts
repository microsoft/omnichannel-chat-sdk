import createTelemetry from '../../src/utils/createTelemetry';
import AriaTelemetry from '../../src/telemetry/AriaTelemetry';

describe('createTelemetry', () => {
    it('createTelemetry should return an instance of AriaTelemetry', () => {
        const telemetry: AriaTelemetry = createTelemetry();
        expect(telemetry).toBe(AriaTelemetry);
    });
});