import createFormatIngressTagsMiddleware from "../../../src/external/ACSAdapter/createFormatIngressTagsMiddleware";

describe('createFormatIngressTagsMiddleware', () => {
    it('createFormatIngressTagsMiddleware should call next if activity has no tags', () => {
        const next = jest.fn();
        const activity = {};

        createFormatIngressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createFormatIngressTagsMiddleware should convert tags in string format to array', () => {
        const next = jest.fn();
        const activity = {
            channelData: {
                tags: 'foo,bar'
            }
        };

        const expectedActivity = {
            channelData: {
                tags: activity.channelData.tags.split(',')
            }
        }

        createFormatIngressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(expectedActivity);
    });

    it('createFormatIngressTagsMiddleware should call next if tags is in array format', () => {
        const next = jest.fn();
        const activity = {
            channelData: {
                tags: ['foo', 'bar']
            }
        };

        createFormatIngressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createFormatIngressTagsMiddleware should convert tags in string format to JSON', () => {
        const next = jest.fn();
        const jsonData = {
            'type': 'type',
            'context': {
                'foo': 'foo',
                'bar': 'bar'
            }
        }

        const activity = {
            channelData: {
                tags: JSON.stringify(jsonData)
            }
        };

        const expectedActivity = {
            channelData: {
                tags: JSON.parse(activity.channelData.tags)
            }
        }

        createFormatIngressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(expectedActivity);
    });
})