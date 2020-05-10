import * as storage from './storage';

export interface VoterJoined {
    id: string;
}

export interface VoteChanged {
    id: string;
    voted: boolean;
    value?: string;
}

export interface GameOver {
    id: string;
    gameOver: boolean;
}

export interface VoterState {
    id: string;
    name: string;
    voted: boolean;
    value?: string;
    moderator: boolean;
}

export interface GameState {
    voters: VoterState[];
    gameOver: boolean;
}

const GAME_STATE_STUB: GameState = {
    voters: [{
        id: '12345',
        name: 'Mikhail',
        voted: false,
        moderator: true,
    }],
    gameOver: false,
};

export const onVoterJoined = async (
    voterJoined: VoterJoined,
    connectionId: string,
): Promise<GameState> => {
    await storage.addVoterConnection(voterJoined.id, connectionId);
    GAME_STATE_STUB.voters.forEach(voter => voter.id = voterJoined.id);
    return GAME_STATE_STUB;
};

export const onVoteChanged = async (voteChanged: VoteChanged): Promise<GameState> => {
    return Promise.resolve({
        ...GAME_STATE_STUB,
        voters: GAME_STATE_STUB.voters.map((voter: VoterState) => ({
            ...voter,
            voted: voteChanged.voted,
            value: voteChanged.value,
        })),
    });
};

export const onGameOver = async (gameOver: GameOver): Promise<GameState> => {
    return Promise.resolve({
        ...GAME_STATE_STUB,
        gameOver: gameOver.gameOver,
    });
};