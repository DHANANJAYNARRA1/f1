import { useState } from "react";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import ProductSubmissions from "@/components/dashboard/admin/ProductSubmissions";
import ProductInterestsSection from "@/components/dashboard/admin/ProductInterestsSection";
import ProductAnalyticsSection from "@/components/dashboard/admin/ProductAnalyticsSection";
import MentorSuggestionsSection from "@/components/dashboard/admin/MentorSuggestionsSection";
import ServiceRequestsSection from "@/components/dashboard/admin/ServiceRequestsSection";
import SubscriptionPlansSection from "@/components/dashboard/admin/SubscriptionPlansSection";
import SettingsSection from "@/components/dashboard/admin/SettingsSection";
import VisitorMetricsSection from "@/components/dashboard/admin/VisitorMetricsSection";
import MyRequestsSection from "@/components/dashboard/admin/MyRequestsSection";
import ZoomCallsSection from "@/components/dashboard/admin/ZoomCallsSection";
import ReviewQueriesSection from '@/components/dashboard/admin/ReviewQueriesSection';
import AdminsSection from "@/components/dashboard/admin/AdminsSection";
import UsersSection from "@/components/dashboard/admin/UsersSection";
import FounderResponsesSection from "@/components/dashboard/admin/FounderResponsesSection";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("review-queries");

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
      case "service-requests":
        return <ServiceRequestsSection />;
      case "subscription-plans":
        return <SubscriptionPlansSection />;
      case "zoom-calls":
        return <ZoomCallsSection />;
      case "review-queries":
        return <ReviewQueriesSection />;
      case "founder-responses":
        return <FounderResponsesSection />;
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
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;
