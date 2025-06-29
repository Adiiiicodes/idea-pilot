"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

type User = unknown;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isNewUser: boolean; // Flag for new users who just signed up
  setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isNewUser: false,
  setIsNewUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth event:', event);
          setUser(session?.user || null);
          setLoading(false);
          
          // Only set isNewUser flag for actual signup events
          if (event === 'SIGNED_UP') {
            console.log('New user signed up, setting isNewUser to true');
            setIsNewUser(true);
            // Store in localStorage to persist across page reloads
            localStorage.setItem('show_quick_start_guide', 'true');
          } else if (event === 'SIGNED_IN') {
            // Check if this is a new user from localStorage
            const shouldShowGuide = localStorage.getItem('show_quick_start_guide') === 'true';
            if (shouldShowGuide) {
              setIsNewUser(true);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsNewUser(false);
            localStorage.removeItem('show_quick_start_guide');
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    getSession();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsNewUser(false);
    localStorage.removeItem('show_quick_start_guide');
  };

  const handleSetIsNewUser = (value: boolean) => {
    setIsNewUser(value);
    if (!value) {
      // Remove the flag when guide is dismissed
      localStorage.removeItem('show_quick_start_guide');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut, 
      isNewUser, 
      setIsNewUser: handleSetIsNewUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);