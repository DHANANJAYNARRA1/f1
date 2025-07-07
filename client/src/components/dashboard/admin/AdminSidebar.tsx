import { FaHome, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaFileAlt, FaHandshake, FaUser, FaListAlt, FaEye, FaComments, FaVideo, FaEnvelope } from 'react-icons/fa';
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
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
    <aside className="w-60 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4 flex flex-col">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">DASHBOARD</div>
        <ul className="space-y-2 flex-1">
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'users' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('users')}
            >
              <FaUsers className="mr-3" /> User Management
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'review-queries' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('review-queries')}
            >
              <FaComments className="mr-3" /> Investor Queries
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'founder-responses' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('founder-responses')}
            >
              <FaEnvelope className="mr-3" /> Founder Responses
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'submissions' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('submissions')}
            >
              <FaFileAlt className="mr-3" /> Product Submissions
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'admins' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('admins')}
            >
              <FaUser className="mr-3" /> Admin Management
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'service-requests' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('service-requests')}
            >
              <FaListAlt className="mr-3" /> Service Requests
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'zoom-calls' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('zoom-calls')}
            >
              <FaVideo className="mr-3" /> Zoom Calls
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'settings' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('settings')}
            >
              <FaCog className="mr-3" /> Settings
            </button>
          </li>
        </ul>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">NAVIGATION</div>
          <ul className="space-y-2">
            <li>
              <button 
                className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'home' ? 'bg-gray-700' : ''}`} 
                onClick={() => navigate('/')}
              >
                <FaHome className="mr-3" /> Home Page
              </button>
            </li>
            <li>
              <button 
                className="flex items-center w-full p-3 rounded-lg hover:bg-red-700 transition" 
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-800 select-none mt-auto">
        metavertex.co.uk
      </div>
    </aside>
  );
};

export default AdminSidebar;
