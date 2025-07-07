import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export function ProtectedRoute({ component: Component, ...props }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return <Component {...props} />;
}