import parseWebSocketEvent from './parser';

describe('parseWebSocketEvent', () => {
    it('returns an error if an event has an empty body', async () => {
        const event = {
            requestContext: {},
            body: '',
        };

        await expect(parseWebSocketEvent(event))
            .rejects
            .toEqual('The event has an empty body');
    });

    it('returns an error if an event does not have a connection id', async () => {
        const event = {
            requestContext: {},
            body: 'foo',
        };

        await expect(parseWebSocketEvent(event))
            .rejects
            .toEqual('The event does not have a connection id');
    });

    it('returns an error if an event body is not a valid JSON', async () => {
        const event = {
            requestContext: {
                connectionId: '12345',
            },
            body: 'foo',
        };

        await expect(parseWebSocketEvent(event))
            .rejects
            .toContain('Could not parse an event body');
    });

    it('returns an error if an event body is not a valid WebSocketEvent JSON', async () => {
        const event = {
            requestContext: {
                connectionId: '12345',
            },
            body: '{"foo": "bar"}',
        };

        await expect(parseWebSocketEvent(event))
            .rejects
            .toEqual(`Received malformed WebSocketEvent: ${{foo: 'bar'}}`);
    });

    it('returns a parsed WebSocketEvent', async () => {
        const event = {
            requestContext: {
                connectionId: '12345',
            },
            body: '{"message": "voterJoined", "body": {"name": "Test User", "gameId": "12345"}}',
        };

        const result = await parseWebSocketEvent(event);

        expect(result).toEqual({
            connectionId: '12345',
            message: 'voterJoined',
            body: {
                name: 'Test User',
                gameId: '12345',
            },
        });
    });
});