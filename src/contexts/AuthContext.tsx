import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/lib/logger";

type OtpChannel = 'sms' | 'email';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // OTP-based auth
  sendOtp: (identifier: string, channel: OtpChannel) => Promise<{ error: any }>;
  verifyOtp: (identifier: string, token: string, channel: OtpChannel) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  // Keep Google for future use
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clean up hash from URL after OAuth callback
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    );

    // Check existing session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          logger.warn('Auth session check failed:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logger.warn('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Send OTP to phone or email
  const sendOtp = async (identifier: string, channel: OtpChannel) => {
    if (channel === 'sms') {
      // Phone OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: identifier,
      });
      return { error };
    } else {
      // Email OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: {
          shouldCreateUser: true,
        },
      });
      return { error };
    }
  };

  // Verify OTP
  const verifyOtp = async (identifier: string, token: string, channel: OtpChannel) => {
    if (channel === 'sms') {
      const { error } = await supabase.auth.verifyOtp({
        phone: identifier,
        token,
        type: 'sms',
      });
      return { error };
    } else {
      const { error } = await supabase.auth.verifyOtp({
        email: identifier,
        token,
        type: 'email',
      });
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Google Sign-In (kept for future use)
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      sendOtp,
      verifyOtp,
      signOut,
      signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
