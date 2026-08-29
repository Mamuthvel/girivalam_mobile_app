import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/lib/logger";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App as CapApp } from '@capacitor/app';

const isNative = Capacitor.isNativePlatform();
// Deep link the app registers (custom URL scheme = the app id). Supabase must
// list this exact value under Authentication -> URL Configuration -> Redirect URLs.
const NATIVE_OAUTH_REDIRECT = 'com.girivalam.app://auth/callback';

// Complete a native OAuth login from the deep-link URL handed back to the app.
const completeNativeOAuth = async (url: string) => {
  try {
    const code = url.split('?')[1]?.split('#')[0]
      ? new URLSearchParams(url.split('?')[1].split('#')[0]).get('code')
      : null;
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
      return;
    }
    // Fallback: implicit-style tokens in the URL hash
    const hash = url.split('#')[1];
    if (hash) {
      const hp = new URLSearchParams(hash);
      const access_token = hp.get('access_token');
      const refresh_token = hp.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    }
  } catch (e) {
    logger.warn('Native OAuth callback failed:', e);
  }
};

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

    // Native: catch the OAuth redirect deep link and finish the login in-app
    let urlListener: { remove: () => void } | undefined;
    if (isNative) {
      CapApp.addListener('appUrlOpen', async ({ url }) => {
        if (url && url.includes('auth/callback')) {
          await completeNativeOAuth(url);
          try { await Browser.close(); } catch { /* no-op */ }
        }
      }).then((handle) => { urlListener = handle; });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      urlListener?.remove();
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

  // Google Sign-In
  const signInWithGoogle = async () => {
    if (isNative) {
      // Get the provider URL but don't let the WebView navigate away; open it in
      // the system browser and let the deep-link handler bring the session back.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: NATIVE_OAUTH_REDIRECT,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        logger.warn('Google sign-in failed:', error);
        return;
      }
      if (data?.url) {
        await Browser.open({ url: data.url });
      }
      return;
    }
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
