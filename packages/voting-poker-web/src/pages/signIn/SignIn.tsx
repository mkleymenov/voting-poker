import React, {useCallback, useEffect, useState} from 'react';
import styles from './SignIn.module.css';
import cx from 'classnames';

type Props = {
    onSignIn: (name: string) => void;
    isSignInError: boolean;
};

const SignInComponent = ({onSignIn, isSignInError}: Props) => {
    const [name, setName] = useState('');
    const [signInDisabled, setSignInDisabled] = useState(true);

    useEffect(
        () => setSignInDisabled(name.length === 0),
        [name],
    );

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.currentTarget.value || '';
        setName(name.trim());
    };

    const onSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!name || name.length === 0) {
                return;
            }

            onSignIn(name);
        },
        [name, onSignIn],
    );

    return (
        <main className={styles.signIn}>
            <form action='#' onSubmit={onSubmit} className={styles.signInForm}>
                <h3 className={styles.signInLogo}>
                    Voting Poker
                </h3>

                {isSignInError && (
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
                        className={cx(styles.signInInput, styles.signInButton)}
                        disabled={signInDisabled}>
                    Sign In
                </button>
            </form>
        </main>
    );
};

export default SignInComponent;