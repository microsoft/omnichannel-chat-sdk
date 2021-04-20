import AriaTelemetry from '../../src/telemetry/AriaTelemetry';
import ScenarioMarker from '../../src/telemetry/ScenarioMarker';
import * as settings from '../../src/config/settings';

describe('ScenarioMarker', () => {
    (settings as any).ariaTelemetryKey = '';
    const omnichannelConfig = {
        orgId: 'orgId',
        orgUrl: 'orgUrl',
        widgetId: 'widgetId'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        (AriaTelemetry as any)._disable = false;
        (AriaTelemetry as any)._logger = {
            logEvent: jest.fn()
        };
    });

    it('ScenarioMarker.startScenario() should create StopWatch & call telemetry.info()', () => {
        const scenario: any = 'Scenario';
        const scenarioMarker: any = new ScenarioMarker(omnichannelConfig);
        scenarioMarker.telemetry = {
            info: jest.fn(),
            error: jest.fn()
        }

        scenarioMarker.startScenario(scenario);
        const stopWatch = scenarioMarker.telemetryEvents.get(scenario);

        expect(scenarioMarker.telemetryEvents.has(scenario)).toBe(true);
        expect(scenarioMarker.telemetryEvents.size).toBe(1);
        expect(scenarioMarker.telemetry.info).toHaveBeenCalledTimes(1);
        expect(stopWatch).not.toBe(undefined);
    });

    it('ScenarioMarker.failScenario() should remove StopWatch & call telemetry.error()', () => {
        const scenario: any = 'Scenario';
        const scenarioMarker: any = new ScenarioMarker(omnichannelConfig);
        scenarioMarker.telemetry = {
            info: jest.fn(),
            error: jest.fn()
        }

        scenarioMarker.startScenario(scenario);
        scenarioMarker.failScenario(scenario);
        const stopWatch = scenarioMarker.telemetryEvents.get(scenario);

        expect(scenarioMarker.telemetryEvents.has(scenario)).toBe(false);
        expect(scenarioMarker.telemetryEvents.size).toBe(0);
        expect(scenarioMarker.telemetry.error).toHaveBeenCalledTimes(1);
        expect(stopWatch).toBe(undefined);
    });

    it('ScenarioMarker.completeScenario() should remove StopWatch & call telemetry.info()', () => {
        const scenario: any = 'Scenario';
        const scenarioMarker: any = new ScenarioMarker(omnichannelConfig);
        scenarioMarker.telemetry = {
            info: jest.fn(),
            error: jest.fn()
        }

        scenarioMarker.startScenario(scenario);
        scenarioMarker.completeScenario(scenario);
        const stopWatch = scenarioMarker.telemetryEvents.get(scenario);

        expect(scenarioMarker.telemetryEvents.has(scenario)).toBe(false);
        expect(scenarioMarker.telemetryEvents.size).toBe(0);
        expect(scenarioMarker.telemetry.info).toHaveBeenCalledTimes(2);
        expect(stopWatch).toBe(undefined);
    });

    it('ScenarioMarker.failScenario(event) without calling ScenarioMarker.startScenario(event) before should send a warning message', () => {
        const scenario: any = 'Scenario';
        const scenarioMarker: any = new ScenarioMarker(omnichannelConfig);
        scenarioMarker.telemetry = {
            info: jest.fn(),
            error: jest.fn()
        }

        spyOn(console, 'warn');
        scenarioMarker.failScenario(scenario);
        expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('ScenarioMarker.completeScenario(event) without calling ScenarioMarker.startScenario(event) before should send a warning message', () => {
        const scenario: any = 'Scenario';
        const scenarioMarker: any = new ScenarioMarker(omnichannelConfig);
        scenarioMarker.telemetry = {
            info: jest.fn(),
            error: jest.fn()
        }

        spyOn(console, 'warn');
        scenarioMarker.completeScenario(scenario);
        expect(console.warn).toHaveBeenCalledTimes(1);
    });
});