import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  loginWithGoogle,
  loginWithGithub,
  loginAsGuest,
  logoutUser,
} from '../lib/firebase';
import { UserProfile } from '../types/workout';

const DEMO_USER: UserProfile = {
  uid: 'demo-user',
  email: 'developer@gym-log.local',
  displayName: 'dev_runner',
  isAnonymous: true,
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (!isFirebaseConfigured || !auth) {
      return DEMO_USER;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'guest_athlete' : 'athlete'),
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        // Fall back to demo user if not logged in so UI is always interactive
        setUser(DEMO_USER);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isFirebaseConfigured,
    loginWithGoogle,
    loginWithGithub,
    loginAsGuest,
    logout: logoutUser,
  };
}
