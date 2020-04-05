import React from 'react';
import cn from 'classnames';
import styles from './Deck.module.css';
import Card from '../card/Card';
import {CardState} from '../../votingpoker';

export interface Props {
    cards: CardState[];
    onClick: (state: CardState) => void;
}

const DeckComponent = ({cards, onClick}: Props) => (
    <div className={cn(styles.deck)}>
        {cards.map((card) =>
            <Card key={card.value} card={card} onSelect={onClick}/>
        )}
    </div>
);

export default DeckComponent;