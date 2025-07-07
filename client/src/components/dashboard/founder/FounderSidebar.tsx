import { FaHome, FaBox, FaComments, FaVideo, FaSignOutAlt, FaPlus, FaChartBar, FaHourglassHalf, FaEye, FaUsers } from 'react-icons/fa';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface FounderSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const FounderSidebar = ({ activeSection, setActiveSection }: FounderSidebarProps) => {
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
      <h2 className="text-2xl font-bold mb-4">Founder Dashboard</h2>
      <nav className="flex flex-col space-y-2 flex-grow">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">DASHBOARD</div>
        <ul className="space-y-2 flex-1">
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'add-product' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('add-product')}
            >
              <FaPlus className="mr-3" /> Add Product
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'products' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('products')}
            >
              <FaBox className="mr-3" /> My Products
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'tracking' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('tracking')}
            >
              <FaChartBar className="mr-3" /> Tracking Analysis
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'pending' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('pending')}
            >
              <FaHourglassHalf className="mr-3" /> Pending
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'view-product' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('view-product')}
            >
              <FaEye className="mr-3" /> View Product
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'discussion' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('discussion')}
            >
              <FaComments className="mr-3" /> Ongoing Discussion
            </button>
          </li>
          <li>
            <button 
              className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition ${activeSection === 'investor-interest' ? 'bg-gray-700' : ''}`} 
              onClick={() => setActiveSection('investor-interest')}
            >
              <FaUsers className="mr-3" /> View Interest of Products by Investor
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

export default FounderSidebar; 