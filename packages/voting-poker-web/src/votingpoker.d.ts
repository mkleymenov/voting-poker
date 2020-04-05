/// <reference types="react-scripts" />

type FibonacciValue = 0 | 1 | 2 | 3 | 5 | 8 | 13;
type UnknownValue = '?';

export type CardValue = FibonacciValue | UnknownValue;

export interface CardState {
    value: CardValue;
    selected: boolean;
}

export interface VoterState {
    id: string;
    name: string;
    voted: boolean;
    value?: CardValue;
    moderator: boolean;
}

export interface VotingPokerState {
    sessionId?: string;
    selfId?: string;
    voters: VoterState[];
    gameOver: boolean;
}