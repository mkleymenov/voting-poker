import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import dispatch from './dispatcher';
import publishGameState from './publisher';
import parseWebSocketEvent from './parser';

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
    console.log('Disconnected', event.requestContext.connectionId);
    return ok();
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