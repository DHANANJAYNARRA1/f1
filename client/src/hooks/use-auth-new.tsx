import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, InsertUser>;
  expressInterest: UseMutationResult<void, Error, { productId: string, source?: string }>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<{ success: boolean, user: User } | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const user = userData?.success ? userData.user : null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const data = await apiRequest<{ success: boolean; user: User; message?: string }>("POST", "/api/login", credentials);
      return data.user;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], { success: true, user });
      
      toast({
        title: user.isAdmin ? "Admin Login Successful" : "Login Successful",
        description: `Welcome back, ${user.name}!`,
        variant: "default",
      });
      
      const destination = user.role === 'superadmin' ? '/superadmin' : user.isAdmin ? '/admin' : '/dashboard';
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
      const data = await apiRequest<{ success: boolean; message?: string }>("POST", "/api/register", credentials);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], { success: false, message: "Not authenticated" });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in to continue.",
        variant: "default",
      });
      
      window.location.href = "/auth";
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
      queryClient.setQueryData(["/api/user"], { success: false, message: "Not authenticated" });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged out successfully",
        variant: "default",
      });
      
      window.location.href = "/";
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
      await apiRequest("POST", "/api/product-interest", { productId, source });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-interests"] });
      
      toast({
        title: "Interest recorded",
        description: "Thank you! We'll contact you about this product soon.",
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

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        expressInterest,
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