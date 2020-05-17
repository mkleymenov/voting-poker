import {
    GameOver,
    GameState,
    onGameOver,
    onVoteChanged,
    onVoterJoined,
    onVoterLeft,
    VoteChanged,
    VoterJoined,
    VoterLeft
} from './handler';

type VotingPokerEventType = 'voterJoined' | 'voterLeft' | 'voteChanged' | 'gameOver';
type VotingPokerEventBody = VoterJoined | VoterLeft | VoteChanged | GameOver;

interface VotingPokerEvent {
    connectionId: string;
    message: VotingPokerEventType;
    body: VotingPokerEventBody;
}

interface VoterJoinedEvent extends VotingPokerEvent {
    message: 'voterJoined';
    body: VoterJoined;
}

interface VoterLeftEvent extends VotingPokerEvent {
    message: 'voterLeft',
    body: VoterLeft,
}

interface VoteChangedEvent extends VotingPokerEvent {
    message: 'voteChanged';
    body: VoteChanged;
}

interface GameOverEvent extends VotingPokerEvent {
    message: 'gameOver';
    body: GameOver;
}

export type WebSocketEvent = VoterJoinedEvent | VoterLeftEvent | VoteChangedEvent | GameOverEvent;

const dispatch = async (event: WebSocketEvent): Promise<GameState> => {
    switch (event.message) {
        case 'voterJoined':
            return onVoterJoined(event.body, event.connectionId);
        case 'voterLeft':
            return onVoterLeft(event.body);
        case 'voteChanged':
            return onVoteChanged(event.body);
        case 'gameOver':
            return onGameOver(event.body);
        default:
            return Promise.reject(`Unexpected WebSocketMessage type: ${event}`);
    }
};

export default dispatch;