import React from 'react';
import {CardValue, VoterState} from '../../votingpoker';
import PieChart from 'react-minimal-pie-chart';
import {Props as LabelProps} from "react-minimal-pie-chart/types/Label";

type Props = {
    voters: VoterState[];
};

const groupByVote = (
    byVote: Map<CardValue, Array<string>>,
    voter: VoterState,
): Map<CardValue, Array<string>> => {
    const {name, value = '?'} = voter;
    const votedForValue = byVote.get(value) || [];
    return byVote.set(value, [...votedForValue, name]);
};

const getVoteColor = (voteIndex: number): string => {
    const hue = (voteIndex + 1) * 137.508;
    return `hsl(${hue}, 75%, 50%)`;
};

const labelFromVotes = (props: LabelProps): string => {
    const {data, dataIndex} = props;
    const {points} = data[dataIndex];
    return points;
};

const VotesChartComponent = ({voters}: Props) => {
    const activeVoters = voters.filter(voter => voter.voted && voter.value !== undefined);
    const byVote = activeVoters.reduce(groupByVote, new Map<CardValue, Array<string>>());

    const data = Array.from(byVote.entries())
        .map(([value, names], voteIndex) => ({
            title: names.join(', '),
            value: names.length,
            color: getVoteColor(voteIndex),
            points: value.toString(),
        }));

    return (
        <PieChart animate
                  animationDuration={200}
                  cx={50}
                  cy={50}
                  data={data}
            // @ts-ignore
                  label={labelFromVotes}
                  labelPosition={115}
                  labelStyle={{
                      fontFamily: 'sans-serif',
                      fontSize: '0.4em',
                      fill: '#666666',
                  }}
                  lengthAngle={360}
                  lineWidth={100}
                  paddingAngle={0}
                  radius={40}
                  rounded={false}
                  startAngle={0}
                  style={{
                      height: '65vh'
                  }}
                  viewBoxSize={[100, 100]}
        />
    );
};

export default VotesChartComponent;