import {GameState, onGameOver, onVoteChanged, onVoterJoined} from './handler';
import dispatch, {WebSocketEvent} from './dispatcher';

jest.mock('./handler');

describe('dispatch', () => {
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

    it('calls voter joined handler for voter joined event', async () => {
        const event: WebSocketEvent = {
            message: 'voterJoined',
            body: {
                id: '12345',
            },
        };

        onVoterJoined.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_GAME_STATE)));

        const result = await dispatch(event);

        expect(result).toBe(MOCK_GAME_STATE);
        expect(onVoterJoined).toHaveBeenCalledWith(event.body);
    });

    it('calls vote changed handler for vote changed event', async () => {
        const event: WebSocketEvent = {
            message: 'voteChanged',
            body: {
                id: '12345',
                voted: true,
                value: '1',
            },
        };

        onVoteChanged.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_GAME_STATE)));

        const result = await dispatch(event);

        expect(result).toBe(MOCK_GAME_STATE);
        expect(onVoteChanged).toHaveBeenCalledWith(event.body);
    });

    it('calls game over handler for game over event', async () => {
        const event: WebSocketEvent = {
            message: 'gameOver',
            body: {
                id: '12345',
                gameOver: true,
            },
        };

        onGameOver.mockImplementationOnce(jest.fn(() => Promise.resolve(MOCK_GAME_STATE)));

        const result = await dispatch(event);

        expect(result).toBe(MOCK_GAME_STATE);
        expect(onGameOver).toHaveBeenCalledWith(event.body);
    });

    it('returns an error for an unknown event type', async () => {
        const event: WebSocketEvent = {
            message: 'unknown',
            body: {
                id: '12345',
            },
        };

        await expect(dispatch(event)).rejects.toEqual(`Unexpected WebSocketMessage type: ${event}`);
    });
});