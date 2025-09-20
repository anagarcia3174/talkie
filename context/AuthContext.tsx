import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
import { Profile } from '~/types/supabaseTypes';
import { useProfile } from '~/store/profileStore';
import { useLists } from '~/store/listStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

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
  
  const { getProfile, getStats } = useProfile();
  const { getLists } = useLists();

  // Helper function to load user data
  const loadUserData = async (userId: string) => {
    try {
      await Promise.all([
        getProfile(userId),
        getStats(userId),
        getLists(userId)
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't throw - we still want to set loading to false

    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // If we have a session, load the user data
          if (session?.user?.id) {
            await loadUserData(session.user.id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setLoading(true);
      
      try {
        if (session?.user?.id) {
          setSession(session);
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          useProfile.getState().clearProfile();
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [getProfile, getStats, getLists]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};