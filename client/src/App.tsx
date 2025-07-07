import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider } from './hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import UserDashboard from './pages/user-dashboard';
import AdminDashboard from './pages/admin-dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import FounderDashboard from './pages/founder-dashboard';
import InvestorDashboard from './pages/investor-dashboard';
import MentorDashboard from './pages/mentor-dashboard';
import NotFound from './pages/not-found';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/dashboard" component={UserDashboard} />
              <ProtectedRoute path="/admin" component={AdminDashboard} />
              <ProtectedRoute path="/superadmin" component={SuperAdminDashboard} />
              <ProtectedRoute path="/founder" component={FounderDashboard} />
              <ProtectedRoute path="/investor" component={InvestorDashboard} />
              <ProtectedRoute path="/mentor" component={MentorDashboard} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;