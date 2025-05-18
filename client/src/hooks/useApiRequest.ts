import { useAuth } from "@/lib/auth";
import { apiRequest as baseApiRequest } from "@/lib/queryClient";

export function useApiRequest() {
  const { user } = useAuth();

  const authenticatedApiRequest = async (
    method: string,
    url: string,
    data?: unknown | undefined
  ) => {
    const headers: HeadersInit = {};

    if (data) {
      headers['Content-Type'] = 'application/json';
    }

    if (user?.id) {
      headers['X-User-Id'] = user.id;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    // We still need to handle the response status outside this hook,
    // as the original apiRequest does.
    // This simplified version just adds the header.
    // The error handling like throwIfResNotOk should still be used where this hook is called.

    return res;
  };

  return { apiRequest: authenticatedApiRequest };
} 