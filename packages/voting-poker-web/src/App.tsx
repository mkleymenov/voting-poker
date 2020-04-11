import React, {useState} from 'react';
import SignIn from './pages/signIn/SignIn';
import Game from './pages/game/Game';
import {VoterState} from './votingpoker';

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
    const [self, setSelf] = useState(null as SelfState);

    if (!self) {
        const sessionId = getSessionId(window);
        return <SignIn setSelf={setSelf} sessionId={sessionId}/>;
    }

    return <Game self={self}/>;
};

export default AppComponent;