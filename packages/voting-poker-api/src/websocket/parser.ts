import {APIGatewayProxyEvent} from 'aws-lambda';
import {WebSocketEvent} from './dispatcher';

export const parseWebSocketEvent = async (
    event: APIGatewayProxyEvent,
): Promise<WebSocketEvent> =>
    new Promise((resolve, reject) => {
        const {body, requestContext} = event;
        const {connectionId} = requestContext;

        if (!body) {
            reject('The event has an empty body');
            return;
        }
        if (!connectionId) {
            reject('The event does not have a connection id');
            return;
        }

        try {
            const webSocketEvent = JSON.parse(body) as WebSocketEvent;
            if (webSocketEvent && webSocketEvent.message && webSocketEvent.body) {
                resolve({
                    ...webSocketEvent,
                    connectionId,
                });
            } else {
                reject(`Received malformed WebSocketEvent: ${webSocketEvent}`);
            }
        } catch (e) {
            reject(`Could not parse an event body ${body} as JSON: ${e}`);
        }
    });

export default parseWebSocketEvent;