import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/home-page";
import SolutionsPage from "./pages/solutions-page";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

// Lazy load components to improve initial load time
const FounderDashboard = lazy(() => import("@/pages/founder-dashboard"));
const InvestorDashboard = lazy(() => import("@/pages/investor-dashboard"));
const MentorDashboard = lazy(() => import("@/pages/mentor-dashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("@/pages/SuperAdminDashboard"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const AdminLoginPage = lazy(() => import("@/pages/admin-login"));
const AddProductPage = lazy(() => import("@/pages/add-product-page"));
const BrowseProductsPage = lazy(() => import("@/pages/browse-products-page"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const UserDashboard = lazy(() => import("@/pages/user-dashboard"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail-page"));

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/solutions" component={SolutionsPage} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute
              path="/founder-dashboard"
              component={FounderDashboard}
              allowedRoles={['founder']}
            />
            <ProtectedRoute
              path="/investor-dashboard"
              component={InvestorDashboard}
              allowedRoles={['investor']}
            />
            <ProtectedRoute
              path="/mentor-dashboard"
              component={MentorDashboard}
              allowedRoles={['mentor']}
            />
            <ProtectedRoute
              path="/admin"
              component={AdminDashboard}
              allowedRoles={['admin']}
            />
            <Route path="/admin-login" component={AdminLoginPage} />
            <ProtectedRoute path="/chat" component={ChatPage} />
            <ProtectedRoute
              path="/superadmin"
              component={SuperAdminDashboard}
              allowedRoles={['superadmin']}
            />
            <ProtectedRoute
              path="/user-dashboard"
              component={UserDashboard}
              allowedRoles={['organization', 'other']}
            />
            <ProtectedRoute path="/product/:id" component={ProductDetailPage} />
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Suspense>
      </MainLayout>
      <Toaster />
    </AuthProvider>
  );
}

export default App;