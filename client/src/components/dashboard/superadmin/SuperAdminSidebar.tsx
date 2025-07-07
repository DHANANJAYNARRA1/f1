import { Button } from '@/components/ui/button';
import { FaUsers, FaClipboardCheck, FaChartBar, FaCommentDots, FaUsersCog, FaConciergeBell, FaInbox, FaVideo, FaChartPie, FaCogs, FaHome, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface SuperAdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navItems = [
  { section: 'users', label: 'View All Users', icon: <FaUsers className="text-blue-400 flex-shrink-0" /> },
  { section: 'admin-management', label: 'Admin Management', icon: <FaUserShield className="text-green-400 flex-shrink-0" /> },
  { section: 'product-approval', label: 'Approve/Reject Products', icon: <FaClipboardCheck className="text-blue-400 flex-shrink-0" /> },
  { section: 'product-submissions', label: 'Product Submissions', icon: <FaClipboardCheck className="text-blue-400 flex-shrink-0" /> },
  { section: 'analytics', label: 'Product Popularity', icon: <FaChartBar className="text-blue-400 flex-shrink-0" /> },
  { section: 'interests', label: 'Investor Interest', icon: <FaCommentDots className="text-blue-400 flex-shrink-0" /> },
  { section: 'my-requests', label: 'My Requests', icon: <FaInbox className="text-blue-400 flex-shrink-0" /> },
  { section: 'zoom-calls', label: 'Zoom Calls', icon: <FaVideo className="text-blue-400 flex-shrink-0" /> },
  { section: 'visitors', label: 'Visitor Metrics', icon: <FaChartPie className="text-blue-400 flex-shrink-0" /> },
  { section: 'settings', label: 'Platform Settings', icon: <FaCogs className="text-blue-400 flex-shrink-0" /> },
];

const SuperAdminSidebar = ({ activeSection, setActiveSection }: SuperAdminSidebarProps) => {
  const { user, logoutMutation } = useAuth();
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
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen h-screen">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Superadmin</h2>
      </div>
      {user && (
        <div className="px-4 py-2 border-b border-gray-800">
          <div className="font-semibold text-base">{user.name || user.username}</div>
          <div className="text-xs text-gray-300 break-all">{user.email || user.username}</div>
          <div className="text-xs text-green-400 font-mono">{user.uniqueId}</div>
        </div>
      )}
      <nav className="flex-1 p-4 flex flex-col">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">MANAGEMENT</div>
        <ul className="space-y-1 flex-1">
          {navItems.map(item => (
            <li key={item.section}>
              <Button
                variant={activeSection === item.section ? "default" : "ghost"}
                className={`flex items-center w-full justify-start space-x-2 p-2 rounded-md hover:bg-gray-700 transition`}
                onClick={() => setActiveSection(item.section)}
              >
                {item.icon} <span className="truncate">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-6 mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">NAVIGATION</div>
        <ul className="space-y-1">
          <li>
            <Button
              variant="ghost"
              className={`flex items-center w-full justify-start space-x-2 p-2 rounded-md hover:bg-gray-700 transition`}
              onClick={() => navigate('/superadmin')}
            >
              <FaHome className="text-blue-400 flex-shrink-0" /> <span className="truncate">Home Page</span>
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={`flex items-center w-full justify-start space-x-2 p-2 rounded-md hover:bg-gray-700 text-red-400 transition`}
              onClick={handleLogout}
            >
              <FaSignOutAlt className="text-red-400 flex-shrink-0" /> <span className="truncate">Logout</span>
            </Button>
          </li>
        </ul>
      </nav>
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-800 select-none mt-auto">
        metavertex.co.uk
      </div>
    </aside>
  );
};

export default SuperAdminSidebar; 