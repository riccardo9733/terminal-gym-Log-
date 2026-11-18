import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  isFirebaseConfigured,
  loginWithGoogle,
  loginWithGithub,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
} from '../lib/firebase';
import { UserProfile } from '../types/workout';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'athlete',
          isAnonymous: false,
        });
      } else {
        if (firebaseUser?.isAnonymous && auth) {
          logoutUser().catch(() => { });
        }
        setUser(null);
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
    loginWithEmail,
    registerWithEmail,
    logout: logoutUser,
  };
}
