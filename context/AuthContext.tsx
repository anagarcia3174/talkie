import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
import { useProfile } from '~/store/profileStore';
import { useLists } from '~/store/listStore';
import { restoreUser } from '~/services/profileService';
import { useFollow } from '~/store/followStore';
import { useBlock } from '~/store/blockStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountDeleted: boolean;
  signOut: () => Promise<void>;
  restoreAccount: () => Promise<
    | {
        success: true;
      }
    | {
        success: false;
        error: string;
      }
  >;
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
  const [accountDeleted, setAccountDeleted] = useState(false);
  const isInitializedRef = useRef(false);

  // Load user data function with proper error handling
  const loadUserData = useCallback(async (userId: string) => {
    const { getProfile, getStats } = useProfile.getState();
    const { getLists } = useLists.getState();
    const { hydrateFollowerIds, hydrateFollowingIds } = useFollow.getState();
    const { fetchBlockedIds } = useBlock.getState();

    const profileResult = await getProfile(userId);

    if (!profileResult.success) {
      if (profileResult.error === 'ACCOUNT_DELETED') {
        return { accountDeleted: true };
      }
      return { accountDeleted: false };
    }

    // Only load additional data if active
    await Promise.allSettled([
      getStats(userId),
      getLists(userId),
      hydrateFollowerIds(userId),
      hydrateFollowingIds(userId),
      fetchBlockedIds(userId),
    ]);

    return { accountDeleted: false };
  }, []);

  // Handle session updates
  const updateSession = useCallback(
    async (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user?.id) {
        const result = await loadUserData(newSession.user.id);

        if (result.accountDeleted) {
          setAccountDeleted(true);
          return;
        }

        setAccountDeleted(false);
      } else {
        useProfile.getState().clearProfile();
        setAccountDeleted(false);
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

  const restoreAccount = async (): Promise<
    | {
        success: true;
      }
    | {
        success: false;
        error: string;
      }
  > => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const result = await restoreUser();

    if (!result.success) {
      return result;
    }

    setLoading(true);
    setAccountDeleted(false);
    await loadUserData(user.id);

    return { success: true };
  };

  const value = {
    user,
    session,
    loading,
    accountDeleted,
    signOut,
    restoreAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
