import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import UserSidebar from "@/components/dashboard/user/UserSidebar";

// Import components directly instead of lazy loading for instant navigation
import ProductsSection from "@/components/dashboard/user/ProductsSection";
import ServicesSection from "@/components/dashboard/user/ServicesSection";
import ProfileSection from "@/components/dashboard/user/ProfileSection";
import UserRequestsSection from "@/components/dashboard/user/UserRequestsSection";
import SubscriptionPlansSection from "@/components/dashboard/user/SubscriptionPlansSection";

export default function UserDashboard() {
  const { user } = useAuth();
  
  // Use wouter for location and navigation
  const [location, setLocation] = useState(window.location);
  
  // Get tab from URL query if available
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab");
  
  const [activeSection, setActiveSection] = useState(() => {
    if (tabParam === "services") return "services";
    if (tabParam === "requests") return "requests";
    if (tabParam === "profile") return "profile";
    return "products";
  });

  // Update URL when section changes
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    newParams.set("tab", activeSection);
    
    // Use window.history without triggering page reload
    window.history.pushState(
      null, 
      "", 
      `${location.pathname}?${newParams.toString()}`
    );
  }, [activeSection, location]);
  
  // Listen for custom section change events from child components
  useEffect(() => {
    const handleSectionChange = (event: Event) => {
      const customEvent = event as CustomEvent<{section: string}>;
      if (customEvent.detail && customEvent.detail.section) {
        setActiveSection(customEvent.detail.section);
      }
    };
    
    window.addEventListener('change-section', handleSectionChange);
    
    return () => {
      window.removeEventListener('change-section', handleSectionChange);
    };
  }, []);

  // Render only the active section component
  const renderActiveSection = () => {
    switch (activeSection) {
      case "products":
        return <ProductsSection />;
      case "services":
        return <ServicesSection />;
      case "requests":
        return <UserRequestsSection />;
      case "subscription":
        return <SubscriptionPlansSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return <ProductsSection />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 mt-0 items-stretch">
      <UserSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 overflow-auto md:pt-0 pt-[72px] flex flex-col">
        <div className="p-4 sm:p-6 pt-4 flex-1 flex flex-col">
          {/* Welcome Banner with User Type - Responsive */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-primary">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome, {user?.name}!</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {user?.username && <span>Logged in as <span className="opacity-75">{user.username}</span></span>}
                  <span className="hidden xs:inline"><br/></span>
                  <span className="xs:hidden"> · </span>
                  <span className="line-clamp-1">Explore our products and services</span>
                </p>
              </div>
              
              {user?.userType && (
                <div className="mt-3 md:mt-0 flex items-center bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm">
                  <div className={`
                    rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3
                    ${user.userType === 'founder' ? 'bg-purple-100' : 
                      user.userType === 'investor' ? 'bg-blue-100' : 
                      user.userType === 'organization' ? 'bg-green-100' : 'bg-gray-100'}
                  `}>
                    <span className={`
                      text-base sm:text-lg
                      ${user.userType === 'founder' ? 'text-purple-600' : 
                        user.userType === 'investor' ? 'text-blue-600' : 
                        user.userType === 'organization' ? 'text-green-600' : 'text-gray-600'}
                    `}>
                      {user.userType === 'founder' ? '👨‍💻' : 
                       user.userType === 'investor' ? '💼' : 
                       user.userType === 'organization' ? '🏢' : '👤'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium capitalize text-sm">
                      {user.userType}
                    </span>
                    <span className="text-xs block text-gray-500">Account Type</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Section Title - Only on mobile */}
          <div className="md:hidden mb-4">
            <h2 className="text-lg font-semibold capitalize text-gray-800">
              {activeSection === "products" ? "Our Products" : 
               activeSection === "services" ? "Available Services" :
               activeSection === "requests" ? "Your Service Requests" :
               activeSection === "profile" ? "Your Profile" : activeSection}
            </h2>
            <p className="text-xs text-gray-500">
              {activeSection === "products" ? "Browse our product catalog" : 
               activeSection === "services" ? "Explore services tailored for you" :
               activeSection === "requests" ? "Track your service request status" :
               activeSection === "profile" ? "View and edit your profile information" : ""}
            </p>
          </div>
          
          {/* Dynamic Content - Only render the active section */}
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}
