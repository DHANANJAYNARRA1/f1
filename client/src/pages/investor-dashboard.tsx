import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import InvestorSidebar from "@/components/dashboard/investor/InvestorSidebar";
import ExpressInterestModal from "@/components/dashboard/investor/ExpressInterestModal";
import { TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, Eye, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCatalogSection from "@/components/dashboard/investor/ProductCatalogSection";
import MyInterestsSection from "@/components/dashboard/investor/MyInterestsSection";

const InvestorDashboard = () => {
  const [activeSection, setActiveSection] = useState("discover");
  const { user, isLoading } = useAuth();

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Investor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name} • Track your investment activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Active Investor
          </Badge>
        </div>
      </div>

      {/* Investment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center justify-between">
              Total Investments
              <DollarSign className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">$2.4M</div>
            <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              Active Interests
              <Eye className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">8</div>
            <p className="text-xs text-green-600 mt-1">3 new this week</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-between">
              Portfolio Companies
              <Users className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">5</div>
            <p className="text-xs text-purple-600 mt-1">2 in due diligence</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center justify-between">
              Avg. ROI
              <TrendingUp className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">24.5%</div>
            <p className="text-xs text-orange-600 mt-1">+3.2% vs benchmark</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Investment Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: "AgriTech Smart Irrigation", amount: "$500K", date: "2 days ago", status: "Due Diligence" },
                { company: "Vertical Farming Platform", amount: "$750K", date: "1 week ago", status: "Term Sheet" },
                { company: "Drone Crop Monitoring", amount: "$300K", date: "2 weeks ago", status: "Closed" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.company}</p>
                    <p className="text-sm text-gray-500">{item.amount} • {item.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">AgriTech Market Growth</h4>
                <p className="text-sm text-blue-700 mt-1">Global market expected to reach $22.5B by 2027</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600 font-medium">+18.2% CAGR</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Investment Trends</h4>
                <p className="text-sm text-green-700 mt-1">Precision agriculture leads with 45% of investments</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600 font-medium">Hot Sector</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProducts = () => (
    <ProductCatalogSection />
  );

  const renderExpressInterest = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Express Interest
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect with Founders</h3>
          <p className="text-gray-600 mb-4">Select products that interest you and start conversations with founders</p>
          <p className="text-sm text-gray-500">Your identity remains anonymous until mutual interest is established</p>
        </div>
      </div>
    </div>
  );

  const renderMyInterests = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        My Investment Interests
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Your Interests</h3>
          <p className="text-gray-600 mb-4">Monitor the status of products you've expressed interest in</p>
          <p className="text-sm text-gray-500">Get notified when founders respond to your interests</p>
        </div>
      </div>
    </div>
  );

  const renderZoomCalls = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Scheduled Meetings
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Zoom Meetings</h3>
          <p className="text-gray-600 mb-4">Schedule and manage video calls with founders</p>
          <p className="text-sm text-gray-500">Connect directly with teams behind the products you're interested in</p>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'products':
        return renderProducts();
      case 'express-interest':
        return renderExpressInterest();
      case 'my-interests':
        return renderMyInterests();
      case 'zoom-calls':
        return renderZoomCalls();
      case 'discover':
        return renderProducts();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user || user.userType !== 'investor') {
    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-md m-4">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>
                        You are not authorized to view this page. Please log in as an Investor.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <InvestorSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default InvestorDashboard; 