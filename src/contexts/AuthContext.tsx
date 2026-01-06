/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authClient } from "../auth";
import { AuthContextType, Profile, Session, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive profile from user for backward compatibility
  const profile: Profile | null = user
    ? {
        id: user.id,
        user_id: user.id,
        full_name: user.name,
        avatar_url: user.image || null,
      }
    : null;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data) {
          setSession(data.session as unknown as Session);
          setUser(data.user as unknown as User);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Email ou senha inválidos",
        };
      }

      const sessionData = await authClient.getSession();
      if (sessionData.data) {
        setSession(sessionData.data.session as unknown as Session);
        setUser(sessionData.data.user as unknown as User);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Erro ao fazer login. Tente novamente.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Erro ao criar conta",
        };
      }

      const sessionData = await authClient.getSession();
      if (sessionData.data) {
        setSession(sessionData.data.session as unknown as Session);
        setUser(sessionData.data.user as unknown as User);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.message || "Erro ao criar conta. Tente novamente.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated: !!user,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
