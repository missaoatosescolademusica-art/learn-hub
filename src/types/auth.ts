/* eslint-disable @typescript-eslint/no-explicit-any */
// Define types based on Better Auth / Neon Auth structure
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  [x: string]: any;
  id: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  image: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}