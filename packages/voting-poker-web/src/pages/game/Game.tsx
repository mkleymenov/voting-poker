import Deck from '../../components/deck/Deck';
import styles from './Game.module.css';
import React, {useEffect, useState} from 'react';
import VoterList from '../../components/voterList/VoterList';
import './Game.module.css';
import {CardState, CardValue, VoterState, VotingPokerState} from '../../votingpoker';
import StartVotingButton from '../../components/actionButton/StartVotingButton';
import StopVotingButton from '../../components/actionButton/StopVotingButton';
import VotesChart from '../../components/votesChart/VotesChart';
import io from 'socket.io-client';

const CARD_VALUES: CardValue[] = [0, 1, 2, 3, 5, 8, 13, '?'];
const INITIAL_CARDS_STATE: CardState[] = CARD_VALUES.map(value => ({
    value,
    selected: false,
}));

const SOCKET = io({
    port: '8080',
    autoConnect: false,
});

type Props = {
    self: VoterState;
};

const GameComponent = ({self}: Props) => {
    const [cards, setCards] = useState(INITIAL_CARDS_STATE);

    const initialAppState: VotingPokerState = {
        voters: [self],
        gameOver: false,
    };
    const [gameState, setGameState] = useState(initialAppState);

    useEffect(
        () => {
            SOCKET.on('gameStateChanged', setGameState);
            SOCKET.connect()
                .emit('voterJoined', {
                    id: self.id,
                });
        },
        [self.id],
    );

    useEffect(
        () => setCards(INITIAL_CARDS_STATE),
        [gameState.gameOver],
    );

    const {voters, gameOver} = gameState;

    const onCardClick = (state: CardState) => {
        if (gameOver) {
            return false;
        }

        setCards(prevCards =>
            prevCards.map(card => ({
                value: card.value,
                selected: card.value === state.value && state.selected,
            }))
        );

        SOCKET.emit('voteChanged', {
            id: self.id,
            voted: state.selected,
            value: state.selected ? state.value : undefined,
        });
    };

    const setGameOver = (gameOver: boolean): (() => void) => () => {
        SOCKET.emit('gameOver', {
            id: self.id,
            gameOver,
        });
    };

    return (
        <div className={styles.app}>
            <section className={styles.section}>
                <aside className={styles.asideLeft}>
                    <VoterList voters={voters} showVotes={gameOver}/>
                </aside>
                <main className={styles.main}>
                    {gameOver ? (
                        <VotesChart voters={voters}/>
                    ) : (
                        <Deck cards={cards} onClick={onCardClick}/>
                    )}
                </main>
                <aside className={styles.asideRight}/>
            </section>
            {self.moderator && (
                <footer className={styles.footer}>
                    {gameOver ? (
                        <StartVotingButton onClick={setGameOver(false)}/>
                    ) : (
                        <StopVotingButton onClick={setGameOver(true)}/>
                    )}
                </footer>
            )}
        </div>
    );
};

export default GameComponent;
