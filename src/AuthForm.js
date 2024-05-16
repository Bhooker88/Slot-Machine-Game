// /src/AuthForm.js
import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

const AuthForm = ({ onUserAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('User registered:', user.uid);
                await setDoc(doc(db, 'users', user.uid), { credits: 1000 });
                console.log('Initial credits set for user:', user.uid);
                onUserAuthenticated(user, 1000);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('User logged in:', user.uid);
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                console.log('User document fetched:', user.uid, userDoc.data().credits);
                onUserAuthenticated(user, userDoc.data().credits);
            }
        } catch (err) {
            setError(err.message);
            console.error('Authentication error:', err);
        }
    };

    return (
        <div className="auth-form">
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuth}>{isRegistering ? 'Register' : 'Login'}</button>
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Already have an account? Login' : 'No account? Register'}
            </button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default AuthForm;