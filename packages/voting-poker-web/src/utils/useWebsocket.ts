import {IMessageEvent, w3cwebsocket as W3CWebSocket} from 'websocket';
import {useEffect, useState} from 'react';

export type WebSocketSend = (message: string, body: object) => void;

export type WebSocketContext = {
    send: WebSocketSend;
};

export type WebSocketMessage = IMessageEvent;

const NOOP_CONTEXT: WebSocketContext = {
    send: (message, body) => {
        console.error(`Unable to send message ${message} with body ${body}: WebSocket is not initialized`);
    },
};

const createContext = (websocket: W3CWebSocket): WebSocketContext => {
    const send = (message: string, body: object) => {
        if (websocket) {
            websocket.send(JSON.stringify({
                message,
                body,
            }));
        }
    };

    return {
        send,
    };
};

export const useWebsocket = (
    url: string,
    onConnect: (context: WebSocketContext) => void,
    onMessage: (message: WebSocketMessage, context: WebSocketContext) => void,
): WebSocketContext => {
    const [context, setContext] = useState<WebSocketContext>(NOOP_CONTEXT);

    useEffect(
        () => {
            const websocket = new W3CWebSocket(url);

            const context = createContext(websocket);
            setContext(context);

            websocket.onopen = () => onConnect(context);
            websocket.onmessage = (message) => onMessage(message as WebSocketMessage, context);
            websocket.onerror = console.error;

            return () => websocket.close();
        },
        [url, onConnect, onMessage],
    );

    return context;
};

export default useWebsocket;