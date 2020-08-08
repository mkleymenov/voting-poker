import AWS from 'aws-sdk';
import {GameState, VoterState} from '../websocket/handler';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

type GameStateItem = {
    GameId: string;
    PlayerId: string;
    PlayerName: string;
    PlayerVoted: boolean;
    PlayerValue?: string;
    PlayerModerator: boolean;
    GameOver: boolean;
    ExpirationTime: number;
};

type PlayerIndexItem = {
    GameId: string;
    PlayerId: string;
};

const GAME_STATE_TABLE = process.env['GAME_STATE_TABLE'] || '';
const ITEM_TTL_MILLIS = 8 * 60 * 60 * 1000; // 8 hours

const DB = new AWS.DynamoDB.DocumentClient();

export const getItemExpirationTime = (): number => Date.now() + ITEM_TTL_MILLIS;

export const toGameStateItem = (
    player: VoterState,
    gameId: string,
    gameOver: boolean,
): GameStateItem => ({
    GameId: gameId,
    PlayerId: player.id,
    PlayerName: player.name,
    PlayerVoted: player.voted,
    PlayerValue: player.value,
    PlayerModerator: player.moderator,
    GameOver: gameOver,
    ExpirationTime: getItemExpirationTime(),
});

export const toVoterState = (gameStateItem: GameStateItem): VoterState => ({
    id: gameStateItem.PlayerId,
    name: gameStateItem.PlayerName,
    voted: Boolean(gameStateItem.PlayerVoted),
    value: gameStateItem.PlayerValue,
    moderator: Boolean(gameStateItem.PlayerModerator),
});

export const addPlayerToGame = async (
    player: VoterState,
    gameId: string,
    gameOver: boolean,
): Promise<VoterState> => {
    const gameStateItem = toGameStateItem(player, gameId, gameOver);

    await DB.put({
        TableName: GAME_STATE_TABLE,
        Item: gameStateItem,
    }).promise();

    return player;
};

export const getPlayerGame = async (playerId: string): Promise<string | undefined> => {
    const response = await DB.query({
        TableName: GAME_STATE_TABLE,
        IndexName: 'Player',
        KeyConditionExpression: 'PlayerId = :PlayerId',
        ExpressionAttributeValues: {
            ':PlayerId': playerId,
        },
        ProjectionExpression: 'GameId',
        Limit: 1,
    }).promise();

    return (response.Items || [])
        .map(item => {
            const playerIndex = item as PlayerIndexItem;
            return playerIndex.GameId;
        })
        .pop();
};

export const leaveGame = async (
    gameId: string,
    playerId: string,
): Promise<void> => {
    await DB.delete({
        TableName: GAME_STATE_TABLE,
        Key: {
            GameId: gameId,
            PlayerId: playerId,
        },
    }).promise();
};

export const getGameState = async (
    gameId: string,
): Promise<GameState> => {
    const response = await DB.query({
        TableName: GAME_STATE_TABLE,
        KeyConditionExpression: 'GameId = :GameId',
        ExpressionAttributeValues: {
            ':GameId': gameId,
        },
    }).promise();

    const initialGameState: GameState = {
        gameId,
        voters: [],
        gameOver: false,
    };

    return (response.Items || [])
        .reduce(
            (
                gameState: GameState,
                item: DocumentClient.AttributeMap,
            ): GameState => {
                const gameStateItem = item as GameStateItem;
                const voter = toVoterState(gameStateItem);
                return {
                    gameId,
                    voters: [
                        ...gameState.voters,
                        voter,
                    ],
                    gameOver: gameState.gameOver || gameStateItem.GameOver,
                };
            },
            initialGameState,
        );
};

export const saveGameState = async (
    gameId: string,
    gameState: GameState,
): Promise<GameState> => {
    const requests = gameState.voters
        .map(voter => toGameStateItem(voter, gameId, gameState.gameOver))
        .map(gameStateItem => ({
            PutRequest: {
                Item: gameStateItem,
            },
        }));

    await DB.batchWrite({
        RequestItems: {
            [GAME_STATE_TABLE]: requests,
        },
    }).promise();

    return gameState;
};

export const savePlayerState = async (
    gameId: string,
    playerState: VoterState,
): Promise<VoterState> => {
    await DB.update({
        TableName: GAME_STATE_TABLE,
        Key: {
            GameId: gameId,
            PlayerId: playerState.id,
        },
        UpdateExpression: 'SET PlayerVoted = :PlayerVoted, ' +
            'PlayerValue = :PlayerValue, ' +
            'ExpirationTime = :ExpirationTime',
        ExpressionAttributeValues: {
            ':PlayerVoted': playerState.voted,
            ':PlayerValue': playerState.value || null,
            ':ExpirationTime': getItemExpirationTime(),
        },
    }).promise();

    return playerState;
};