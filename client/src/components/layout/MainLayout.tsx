import { useLocation } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const [location] = useLocation();

  // Define paths where Navbar and Footer should not be shown
  const noLayoutPaths = [
    "/admin",
    "/superadmin",
    "/founder-dashboard",
    "/investor-dashboard",
    "/mentor-dashboard",
    "/user-dashboard",
  ];

  // Check if the current path starts with any of the no-layout paths
  const hideLayout = noLayoutPaths.some(path => location.startsWith(path));

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout; 