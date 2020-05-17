import {GameState, VoterState} from './handler';
import * as storage from '../shared/storage';
import AWS from 'aws-sdk';

const API_GW_ENDPOINT = process.env['API_GW_ENDPOINT'] || '';

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: API_GW_ENDPOINT,
});

const publishGameState = async (gameState: GameState): Promise<void> => {
    const promises = gameState.voters.map(async (voter: VoterState) => {
        const connectionId = await storage.getVoterConnection(voter.id);
        if (!connectionId) {
            console.error(`Cannot find connection id for voter ${voter.id}`);
            return;
        }

        return apiGatewayManagementApi.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(gameState),
        }).promise();
    });
    await Promise.all(promises);
};

export default publishGameState;