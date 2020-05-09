import React, {useEffect, useState} from 'react';
import {VoterState} from '../../votingpoker';
import styles from './SignIn.module.css';
import cx from 'classnames';

type Props = {
    setSelf: (self: VoterState) => void;
    sessionId?: string;
};

type SignInRequestParams = {
    name: string;
    sessionId?: string;
}

type SignInRequestState = {
    data?: VoterState;
    isError: boolean;
    inFlight: boolean;
}

const INITIAL_REQUEST_STATE: SignInRequestState = {
    isError: false,
    inFlight: false,
};

const SIGN_IN_ENDPOINT = 'https://je6g3fkrua.execute-api.eu-central-1.amazonaws.com/Prod/signin';

const signIn = (
    params: SignInRequestParams,
    onRequestStateChanged: (state: SignInRequestState) => void,
): void => {
    const fetchOpts = {
        method: 'POST',
        body: JSON.stringify(params),
    };

    fetch(SIGN_IN_ENDPOINT, fetchOpts)
        .then((response) => response.json())
        .then((data) => onRequestStateChanged({
            data,
            isError: true,
            inFlight: false,
        }))
        .catch(() => onRequestStateChanged({
            data: undefined,
            isError: true,
            inFlight: false,
        }));

    onRequestStateChanged({
        data: undefined,
        isError: false,
        inFlight: true,
    });
};

const SignInComponent = ({setSelf, sessionId}: Props) => {
    const [name, setName] = useState('');
    const [signInDisabled, setSignInDisabled] = useState(true);
    const [signInRequest, setSignInRequest] = useState(INITIAL_REQUEST_STATE);

    useEffect(
        () => setSignInDisabled(name.length === 0),
        [name],
    );

    useEffect(
        () => {
            if (!signInRequest.inFlight && signInRequest.data) {
                setSelf(signInRequest.data);
            }
        },
        [setSelf, signInRequest.inFlight, signInRequest.data],
    );

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.currentTarget.value || '';
        setName(name.trim());
    };

    const onSignInClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (!name || name.length === 0) {
            return;
        }

        const params: SignInRequestParams = {
            sessionId,
            name,
        };

        signIn(params, setSignInRequest);
    };

    return (
        <main className={styles.signIn}>
            <section className={styles.signInForm}>
                <h3 className={styles.signInLogo}>
                    Voting Poker
                </h3>

                {signInRequest.isError && (
                    <h3 className={styles.signInError}>
                        Something went wrong. Please try again later.
                    </h3>
                )}

                <input type="text"
                       placeholder="Display Name"
                       value={name}
                       maxLength={80}
                       className={cx(styles.signInInput, styles.signInName)}
                       onChange={onNameChange}
                       autoFocus/>

                <button type="button"
                        onClick={onSignInClick}
                        className={cx(styles.signInInput, styles.signInButton)}
                        disabled={signInDisabled || signInRequest.inFlight}>
                    Sign In
                </button>
            </section>
        </main>
    );
};

export default SignInComponent;