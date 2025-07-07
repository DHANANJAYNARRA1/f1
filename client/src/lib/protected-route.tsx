import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect, RouteComponentProps } from "wouter";

// A simple, centered loader for the auth check
const AuthLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Defines the properties for the ProtectedRoute component
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<RouteComponentProps<any>>;
  allowedRoles?: string[]; // Optional: list of roles that can access the route
}

export function ProtectedRoute({ path, component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, founderStep } = useAuth();

  // 1. Show a loader while the authentication status is being determined
  if (isLoading) {
    return <AuthLoader />;
  }

  // If a founder has just registered and hasn't uploaded documents, keep them on the auth page.
  if (user && user.userType === 'founder' && founderStep === 'upload') {
     if (path === '/auth') {
       return <Route path={path} component={Component} />;
     } else {
       return <Redirect to="/auth" />;
     }
  }

  // 2. If the user is not authenticated, redirect them to the login page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // 3. If the route requires specific roles, check if the user has one of them
  const userRole = user.role || user.userType; // Handle both 'role' and 'userType' for consistency
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // If the user's role is not allowed, redirect them to a default page.
    // For simplicity, we redirect to the main auth page, but this could be a generic dashboard.
    return <Redirect to="/auth" />;
  }

  // 4. If all checks pass, render the requested component
  return <Route path={path} component={Component} />;
}
