import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import FounderSidebar from "@/components/dashboard/founder/FounderSidebar";
import AddProductSection from "@/components/dashboard/founder/AddProductSection";
import ProductsSection from '@/components/dashboard/founder/ProductsSection';
import InvestorInterestList from '@/components/dashboard/founder/InvestorInterestList';
import ResponsesSection from "@/components/dashboard/founder/ResponsesSection";
import ZoomCallSection from "@/components/dashboard/founder/ZoomCallSection";
import TrackingAnalysisSection from '@/components/dashboard/founder/TrackingAnalysisSection';
import PendingSection from '@/components/dashboard/founder/PendingSection';
import ViewProductSection from '@/components/dashboard/founder/ViewProductSection';
import OngoingDiscussionSection from '@/components/dashboard/founder/OngoingDiscussionSection';
import InvestorInterestSection from '@/components/dashboard/founder/InvestorInterestSection';
import { TrendingUp, DollarSign, Users, Eye, Star, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PendingVerification from '@/components/dashboard/founder/PendingVerification';
import MyDocumentsSection from '@/components/dashboard/founder/MyDocumentsSection';

const FounderDashboard = () => {
  const [activeSection, setActiveSection] = useState("products");
  const { user, isLoading } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case "add-product":
        return <AddProductSection />;
      case "products":
        return <ProductsSection />;
      case "tracking":
        return <TrackingAnalysisSection />;
      case "pending":
        return <PendingSection />;
      case "view-product":
        return <ViewProductSection />;
      case "discussion":
        return <OngoingDiscussionSection />;
      case "investor-interest":
        return <InvestorInterestSection />;
      case "investor-interests":
        return <InvestorInterestList />;
      case "responses":
        return <ResponsesSection />;
      case "zoom-calls":
        return <ZoomCallSection />;
      default:
        return <div>Select a section</div>;
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  // If user is not approved, show the pending verification screen
  if (user && user.verificationStatus !== 'approved') {
    return <PendingVerification />;
  }

  // Handle case where user is not a founder or data is missing
  if (!user || user.userType !== 'founder') {
    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-md m-4">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>
                        You are not authorized to view this page. Please log in as a Founder.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
  }

  // Verified Founder Dashboard
  return (
    <div className="flex h-screen bg-gray-100">
      <FounderSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <MyDocumentsSection />
        {renderSection()}
      </main>
    </div>
  );
};

export default FounderDashboard; 