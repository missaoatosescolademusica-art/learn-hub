import { createAuthClient } from '@neondatabase/neon-js/auth';

// Ensure the environment variable is defined
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
if (!authUrl) {
  console.warn('VITE_NEON_AUTH_URL is not defined in environment variables.');
}

export const authClient = createAuthClient(authUrl || '');
