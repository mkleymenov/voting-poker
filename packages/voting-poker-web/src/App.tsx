import React, {useCallback, useEffect, useState} from 'react';
import SignIn from './pages/signIn/SignIn';
import {CardValue, VoterState, VotingPokerState} from './votingpoker';
import useWebsocket from './hooks/useWebsocket';
import Game from './pages/game/Game';

const GAME_WEBSOCKET_URL = 'wss://qper97tkw2.execute-api.eu-central-1.amazonaws.com/Prod/';

const INITIAL_GAME_STATE: VotingPokerState = {
    gameId: '',
    voters: [],
    gameOver: false,
};

const AppComponent = () => {
    const [self, setSelf] = useState<VoterState | null>(null);
    const [gameState, setGameState] = useState<VotingPokerState>(INITIAL_GAME_STATE);
    const [isSignInError, setSignInError] = useState(false);
    const {
        send,
        lastMessage,
        isConnected,
    } = useWebsocket(GAME_WEBSOCKET_URL);

    useEffect(() => {
        const gameId = window?.location?.hash?.substring(1) || '';
        setGameState((prevGameState) => ({
            ...prevGameState,
            gameId,
        }));
    }, []);

    useEffect(() => {
        if (lastMessage?.message === 'connect') {
            setSelf(lastMessage.body);
            setSignInError(false);
        }
    }, [lastMessage, setSelf, setSignInError]);

    useEffect(() => {
        if (lastMessage?.message === 'gameState') {
            const gameState = lastMessage.body;
            setGameState(gameState);
            setSelf((prevSelf) => {
                if (prevSelf === null) return null;
                const newSelf = gameState.voters.find(voter => voter.id === prevSelf.id);
                return newSelf || null;
            });
        }
    }, [lastMessage, setSelf]);

    const onSignIn = useCallback(
        (name: string) => {
            if (isConnected) {
                send('voterJoined', {
                    name,
                    gameId: gameState.gameId,
                });
            } else {
                setSignInError(true);
            }
        },
        [isConnected, send, gameState, setSignInError],
    );

    const onVoteChanged = useCallback(
        (value?: CardValue) => {
            if (!self) return;

            const voteProps = {
                voted: typeof value !== 'undefined',
                value,
            };

            send('voteChanged', {
                id: self.id,
                gameId: gameState.gameId,
                ...voteProps,
            });

            setSelf({
                ...self,
                ...voteProps,
            });
        },
        [self, send, gameState, setSelf],
    );

    const onGameOverChanged = useCallback(
        (gameOver) => {
            if (!self) return;

            send('gameOver', {
                id: self.id,
                gameId: gameState.gameId,
                gameOver,
            });
        },
        [self, gameState, send],
    );

    if (!self) {
        return <SignIn onSignIn={onSignIn} isSignInError={isSignInError}/>;
    }

    return <Game self={self}
                 gameState={gameState}
                 onVoteChanged={onVoteChanged}
                 onGameOverChanged={onGameOverChanged}/>;
};

export default AppComponent;