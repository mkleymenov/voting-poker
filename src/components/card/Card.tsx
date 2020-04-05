import React from 'react';
import cn from 'classnames';
import styles from './Card.module.css';
import {CardState} from '../../votingpoker';

export interface Props {
    card: CardState,
    onSelect: (state: CardState) => void;
}

const CardComponent = (props: Props) => {
    const {card, onSelect} = props;
    const {value, selected} = card;

    return (
        <div className={cn(styles.card, {[styles.selected]: selected})}
             onClick={() => {
                 onSelect({value, selected: !selected});
             }}>
            <h1 className={styles.cardValue}>{value}</h1>
        </div>
    )
};

export default CardComponent;