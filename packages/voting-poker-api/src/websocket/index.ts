import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import dispatch, {WebSocketEvent} from './dispatcher';
import publishGameState from './publisher';
import parseWebSocketEvent from './parser';
import {VoterLeft} from './handler';

const ok = (): APIGatewayProxyResult => ({
    body: 'OK',
    statusCode: 200,
});

const badRequest = (): APIGatewayProxyResult => ({
    body: 'Bad request',
    statusCode: 400,
});

export const connect = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    console.log('Connected', event.requestContext.connectionId);
    return ok();
};

export const disconnect = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const {requestContext} = event;
    if (!requestContext.connectionId) {
        console.error(`No connection id provided for websocket disconnect event`, event);
        return badRequest();
    }

    console.log('Disconnected', requestContext.connectionId);
    
    const voterLeft: VoterLeft = {
        id: requestContext.connectionId,
    };
    const voterLeftEvent: WebSocketEvent = {
        message: 'voterLeft',
        connectionId: requestContext.connectionId,
        body: voterLeft,
    };

    try {
        const gameState = await dispatch(voterLeftEvent);
        await publishGameState(gameState);
        return ok();
    } catch (error) {
        console.error(`Unable to process a player left event ${event.body}`, error);
        return badRequest();
    }
};

export const message = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const webSocketEvent = await parseWebSocketEvent(event);
        const gameState = await dispatch(webSocketEvent);
        await publishGameState(gameState);
        return ok();
    } catch (error) {
        console.error(`Unable to process a message event ${event.body}`, error);
        return badRequest();
    }
};