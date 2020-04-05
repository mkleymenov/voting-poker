import React from 'react';
import styles from './ActionButton.module.css';
import cn from 'classnames';

type Props = {
    onClick: () => void;
};

const StopVotingButtonComponent = ({onClick}: Props) => (
    <button type="button"
            className={cn(styles.actionButton, styles.stopVotingButton)}
            onClick={onClick}>
        Stop Voting
    </button>
);

export default StopVotingButtonComponent;