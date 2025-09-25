/**
 * Authentication Context for TransparencyBot
 * Manages user authentication state and provides auth-related functions
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  role: 'auditor' | 'procurement';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for demo auth in localStorage
        const demoAuth = localStorage.getItem('demoAuth');
        if (demoAuth) {
          const { user: demoUser, timestamp } = JSON.parse(demoAuth);
          // Check if demo session is still valid (24 hours)
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setUser(demoUser);
            setIsLoading(false);
            return;
          } else {
            // Clear expired demo auth
            localStorage.removeItem('demoAuth');
          }
        }

        // Then check for Supabase auth (for real users)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser({
              id: userData.id,
              username: userData.username,
              role: userData.role
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener for Supabase (only for real users)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            role: userData.role
          });
        }
      } else if (!localStorage.getItem('demoAuth')) {
        // Only clear user if not in demo mode
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Demo credentials validation - local only
      const demoCredentials = {
        'auditor_demo': { 
          password: 'auditor_demo_pass', 
          role: 'auditor' as const,
          username: 'auditor_demo'
        },
        'procurement_demo': { 
          password: 'procure_demo_pass', 
          role: 'procurement' as const,
          username:'procurement_demo'
        }
      };

      const demoUser = demoCredentials[username as keyof typeof demoCredentials];
      
      // Validate demo credentials locally
      if (demoUser && password === demoUser.password) {
        // Demo login successful
        const demoUserData: User = {
          id: `demo-${username}-${Date.now()}`,
          username: username,
          role: demoUser.role
        };

        // Store demo auth in localStorage
        localStorage.setItem('demoAuth', JSON.stringify({
          user: demoUserData,
          timestamp: Date.now()
        }));

        setUser(demoUserData);
        return { success: true };
      }

      // If credentials don't match demo users, return error
      return { 
        success: false, 
        error: 'Invalid credentials. Please use the demo credentials shown on the login page.' 
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear demo auth if exists
      localStorage.removeItem('demoAuth');
      
      // Sign out from Supabase (if real user was logged in)
      await supabase.auth.signOut();
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};