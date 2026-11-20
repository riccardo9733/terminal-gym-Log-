import { useUser, useClerk } from '@clerk/react';
import { useMemo } from 'react';
import { UserProfile } from '../types/workout';
import { isFirebaseConfigured } from '../lib/firebase';

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, openSignIn, openSignUp, openUserProfile } = useClerk();

  const userProfile: UserProfile | null = useMemo(() => {
    if (!isSignedIn || !user) return null;
    return {
      uid: user.id,
      email: user.primaryEmailAddress?.emailAddress || null,
      displayName:
        user.fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
        'athlete',
      isAnonymous: false,
    };
  }, [isSignedIn, user]);

  return {
    user: userProfile,
    loading: !isLoaded,
    isFirebaseConfigured,
    logout: () => signOut(),
    openSignIn,
    openSignUp,
    openUserProfile,
  };
}
