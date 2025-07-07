import { FaHome, FaSearch, FaHeart, FaVideo, FaSignOutAlt, FaHandshake } from 'react-icons/fa';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Bell, Bookmark, Search, Settings } from 'lucide-react';

interface InvestorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const NavItem = ({ sectionName, activeSection, setActiveSection, children }: any) => {
  const isActive = activeSection === sectionName;
  return (
    <button
      onClick={() => setActiveSection(sectionName)}
      className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200 rounded-lg ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
};

const InvestorSidebar = ({ activeSection, setActiveSection }: InvestorSidebarProps) => {
  const { logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="w-60 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Investor Dashboard</h2>
      <nav className="flex-grow">
        <ul className="space-y-2">
          <NavItem sectionName="discover" activeSection={activeSection} setActiveSection={setActiveSection}>
            <Search className="h-5 w-5" />
            <span className="font-medium">Discover</span>
          </NavItem>
          <NavItem sectionName="interests" activeSection={activeSection} setActiveSection={setActiveSection}>
            <Bookmark className="h-5 w-5" />
            <span className="font-medium">My Interests</span>
          </NavItem>
          {/* <NavItem sectionName="settings" activeSection={activeSection} setActiveSection={setActiveSection}>
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </NavItem> */}
        </ul>
      </nav>
    </aside>
  );
};

export default InvestorSidebar;
