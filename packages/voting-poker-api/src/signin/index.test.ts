import {handler} from './index';

describe('handler', () => {
    const MOCK_EVENT = {
        requestContext: {
            requestId: '12345',
        },
        body: '',
    };

    it('throws an error if an event has an empty body', async () => {
        await expect(handler(MOCK_EVENT)).rejects.toThrow('Empty event body');
    });

    it('throws an error if an event body is not a well-formatted JSON', async () => {
        const event = {
            ...MOCK_EVENT,
            body: '{foo:bar}',
        };

        await expect(handler(event)).rejects.toThrow(`Malformed event body JSON: ${event.body}`);
    });

    it('returns a stub voter', async () => {
        const signInRequest = {
            name: 'User',
            sessionId: 'abcd-1234-efgh-5678',
        };

        const event = {
            ...MOCK_EVENT,
            body: JSON.stringify(signInRequest),
        };

        await expect(handler(event)).resolves.toEqual({
            body: JSON.stringify({
                id: event.requestContext.requestId,
                name: signInRequest.name,
                moderator: true,
                voted: false,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            },
            statusCode: 200,
        });
    });
});