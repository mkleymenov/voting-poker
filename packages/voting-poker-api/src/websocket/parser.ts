import {APIGatewayProxyEvent} from 'aws-lambda';
import {WebSocketEvent} from './dispatcher';

export const parseWebSocketEvent = async (
    event: APIGatewayProxyEvent,
): Promise<WebSocketEvent> =>
    new Promise((resolve, reject) => {
        const {body} = event;
        if (!body) {
            reject('The event has an empty body');
            return;
        }

        try {
            const message = JSON.parse(body) as WebSocketEvent;
            if (message && message.message && message.body) {
                resolve(message);
            } else {
                reject(`Received malformed WebSocketEvent: ${message}`);
            }
        } catch (e) {
            reject(`Could not parse an event body ${body} as JSON: ${e}`);
        }
    });

export default parseWebSocketEvent;