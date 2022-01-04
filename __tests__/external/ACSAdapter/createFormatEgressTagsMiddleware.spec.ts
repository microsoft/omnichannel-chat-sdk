import createFormatEgressTagsMiddleware from "../../../src/external/ACSAdapter/createFormatEgressTagsMiddleware";

describe('createFormatEgressTagsMiddleware', () => {
    it('createFormatEgressTagsMiddleware should call next if activity has no tags', () => {
        const next = jest.fn();
        const activity = {};

        createFormatEgressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createFormatEgressTagsMiddleware should call next if activity tags is in string format', () => {
        const next = jest.fn();
        const activity = {
            channelData: {
                tags: 'foo,bar'
            }
        };

        createFormatEgressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createFormatEgressTagsMiddleware should convert activity with tags in array format to string', () => {
        const next = jest.fn();

        const activity = {
            channelData: {
                tags: ['foo', 'bar']
            }
        };

        const expectedActivity = {
            channelData: {
                tags: activity.channelData.tags.toString()
            }
        }

        createFormatEgressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(expectedActivity);
    });


    it('createFormatEgressTagsMiddleware should convert activity with tags in JSON format to string', () => {
        const next = jest.fn();

        const activity = {
            channelData: {
                tags: {
                    'type': 'type',
                    'context': {
                        'foo': 'foo',
                        'bar': 'bar'
                    }
                }
            }
        };

        const expectedActivity = {
            channelData: {
                tags: JSON.stringify(activity.channelData.tags)
            }
        }

        createFormatEgressTagsMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(expectedActivity);
    });
});