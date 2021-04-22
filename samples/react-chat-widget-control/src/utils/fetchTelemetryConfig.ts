const fetchTelemetryConfig = () => {
    const telemetryConfig = {
        telemetry: {
            disable: true,
            ariaTelemetryKey: ''
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('telemetry') !== null) {
        telemetryConfig.telemetry.disable = urlParams.get('telemetry') == 'true'? false: true;
    }

    if (urlParams.get('ariaTelemetryKey') !== null) {
        telemetryConfig.telemetry.ariaTelemetryKey = urlParams.get('ariaTelemetryKey') || '';
    }

    return telemetryConfig;
}

export default fetchTelemetryConfig;