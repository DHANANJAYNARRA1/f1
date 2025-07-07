import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { FaLeaf, FaBox, FaCogs, FaUser, FaSignOutAlt, FaHome, FaListAlt, FaBars, FaTimes, FaCrown } from "react-icons/fa";
import { FaChartLine, FaLightbulb, FaHandshake, FaVideo } from "react-icons/fa";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

type UserSidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userType?: 'founder' | 'investor' | 'organization' | 'other' | 'mentor';
};

export default function UserSidebar({ activeSection, setActiveSection, userType }: UserSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Close the sidebar when a menu item is clicked on mobile and ensure proper navigation
  const handleMenuItemClick = (section: string) => {
    setActiveSection(section);
    // Always close mobile sidebar after clicking
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
    // Small delay to allow state to update
    setTimeout(() => {
      // Scroll to top of main content area when section changes
      const mainContent = document.querySelector('[data-main-content]');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      setIsOpen(false); // Close sidebar
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="w-60 min-h-screen h-full flex-1 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2">User</h2>
      </div>
      <nav className="flex-1 p-4 flex flex-col">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">DASHBOARD</div>
        <ul className="space-y-2 flex-1">
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition`}>
              Dashboard
            </button>
          </li>
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition`}>
              My Products
            </button>
          </li>
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition`}>
              My Requests
            </button>
          </li>
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition`}>
              Profile
            </button>
          </li>
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition`}>
              Home Page
            </button>
          </li>
          <li>
            <button className={`flex items-center w-full p-3 rounded-lg hover:bg-red-700 transition`}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-800 select-none mt-auto">
        metavertex.co.uk
      </div>
    </aside>
  );
}