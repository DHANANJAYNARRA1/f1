import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import VisitorMetricsSection from './VisitorMetricsSection';
import ZoomCallsSection from './ZoomCallsSection';
import InvestorRequestsSection from './InvestorRequestsSection';
import AdminSidebar from "./AdminSidebar";
import ProductSubmissions from "./ProductSubmissions";
import ProductInterestsSection from "./ProductInterestsSection";
import ProductAnalyticsSection from "./ProductAnalyticsSection";
import MentorSuggestionsSection from "./MentorSuggestionsSection";
import SettingsSection from "./SettingsSection";
import MyRequestsSection from "./MyRequestsSection";
import AdminsSection from "./AdminsSection";
import UsersSection from "./UsersSection";

interface ProductRequest {
  _id: string;
  userName: string;
  productId: string;
  userType: string;
  uniqueId?: string;
}

const AdminDashboard: React.FC = () => {
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [admin, setAdmin] = useState<any>(null);
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("analytics");

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin-login');
  };

  const handleApprove = (id: string) => {
    // Implement approve functionality
  };

  const handleReject = (id: string) => {
    // Implement reject functionality
  };

  if (!admin) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "submissions":
        return <ProductSubmissions />;
      case "interests":
        return <ProductInterestsSection />;
      case "analytics":
        return <ProductAnalyticsSection />;
      case "mentor-suggestions":
        return <MentorSuggestionsSection />;
      case "zoom-calls":
        return <ZoomCallsSection />;
      case "investor-requests":
        return <InvestorRequestsSection />;
      case "settings":
        return <SettingsSection />;
      case "visitor-metrics":
        return <VisitorMetricsSection />;
      case "my-requests":
        return <MyRequestsSection />;
      case "admins":
        return <AdminsSection />;
      case "users":
        return <UsersSection />;
      default:
        return <ProductAnalyticsSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <div className="mb-4 text-lg font-semibold text-blue-700">Welcome, {admin.name}!</div>
        
        {/* Render the active section */}
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard; 