import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import './index.css';

// Import components
import { AuthProvider } from './hooks/use-auth';
import ProtectedRoute from './lib/protected-route';
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import UserDashboard from './pages/user-dashboard';
import AdminDashboard from './pages/admin-dashboard';
import FounderDashboard from './pages/founder-dashboard';
import InvestorDashboard from './pages/investor-dashboard';
import MentorDashboard from './pages/mentor-dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminLogin from './pages/admin-login';
import NotFound from './pages/not-found';
import { Toaster } from './components/ui/toaster';

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
              <Route path="/admin-login" component={AdminLogin} />
              
              <ProtectedRoute path="/dashboard" userType="user">
                <UserDashboard />
              </ProtectedRoute>
              
              <ProtectedRoute path="/admin-dashboard" userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
              
              <ProtectedRoute path="/founder-dashboard" userType="founder">
                <FounderDashboard />
              </ProtectedRoute>
              
              <ProtectedRoute path="/investor-dashboard" userType="investor">
                <InvestorDashboard />
              </ProtectedRoute>
              
              <ProtectedRoute path="/mentor-dashboard" userType="mentor">
                <MentorDashboard />
              </ProtectedRoute>
              
              <ProtectedRoute path="/superadmin-dashboard" userType="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
              
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);