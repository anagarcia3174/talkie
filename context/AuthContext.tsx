import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
import { useProfile } from '~/store/profileStore';
import { useLists } from '~/store/listStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitializedRef = useRef(false);

  const validateAppleCredential = useCallback(
    async (currentUser: User | null): Promise<boolean> => {
      // Only validate on iOS and if user exists
      if (Platform.OS !== 'ios' || !currentUser) {
        return true;
      }

      // Check if this is an Apple sign-in user
      const isAppleUser =
        currentUser.app_metadata?.provider === 'apple' ||
        currentUser.identities?.some((id) => id.provider === 'apple');

      if (!isAppleUser) {
        return true;
      }

      try {
        // Get the Apple user ID from the user's identities
        const appleIdentity = currentUser.identities?.find((id) => id.provider === 'apple');
        const appleUserId = appleIdentity?.id;

        if (!appleUserId) {
          console.warn('No Apple user ID found in user identities');
          return false;
        }

        // Check the credential state
        const credentialState = await AppleAuthentication.getCredentialStateAsync(appleUserId);

        // If the credential is revoked or not found, the session is invalid
        if (credentialState !== AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED) {
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error validating Apple credential:', error);
        // On error, assume invalid to be safe
        return false;
      }
    },
    []
  );

  // Load user data function with proper error handling
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const { getProfile, getStats } = useProfile.getState();
      const { getLists } = useLists.getState();

      await Promise.allSettled([getProfile(userId), getStats(userId), getLists(userId)]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Handle session updates
  const updateSession = useCallback(
    async (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user?.id) {
        await loadUserData(newSession.user.id);
      } else {
        // Clear user data on sign out
        useProfile.getState().clearProfile();
      }
    },
    [loadUserData]
  );

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          await updateSession(session);
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Skip the initial SIGNED_IN event to prevent duplicate processing
      if (!isInitializedRef.current) return;

      if (!mounted) return;

      setLoading(true);
      try {
        await updateSession(newSession);
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateSession]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
