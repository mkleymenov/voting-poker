import * as storage from '../shared/storage';
import {v4 as UUID} from 'uuid';

export interface VoterJoined {
    name: string;
    gameId?: string;
}

export interface VoterLeft {
    id: string;
}

export interface VoteChanged {
    id: string;
    gameId: string;
    voted: boolean;
    value?: string;
}

export interface GameOver {
    id: string;
    gameId: string;
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

export const onVoterJoined = async (
    voterJoined: VoterJoined,
    connectionId: string,
): Promise<GameState> => {
    const gameState = voterJoined.gameId
        ? await storage.getGameState(voterJoined.gameId)
        : undefined;

    const gameId = voterJoined.gameId && gameState
        ? voterJoined.gameId
        : UUID();

    const gameOver = gameState
        ? gameState.gameOver
        : false;

    const moderator = !gameState || gameState.voters.every(v => !v.moderator);

    const player: VoterState = {
        id: connectionId,
        name: voterJoined.name,
        voted: false,
        moderator,
    };

    await storage.addPlayerToGame(player, gameId, gameOver);

    const voters = gameState
        ? [...gameState.voters, player]
        : [player];

    return {
        voters,
        gameOver,
    };
};

export const onVoterLeft = async (voterLeft: VoterLeft): Promise<GameState> => {
    const gameId = await storage.getPlayerGame(voterLeft.id);
    if (!gameId) {
        throw new Error('Could not find game id for player ' + voterLeft.id);
    }

    await storage.leaveGame(gameId, voterLeft.id);

    return await storage.getGameState(gameId);
};

export const onVoteChanged = async (voteChanged: VoteChanged): Promise<GameState> => {
    const gameState = await storage.getGameState(voteChanged.gameId);

    const self = gameState.voters.find(v => v.id === voteChanged.id);
    if (!self) {
        throw new Error(`Player ${voteChanged.id} does not participate in game ${voteChanged.id}`);
    }

    const newSelf = await storage.savePlayerState(voteChanged.gameId, {
        ...self,
        voted: voteChanged.voted,
        value: voteChanged.value,
    });

    return {
        ...gameState,
        voters: gameState.voters.map(voter => voter.id === newSelf.id ? newSelf : voter),
    };
};

export const onGameOver = async (gameOver: GameOver): Promise<GameState> => {
    const gameState = await storage.getGameState(gameOver.gameId);

    const self = gameState.voters.find(v => v.id === gameOver.id);
    if (!self) {
        throw new Error(`Player ${gameOver.id} does not participate in game ${gameOver.id}`);
    }
    if (!self.moderator) {
        throw new Error(`Player ${gameOver.id} does not have sufficient \
            permissions to manage state of game ${gameOver.gameId}`);
    }

    const newVoters = gameOver.gameOver
        ? gameState.voters
        : gameState.voters.map(voter => ({
            ...voter,
            voted: false,
            value: undefined,
        }));

    return await storage.saveGameState(gameOver.gameId, {
        voters: newVoters,
        gameOver: gameOver.gameOver,
    });
};