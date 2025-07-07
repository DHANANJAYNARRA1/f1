import { FaUser, FaTasks, FaComments, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface MentorSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function MentorSidebar({ activeSection, setActiveSection, onLogout }: MentorSidebarProps) {
  return (
    <aside className="w-60 min-h-screen h-full flex-1 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h2>
      </div>
      <nav className="mt-6 flex-1">
        <ul className="flex flex-col h-full">
          <li className="px-6 py-3 hover:bg-gray-200">
            <Button
              variant={activeSection === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("profile")}
            >
              <FaUser className="mr-3" /> Profile
            </Button>
          </li>
          <li className="px-6 py-3 hover:bg-gray-200">
            <Button
              variant={activeSection === "mentees" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("mentees")}
            >
              <FaTasks className="mr-3" /> Mentees
            </Button>
          </li>
          <li className="px-6 py-3 hover:bg-gray-200">
            <Button
              variant={activeSection === "communication" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("communication")}
            >
              <FaComments className="mr-3" /> Communication
            </Button>
          </li>
          <li className="px-6 py-3 hover:bg-gray-200">
            <Button
              variant={activeSection === "settings" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection("settings")}
            >
              <FaCog className="mr-3" /> Settings
            </Button>
          </li>
          <li className="px-6 py-3 mt-auto hover:bg-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={onLogout}
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </Button>
          </li>
        </ul>
      </nav>
      <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-800 select-none mt-auto">
        metavertex.co.uk
      </div>
    </aside>
  );
}
