import React from 'react';
import styles from './ActionButton.module.css';
import cn from 'classnames';

type Props = {
    onClick: () => void;
};

const StartVotingButtonComponent = ({onClick}: Props) => (
    <button type="button"
            className={cn(styles.actionButton, styles.startVotingButton)}
            onClick={onClick}>
        Start Voting
    </button>
);

export default StartVotingButtonComponent;