import { orgId, orgUrl, widgetId } from '@env';

const fetchOmnichannelConfig = () => {
    const omnichannelConfig = { // Default config
        orgId: orgId || '',
        orgUrl: orgUrl || '',
        widgetId: widgetId || ''
    };

    return omnichannelConfig;
}

export default fetchOmnichannelConfig;