/// <reference types="react-scripts" />

type FibonacciValue = 0 | 1 | 2 | 3 | 5 | 8 | 13;
type UnknownValue = '?';

export type CardValue = FibonacciValue | UnknownValue;

export interface CardState {
    value: CardValue;
    selected: boolean;
}

export interface VoterState {
    name: string;
    voted: boolean,
    value?: CardValue;
}