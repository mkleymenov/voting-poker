import {GameState, VoterState} from './handler';
import AWS from 'aws-sdk';

const API_GW_ENDPOINT = process.env['API_GW_ENDPOINT'] || '';

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: API_GW_ENDPOINT,
});

export const publishConnectionId = async (connectionId: string): Promise<void> => {
    const payload = {
        message: 'connect',
        body: connectionId,
    };

    await apiGatewayManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload),
    }).promise();
};

export const publishGameState = async (gameState: GameState): Promise<void> => {
    const payload = {
        message: 'gameState',
        body: gameState,
    };

    const promises = gameState.voters.map(async (voter: VoterState) =>
        apiGatewayManagementApi.postToConnection({
            ConnectionId: voter.id,
            Data: JSON.stringify(payload),
        }).promise()
    );
    await Promise.all(promises);
};