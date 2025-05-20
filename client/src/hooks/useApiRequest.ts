import { useAuth } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { mockApiResponse } from "@/lib/mock-api";

// For development mode - use mock API responses
const isDevelopment = false; // Set to true for development, false for production

export function useApiRequest() {
  const { user } = useAuth();

  const authenticatedApiRequest = async (
    method: string,
    url: string,
    data?: unknown | undefined,
    options?: { headers?: HeadersInit }
  ) => {
    // Use mock API responses in development mode
    if (isDevelopment) {
      console.log(`Mock API request: ${method} ${url}`, data);
      return mockApiResponse(method, url, data);
    }
    
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    const headers = new Headers(options?.headers);

    if (data) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      // Force token refresh
      const idToken = await auth.currentUser.getIdToken(true);
      headers.set('Authorization', `Bearer ${idToken}`);

      const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      if (res.status === 401) {
        // If we get a 401, try to refresh the token and retry once
        const newToken = await auth.currentUser.getIdToken(true);
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          credentials: 'include',
        });
      }

      return res;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  return { apiRequest: authenticatedApiRequest };
} 