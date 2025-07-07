import { QueryClient, QueryFunction } from "@tanstack/react-query";

// This is the new interface that components will use.
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  [key: string]: any; // Allows for 'products', 'requests', 'queries' etc.
}

// Helper function to create proper API responses
export function createApiResponse<T>(data: T, success: boolean = true): ApiResponse<T> {
  return {
    success,
    data,
  };
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
        const errorJson = await res.json();
        errorText = errorJson.message || errorJson.error || errorText;
    } catch (e) {
        // Ignore if the response is not JSON
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
}

// Renamed the original function to avoid breaking changes.
export async function apiRawRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// This is the new, generic function that components should use.
export async function apiRequest<T>(
  method: string,
  url:string,
  data?: unknown,
): Promise<T> {
    const isFormData = data instanceof FormData;

    const res = await fetch(url, {
        method,
        headers: data && !isFormData ? { "Content-Type": "application/json" } : {},
        body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
        credentials: "include",
    });
    await throwIfResNotOk(res);
    // Return the parsed JSON data
    return await res.json() as T;
}

// Helper function for API calls that return wrapped responses
export async function apiRequestWrapped<T>(
  method: string,
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
    });
    await throwIfResNotOk(res);
    // Return the parsed JSON data as wrapped response
    return await res.json() as ApiResponse<T>;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<TData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData> {
  const { on401: unauthorizedBehavior } = options;
  
  return async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      // For user API specifically, handle 401 more gracefully
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          // Return a structured response for auth-related endpoints
          if (queryKey[0] === "/api/user") {
            return { success: false, message: "Not authenticated" } as unknown as TData;
          }
          return null as unknown as TData;
        } else {
          // Let it throw through the normal flow
          const errorData = await res.json();
          throw new Error(errorData.message || "Authentication required");
        }
      }

      await throwIfResNotOk(res);
      return await res.json() as TData;
    } catch (error) {
      if (error instanceof Error && 
          error.message.includes('Failed to fetch') && 
          queryKey[0] === "/api/user" && 
          unauthorizedBehavior === "returnNull") {
        // For network errors on auth endpoints, provide a standard response
        console.warn('Network error during auth check:', error.message);
        return { success: false, message: "Network error" } as unknown as TData;
      }
      throw error;
    }
  };
}

// Create a more aggressive query client that forces data loading consistently
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnMount: 'always', // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window gets focus
      refetchOnReconnect: true, // Refetch on network reconnection
      staleTime: 10000, // Consider data stale sooner - after 10 seconds
      retry: 3, // Increase retry count to 3
      retryDelay: attemptIndex => Math.min(800 * 2 ** attemptIndex, 8000), // Faster exponential backoff
    },
    mutations: {
      retry: 2, // Allow retrying failed mutations twice
      retryDelay: 1000, // Fixed retry delay for mutations
    },
  },
});
