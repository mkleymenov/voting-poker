import React, {useCallback, useState} from 'react';
import SignIn from './pages/signIn/SignIn';
import GameContainer from './pages/game/GameContainer';
import {CardValue, VoterState} from './votingpoker';

type SelfState = VoterState | null;

const getSessionId = (window?: Window): string | undefined => {
    const path = typeof window !== 'undefined'
        ? window.location.pathname
        : undefined;

    return path
        ? path.substring(1)
        : undefined;
};

const AppComponent = () => {
    const [self, setSelf] = useState<SelfState>(null);

    const onSelfVote = useCallback(
        (value?: CardValue) => {
            if (!self) return;

            setSelf({
                ...self,
                voted: typeof value !== 'undefined',
                value,
            });
        },
        [self],
    );

    if (!self) {
        const sessionId = getSessionId(window);
        return <SignIn setSelf={setSelf} sessionId={sessionId}/>;
    }

    return <GameContainer self={self} onSelfVote={onSelfVote}/>;
};

export default AppComponent;