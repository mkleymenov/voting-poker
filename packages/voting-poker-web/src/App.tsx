import Deck from './components/deck/Deck';
import styles from './App.module.css';
import React, {useState} from 'react';
import VoterList from './components/voterList/VoterList';
import './App.module.css';
import {CardState, CardValue, VoterState} from './votingpoker';
import StartVotingButton from './components/actionButton/StartVotingButton';
import StopVotingButton from './components/actionButton/StopVotingButton';
import VotesChart from './components/votesChart/VotesChart';

const CARD_VALUES: CardValue[] = [0, 1, 2, 3, 5, 8, 13, '?'];
const VOTERS: string[] = [
    'Isabella',
    'Cleo',
    'Courtney',
    'Lachlan',
    'Eugene',
    'Bruce',
];

const INITIAL_CARDS_STATE: CardState[] = CARD_VALUES.map(value => ({
    value,
    selected: false,
}));

const INITIAL_VOTERS_STATE: VoterState[] = VOTERS.map(voter => ({
    name: voter,
    voted: false,
}));

const SELF = VOTERS[Math.floor(Math.random() * INITIAL_VOTERS_STATE.length)];

const App = () => {
    const [cards, setCards] = useState(INITIAL_CARDS_STATE);
    const [voters, setVoters] = useState(INITIAL_VOTERS_STATE);
    const [gameOver, setGameOver] = useState(false);

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
        setVoters(prevVoters =>
            prevVoters.map(voter => {
                if (voter.name === SELF) {
                    return {
                        ...voter,
                        voted: state.selected,
                        value: state.selected ? state.value : undefined,
                    };
                }
                return voter;
            })
        );
    };

    const onStartVoting = () => {
        setCards(INITIAL_CARDS_STATE);
        setVoters(INITIAL_VOTERS_STATE);
        setGameOver(false);
    };

    const onStopVoting = () => {
        setVoters(prevVoters =>
            prevVoters.map(voter => {
                if (voter.name !== SELF) {
                    return {
                        ...voter,
                        voted: true,
                        value: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
                    };
                }
                return voter;
            }),
        );
        setGameOver(true);
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
            <footer className={styles.footer}>
                {gameOver ? (
                    <StartVotingButton onClick={onStartVoting}/>
                ) : (
                    <StopVotingButton onClick={onStopVoting}/>
                )}
            </footer>
        </div>
    );
};

export default App;
