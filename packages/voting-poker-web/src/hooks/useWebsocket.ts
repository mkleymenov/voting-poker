import {IMessageEvent, w3cwebsocket as W3CWebSocket} from 'websocket';
import {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import {VoterState, VotingPokerState} from '../votingpoker';

type WebSocketEventType = 'connect' | 'gameState';
type WebSocketEventBody = VotingPokerState | VoterState;

interface WebSocketEvent {
    message: WebSocketEventType;
    body: WebSocketEventBody;
}

export interface ConnectMessage extends WebSocketEvent {
    message: 'connect';
    body: VoterState;
}

export interface GameStateMessage extends WebSocketEvent {
    message: 'gameState';
    body: VotingPokerState;
}

export type WebSocketMessage = ConnectMessage | GameStateMessage;

export type WebSocketContext = {
    send: (message: string, body: object) => void;
    lastMessage: WebSocketMessage | null;
    isConnected: boolean;
};

const READY_STATE_CONNECTED = 1;

export const useWebsocket = (url: string): WebSocketContext => {
    const websocket: MutableRefObject<W3CWebSocket | null> = useRef<W3CWebSocket>(null);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [isConnected, setConnected] = useState(false);

    const send = useCallback(
        (message: string, body: object) => {
            const ws = websocket.current;
            if (ws && ws.readyState === READY_STATE_CONNECTED) {
                ws.send(JSON.stringify({
                    message,
                    body,
                }));
            }
        },
        [],
    );

    const parseWebSocketMessage = (
        event: IMessageEvent,
    ): WebSocketMessage | null => {
        try {
            const json = JSON.parse(event.data.toString());
            if (json && typeof json.message != 'undefined' && typeof json.body != 'undefined') {
                return json as WebSocketMessage;
            } else {
                console.error(`Expected WebSocketMessage JSON, received ${json}`);
            }
        } catch (e) {
            console.error(`Expected WebSocketMessage JSON, received invalid JSON: ${event.data}`, e);
        }

        return null;
    };

    useEffect(() => {
            const ws = new W3CWebSocket(url);
            ws.onopen = () => setConnected(true);
            ws.onclose = () => setConnected(false);
            ws.onmessage = (event: IMessageEvent) => {
                const message = parseWebSocketMessage(event);
                if (message) {
                    setLastMessage(message);
                }
            };
            ws.onerror = console.error;

            websocket.current = ws;

            return () => {
                const ws = websocket.current;
                if (ws) {
                    ws.close();
                }
            };
        },
        [],
    );

    return {
        send,
        lastMessage,
        isConnected,
    };
};

export default useWebsocket;