import Deck from '../../components/deck/Deck';
import styles from './Game.module.css';
import React, {useCallback} from 'react';
import VoterList from '../../components/voterList/VoterList';
import './Game.module.css';
import {CardState, CardValue, VoterState, VotingPokerState} from '../../votingpoker';
import StartVotingButton from '../../components/actionButton/StartVotingButton';
import StopVotingButton from '../../components/actionButton/StopVotingButton';
import VotesChart from '../../components/votesChart/VotesChart';

const CARD_VALUES: CardValue[] = [0, 1, 2, 3, 5, 8, 13, '?'];

type Props = {
    self: VoterState;
    gameState: VotingPokerState;
    onVoteChanged: (value?: CardValue) => void;
    onGameOver: () => void;
    onGameRestart: () => void;
};

export const GameComponent = ({self, gameState, onVoteChanged, onGameOver, onGameRestart}: Props) => {
    const cards = CARD_VALUES.map(value => ({
        value,
        selected: self.voted && self.value === value,
    }));

    const {voters, gameOver} = gameState;

    const onCardClick = useCallback(
        (state: CardState) => {
            const value = state.selected ? state.value : undefined;
            onVoteChanged(value);
        },
        [onVoteChanged],
    );

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
                        <StartVotingButton onClick={onGameRestart}/>
                    ) : (
                        <StopVotingButton onClick={onGameOver}/>
                    )}
                </footer>
            )}
        </div>
    );
};

export default GameComponent;
