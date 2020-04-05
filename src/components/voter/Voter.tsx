import React from 'react';
import cn from 'classnames';
import styles from './Voter.module.css';
import {VoterState} from '../../votingpoker';

export interface Props {
    voter: VoterState;
    showVotes: boolean;
}

const VoterComponent = ({voter, showVotes}: Props) => (
    <div className={styles.voter}>
        <span className={styles.voterName}>{voter.name}</span>
        {showVotes ? (
            <span className={styles.voterValue}>{voter.voted ? voter.value : 'N/A'}</span>
        ) : (
            <span
                className={cn(styles.voterValue, styles.voterStatus, {[styles.voterStatusVoted]: voter.voted})}/>
        )}
    </div>
);

export default VoterComponent;