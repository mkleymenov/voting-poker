import React from 'react';
import styles from './VoterList.module.css';
import Voter from '../voter/Voter';
import {VoterState} from '../../votingpoker';

export interface Props {
    voters: VoterState[];
    showVotes: boolean;
}

const VoterList = ({voters, showVotes}: Props) => (
    <div className={styles.voters}>
        {voters.map(voter => (
            <Voter key={voter.name} voter={voter} showVotes={showVotes}/>
        ))}
    </div>
);

export default VoterList;