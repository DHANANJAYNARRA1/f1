import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser, User, InsertProduct } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient, apiRawRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  saveToLocalStorage, 
  getFromLocalStorage, 
  removeFromLocalStorage,
  LOCAL_STORAGE_KEYS 
} from "@/lib/localStorageService";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, InsertUser>;
  registerFounderMutation: UseMutationResult<any, Error, FormData>;
  expressInterest: UseMutationResult<void, Error, { productId: string, source?: string }>;
  addProductMutation: UseMutationResult<any, Error, InsertProduct>;
  founderStep: 'register' | 'upload' | 'pending';
  setFounderStep: React.Dispatch<React.SetStateAction<'register' | 'upload' | 'pending'>>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [founderStep, setFounderStep] = useState<'register' | 'upload' | 'pending'>('register');
  const {
    data: userData,
    error,
    isLoading,
    refetch: refetchUserData
  } = useQuery<{ success: boolean, user: User } | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // More aggressive fetching for auth state
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000, // Consider auth data stale after 1 second
    retry: 3, // Retry failed auth requests up to 3 times
  });
  
  // Effect to ensure auth state is consistent in all environments
  useEffect(() => {
    console.log("Auth provider: Initializing auth state");
    
    // Try getting auth data from localStorage first with a longer expiry time
    const cachedAuth = getFromLocalStorage<{ success: boolean, user: User }>(
      LOCAL_STORAGE_KEYS.AUTH_USER,
      3600000 // 1 hour expiry - better user experience
    );
    
    if (cachedAuth?.success && cachedAuth.user) {
      console.log("Auth provider: Found cached auth state in localStorage");
      // Set cached data immediately to prevent loading flicker
      queryClient.setQueryData(["/api/user"], cachedAuth);
      
      // Prefetch user's appropriate dashboard based on type
      const dashboardPath = cachedAuth.user.isAdmin 
        ? "/admin" 
        : cachedAuth.user.userType === "founder" 
          ? "/founder" 
          : cachedAuth.user.userType === "investor" 
            ? "/investor" 
            : "/dashboard";
            
      // Preload the dashboard component
      import(`@/pages${dashboardPath.replace('/', '-')}-dashboard.tsx`).catch(() => {});
    }
    
    // Fetch fresh auth data, but don't block rendering
    setTimeout(() => {
      refetchUserData().then(result => {
        // Get the data from the result
        const authResponse = result?.data;
        
        if (authResponse?.success && authResponse.user) {
          console.log("Auth provider: Updating localStorage with fresh auth data");
          saveToLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, authResponse);
        } else if (authResponse && !authResponse.success) {
          console.log("Auth provider: Not authenticated, removing cached auth data");
          removeFromLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER);
        }
      }).catch(error => {
        console.error("Auth provider: Error fetching auth data", error);
      });
    }, 500); // Small delay to prioritize UI rendering
  }, [refetchUserData]);
  
  // Extract the user data from the response
  const user = userData?.success ? userData.user : null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const data = await apiRequest<{ success: boolean; user: User; message?: string }>("POST", "/api/login", credentials);
      return data.user;
    },
    onSuccess: (user: User) => {
      if (!user || typeof user !== 'object') {
        toast({
          title: "Login failed",
          description: "Received invalid user data from server.",
          variant: "destructive",
        });
        return;
      }
      // Save auth data to localStorage first
      const authData = { success: true, user };
      saveToLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, authData);
      
      // Then update React Query cache
      queryClient.setQueryData(["/api/user"], authData);
      
      // Reset any existing data to ensure clean state for new session
      if (typeof window !== 'undefined') {
        // Clear all existing queries to ensure fresh data load
        queryClient.removeQueries();
      }
      
      // Prepare redirect destination based on user role
      let destination = "/dashboard";
      if (user.role === "superadmin") {
        destination = "/superadmin";
      } else if (user.isAdmin) {
        destination = "/admin";
      } else if (user.userType === "founder") {
        destination = "/founder-dashboard";
      } else if (user.userType === "investor") {
        destination = "/investor-dashboard";
      }
      // If user is both superadmin and isAdmin, always redirect to /superadmin
      if (user.role === "superadmin" && user.isAdmin) {
        destination = "/superadmin";
      }
      
      // Show toast notification
      toast({
        title: user.isAdmin ? "Admin Login Successful" : "Login Successful",
        description: `Welcome back, ${user.name}!`,
        variant: "default",
      });
      
      // Plain JS redirect - most reliable method
      window.location.href = destination;
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const data = await apiRequest<{ success: boolean; user: User; message?: string }>("POST", "/api/register", credentials);
      return data.user;
    },
    onSuccess: (user: User) => {
      // Save auth data to localStorage and update React Query cache
      const authData = { success: true, user };
      saveToLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER, authData);
      queryClient.setQueryData(["/api/user"], authData);
      queryClient.invalidateQueries({ queryKey: ['verifiedProducts'] });

      // Determine redirect destination
      let destination = "/dashboard";
      if (user.userType === "founder") {
        destination = "/founder-dashboard";
      } else if (user.userType === "investor") {
        destination = "/investor-dashboard";
      }

      toast({
        title: "Registration Successful",
        description: "Welcome! Redirecting you to your dashboard...",
        variant: "default",
      });

      // Redirect to the appropriate dashboard
      window.location.href = destination;
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerFounderMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Use the raw request to handle non-JSON responses gracefully
      const res = await apiRawRequest("POST", "/api/register/founder", formData);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        // If parsing fails, it might be a plain text success or error message
        if (res.ok) {
          return { success: true, message: text };
        } else {
          throw new Error(text);
        }
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], { success: false, message: "Not authenticated" });
      window.location.href = "/auth";
      toast({
        title: "Registration Submitted",
        description: "Your application is under review. We will notify you upon verification.",
        variant: "default",
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear auth data from localStorage first
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.AUTH_USER);
      
      // Remove cached admin data
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_USERS);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_INTERESTS);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_SERVICES);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.ADMIN_METRICS);
      
      // Set null state in the correct format
      queryClient.setQueryData(["/api/user"], { success: false, message: "Not authenticated" });
      
      // Immediate redirect to home page
      window.location.href = "/auth";
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/product-interests"] });
      
      toast({
        title: "Logged out successfully",
        variant: "default",
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const expressInterest = useMutation({
    mutationFn: async ({ productId, source }: { productId: string, source?: string }) => {
      console.log(`Expressing interest in product ${productId} via ${source || 'direct'}`);
      await apiRequest("POST", "/api/product-interests", { productId, source });
    },
    onSuccess: () => {
      // Invalidate product interests cache
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-interests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/product-interests"] });
      
      toast({
        title: "Interest recorded",
        description: "Thank you! We'll contact you about this product soon.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record interest",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const data = await apiRequest<{ success: boolean; product?: any }>("POST", "/api/products", productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        registerFounderMutation,
        expressInterest,
        addProductMutation,
        founderStep,
        setFounderStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
