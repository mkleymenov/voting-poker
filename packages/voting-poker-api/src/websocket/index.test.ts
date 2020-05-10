import {connect, disconnect, message} from './index';
import dispatch, {WebSocketEvent} from './dispatcher';
import publishGameState from './publisher';
import parseWebSocketEvent from './parser';
import {GameState} from './handler';

jest.mock('./dispatcher');
jest.mock('./publisher');
jest.mock('./parser');

describe('connect', () => {
    it('returns a stub response', async () => {
        const event = {
            requestContext: {
                connectionId: '12345',
            },
        };

        const response = await connect(event);

        expect(response).toEqual({
            body: 'OK',
            statusCode: 200,
        });
    });
});

describe('disconnect', () => {
    it('returns a stub response', async () => {
        const event = {
            requestContext: {
                connectionId: '12345',
            },
        };

        const response = await disconnect(event);

        expect(response).toEqual({
            body: 'OK',
            statusCode: 200,
        });
    });
});

describe('message', () => {
    const MOCK_WS_EVENT: WebSocketEvent = {
        message: 'voterJoined',
        body: {
            id: '12345',
        },
    };

    const MOCK_EVENT = {
        body: JSON.stringify(MOCK_WS_EVENT),
    };

    const MOCK_GAME_STATE: GameState = {
        voters: [{
            id: '12345',
            name: 'Test User',
            voted: true,
            value: '1',
            moderator: true,
        }],
        gameOver: false,
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('returns a bad request response if an event is invalid', async () => {
        parseWebSocketEvent.mockImplementationOnce(jest.fn(() => Promise.reject('Boom!')));

        const response = await message(MOCK_EVENT);

        expect(response).toEqual({
            body: 'Bad request',
            statusCode: 400,
        });
        expect(parseWebSocketEvent).toHaveBeenCalledWith(MOCK_EVENT);
    });

    it('returns a bad request response if an event cannot be processed', async () => {
        parseWebSocketEvent.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_WS_EVENT)));
        dispatch.mockImplementationOnce(jest.fn(() => Promise.reject('Boom!')));

        const response = await message(MOCK_EVENT);

        expect(response).toEqual({
            body: 'Bad request',
            statusCode: 400,
        });
        expect(parseWebSocketEvent).toHaveBeenCalledWith(MOCK_EVENT);
        expect(dispatch).toHaveBeenCalledWith(MOCK_WS_EVENT);
    });

    it('returns a bad request response if a new game state cannot be published', async () => {
        parseWebSocketEvent.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_WS_EVENT)));
        dispatch.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_GAME_STATE)));
        publishGameState.mockImplementationOnce(jest.fn(() => Promise.reject('Boom!')));

        const response = await message(MOCK_EVENT);

        expect(response).toEqual({
            body: 'Bad request',
            statusCode: 400,
        });
        expect(parseWebSocketEvent).toHaveBeenCalledWith(MOCK_EVENT);
        expect(dispatch).toHaveBeenCalledWith(MOCK_WS_EVENT);
        expect(publishGameState).toHaveBeenCalledWith(MOCK_GAME_STATE);
    });

    it('returns a success response if an event was processed', async () => {
        parseWebSocketEvent.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_WS_EVENT)));
        dispatch.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_GAME_STATE)));
        publishGameState.mockImplementationOnce(jest.fn(() => Promise.resolve()));

        const response = await message(MOCK_EVENT);

        expect(response).toEqual({
            body: 'OK',
            statusCode: 200,
        });
        expect(parseWebSocketEvent).toHaveBeenCalledWith(MOCK_EVENT);
        expect(dispatch).toHaveBeenCalledWith(MOCK_WS_EVENT);
        expect(publishGameState).toHaveBeenCalledWith(MOCK_GAME_STATE);
    });
});