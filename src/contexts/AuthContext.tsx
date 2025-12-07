import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  apiToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://musicatos.vercel.app/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('apiToken');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setApiToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      const token = data.token || data.accessToken || data.access_token;
      
      if (token) {
        const userData = { email, name: email.split('@')[0] };
        setUser(userData);
        setApiToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('apiToken', token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll simulate registration
    // In a real app, you'd call the registration endpoint
    try {
      setIsLoading(true);
      
      // Simulate successful registration
      const userData = { email, name };
      setUser(userData);
      
      // Try to get a token by logging in
      const loginSuccess = await login(email, password);
      
      if (!loginSuccess) {
        // If login fails, just store user locally for demo
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('apiToken', 'demo-token');
        setApiToken('demo-token');
      }
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setApiToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('apiToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiToken,
        isAuthenticated: !!user && !!apiToken,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
