import React, {useCallback, useEffect, useState} from 'react';
import Game from './Game';
import {CardValue, VoterState, VotingPokerState} from '../../votingpoker';
import useWebsocket, {WebSocketContext, WebSocketMessage} from '../../utils/useWebsocket';

type Props = {
    self: VoterState;
    onSelfVote: (value?: CardValue) => void;
};

const GAME_WEBSOCKET_URL = 'wss://qper97tkw2.execute-api.eu-central-1.amazonaws.com/Prod/';

const parseGameState = (message: WebSocketMessage): VotingPokerState | null => {
    try {
        const json = JSON.parse(message.data.toString()) as VotingPokerState;
        if (json && typeof json.voters !== 'undefined' && typeof json.gameOver !== 'undefined') {
            return json;
        } else {
            console.error(`Expected VotingPokerState JSON, received ${json}`);
        }
    } catch (e) {
        console.error(`Expected VotingPokerState JSON, received invalid JSON: ${message.data}`, e);
    }

    return null;
};

const updateSelfVoter = (
    gameState: VotingPokerState,
    self: VoterState,
): VotingPokerState => ({
    ...gameState,
    voters: gameState.voters.map(voter => voter.id === self.id ? self : voter),
});

export const GameContainerComponent = ({self, onSelfVote}: Props) => {
    const [gameState, setGameState] = useState<VotingPokerState>({
        voters: [self],
        gameOver: false,
    });

    useEffect(
        () => setGameState(prevGameState => updateSelfVoter(prevGameState, self)),
        [self, setGameState, updateSelfVoter],
    );

    const onWSMessage = useCallback(
        (message: WebSocketMessage) => {
            const gameState = parseGameState(message);
            if (gameState) {
                setGameState(gameState);
            }
        },
        [setGameState],
    );

    const onWSOpen = useCallback(
        (context: WebSocketContext) => context.send('voterJoined', {id: self.id}),
        [self.id],
    );

    const websocket = useWebsocket(GAME_WEBSOCKET_URL, onWSOpen, onWSMessage);

    const onVoteChanged = useCallback(
        (value?: CardValue) => {
            websocket.send('voteChanged', {
                id: self.id,
                voted: typeof value !== 'undefined',
                value,
            });
            onSelfVote(value);
        },
        [websocket, self.id],
    );

    const onGameOver = useCallback(
        () => {
            websocket.send('gameOver', {
                id: self.id,
                gameOver: true,
            });
        },
        [websocket, self.id],
    );

    const onGameRestart = useCallback(
        () => {
            websocket.send('gameOver', {
                id: self.id,
                gameOver: false,
            });
        },
        [websocket, self.id],
    );

    return (
        <Game self={self}
              gameState={gameState}
              onVoteChanged={onVoteChanged}
              onGameOver={onGameOver}
              onGameRestart={onGameRestart}/>
    );
};

export default GameContainerComponent;