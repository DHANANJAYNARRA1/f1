import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthForm } from "@/components/auth/AuthForm";
import { Loader2 } from "lucide-react";
import { FaLeaf, FaUserLock, FaChartLine } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      let destination = "/dashboard";
      if (user.role === "superadmin") {
        destination = "/superadmin";
      } else if (user.isAdmin) {
        destination = "/admin";
      } else if (user.userType === 'founder') {
        destination = "/founder-dashboard";
      } else if (user.userType === 'investor') {
        destination = "/investor-dashboard";
      }
      window.location.href = destination;
    }
  }, [user, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show the auth page
  return (
    <div className="min-h-screen flex flex-col with-navbar-padding">
      {/* <Navbar /> */}
      <main className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-12">
        <AuthForm />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
