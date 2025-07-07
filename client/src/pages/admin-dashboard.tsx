import { useState } from "react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import ProductSubmissions from "@/components/dashboard/admin/ProductSubmissions";
import ProductInterestsSection from "@/components/dashboard/admin/ProductInterestsSection";
import ProductAnalyticsSection from "@/components/dashboard/admin/ProductAnalyticsSection";
import ServiceRequestsSection from "@/components/dashboard/admin/ServiceRequestsSection";
import SettingsSection from "@/components/dashboard/admin/SettingsSection";
import ZoomCallsSection from "@/components/dashboard/admin/ZoomCallsSection";
import ReviewQueriesSection from '@/components/dashboard/admin/ReviewQueriesSection';
import AdminsSection from "@/components/dashboard/admin/AdminsSection";
import UsersSection from "@/components/dashboard/admin/UsersSection";
import FounderResponsesSection from "@/components/dashboard/admin/FounderResponsesSection";
import AdminManagementSection from '@/components/dashboard/admin/AdminManagementSection';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("users");

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UsersSection />;
      case "review-queries":
        return <ReviewQueriesSection />;
      case "founder-responses":
        return <FounderResponsesSection />;
      case "submissions":
        return <ProductSubmissions />;
      case "admins":
        return <AdminManagementSection />;
      case "service-requests":
        return <ServiceRequestsSection />;
      case "zoom-calls":
        return <ZoomCallsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <UsersSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-foreground">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;

