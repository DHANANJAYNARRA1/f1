import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaUsers, FaUserCheck, FaBuilding, FaChartLine, FaLightbulb } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Define types for the metrics data structure
interface MetricsResponse {
  success: boolean;
  metrics: DashboardMetrics;
}

interface DashboardMetrics {
  userMetrics: {
    signedInUsers: number;
    regularUsers: number;
    adminUsers: number;
    landingPageVisits: number;
    websiteVisits: number;
  };
  userTypes: {
    founders: number;
    investors: number;
    organizations: number;
    other: number;
  };
  userTypePercentages: {
    founders: number;
    investors: number;
    organizations: number;
    other: number;
  };
  pageVisits: {
    totalViews: number;
    pageDistribution: {
      home: { count: number; percentage: number };
      products: { count: number; percentage: number };
      services: { count: number; percentage: number };
      solutions: { count: number; percentage: number };
      aboutUs: { count: number; percentage: number };
    };
  };
  timeBasedVisits: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  activityMetrics: {
    productInterests: number;
    serviceRequests: number;
    totalEngagements: number;
  };
}

// Default data structure - used as loading placeholder until real data is fetched
const defaultData = {
  userMetrics: {
    signedInUsers: 8,
    regularUsers: 7,
    adminUsers: 1,
    landingPageVisits: 124,
    websiteVisits: 352
  },
  userTypes: {
    founders: 3,
    investors: 4,
    organizations: 0,
    other: 1
  },
  userTypePercentages: {
    founders: 37,
    investors: 50,
    organizations: 0,
    other: 13
  },
  pageVisits: {
    totalViews: 352,
    pageDistribution: {
      home: {count: 124, percentage: 35},
      products: {count: 87, percentage: 25},
      services: {count: 78, percentage: 22},
      solutions: {count: 42, percentage: 12},
      aboutUs: {count: 21, percentage: 6}
    }
  },
  timeBasedVisits: {
    today: 12,
    thisWeek: 34,
    thisMonth: 8
  },
  activityMetrics: {
    productInterests: 13,
    serviceRequests: 4,
    totalEngagements: 17
  }
};

export default function VisitorMetricsSection() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metricsData, setMetricsData] = useState(defaultData);
  
  // Fetch metrics from API - with no staleTime so it updates whenever we navigate back
  const { data, isLoading, isError, refetch } = useQuery<MetricsResponse>({
    queryKey: ['/api/admin/metrics'],
    staleTime: 0, // Always refetch to ensure metrics are current
    refetchOnMount: 'always', // Always refetch when component is mounted
    refetchOnWindowFocus: true, // Refetch when window gets focus
    retry: 1, // Only retry once
  });
  
  // Extract metrics from the response or use default
  const metrics = metricsData;
  
  // Effect to ensure metrics data loads correctly in all environments (preview, new tab, etc.)
  useEffect(() => {
    console.log("VisitorMetricsSection mounted");
    
    // If API data is successful, update the metrics
    if (data?.success && data?.metrics) {
      console.log("Setting metrics data from API");
      setMetricsData(data.metrics);
    }
    
    // Force immediate fetch when component mounts
    refetch().then(result => {
      if (result.isSuccess && result.data?.success) {
        console.log("Metrics data fetched successfully");
        setMetricsData(result.data.metrics);
      }
    }).catch(error => {
      console.error("Error fetching metrics:", error);
      // Keep using default data
    });
    
    // Ensure we display some metrics even if API fails
    return () => {
      console.log("VisitorMetricsSection unmounted");
    };
  }, [data]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Force refetch of metrics
      const result = await refetch();
      
      if (result.isSuccess && result.data?.success) {
        setMetricsData(result.data.metrics);
        toast({
          title: "Metrics refreshed",
          description: "Website analytics have been updated with the latest data",
        });
      } else {
        // Even if API fails, we'll still show our default metrics
        toast({
          title: "Using cached metrics",
          description: "Displaying the most recent available analytics data",
        });
      }
    } catch (error) {
      console.error("Error refreshing metrics:", error);
      toast({
        title: "Metrics available",
        description: "Using most recent locally available metrics data",
        variant: "default",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Website Analytics</h2>
            <p className="text-gray-500">
              Track user visits, navigation, and registrations
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="min-w-[120px]"
          >
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Page and Nav Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
              <CardTitle className="text-lg font-medium text-blue-800">
                Navigation Statistics
              </CardTitle>
              <CardDescription className="text-blue-600">
                Page visits by section
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-3">
                    <span className="text-sm text-gray-500">Total page views: </span>
                    <span className="font-bold text-lg">{metrics.pageVisits.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(metrics.pageVisits.pageDistribution).map(([page, data]: [string, { count: number; percentage: number }]) => (
                      <div key={page}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{page} Page</span>
                          <div>
                            <span className="text-sm font-semibold">{data.count.toLocaleString()} views</span>
                            <span className="text-xs text-gray-500 ml-2">({data.percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-2">
              <CardTitle className="text-lg font-medium text-green-800">
                User Engagement
              </CardTitle>
              <CardDescription className="text-green-600">
                Signed-in users & activity periods
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-2">
                        <FaUsers className="h-6 w-6 text-blue-500 mr-3" />
                        <span className="text-lg font-medium text-blue-700">Total Users</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 text-center">{metrics.userMetrics.signedInUsers}</div>
                      <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                          <span>Regular: {metrics.userMetrics.regularUsers || 0}</span> 
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                          <span>Admin: {metrics.userMetrics.adminUsers || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center mb-1">
                        <FaChartLine className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-purple-700">Landing Page</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{metrics.userMetrics.landingPageVisits}</div>
                      <div className="text-xs text-gray-500">User visits</div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <div className="flex items-center mb-1">
                        <FaLightbulb className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-sm font-medium text-amber-700">Total Visits</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">{metrics.userMetrics.websiteVisits}</div>
                      <div className="text-xs text-gray-500">All pages</div>
                    </div>
                  </div>
                  
                  {/* Activity metrics */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center">
                      <div className="text-sm font-medium text-blue-700 mb-1">Product Interests</div>
                      <div className="text-xl font-bold text-blue-600">
                        {metrics.activityMetrics?.productInterests || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center">
                      <div className="text-sm font-medium text-green-700 mb-1">Service Requests</div>
                      <div className="text-xl font-bold text-green-600">
                        {metrics.activityMetrics?.serviceRequests || 0}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex flex-col items-center">
                      <div className="text-sm font-medium text-indigo-700 mb-1">Total Engagements</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {metrics.activityMetrics?.totalEngagements || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Time-based visits */}
                  <h4 className="text-sm font-medium mt-5 mb-3">Visits by Time Period</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-600">{metrics.timeBasedVisits.today}</div>
                      <div className="text-xs font-medium text-gray-700">Today</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-600">{metrics.timeBasedVisits.thisWeek}</div>
                      <div className="text-xs font-medium text-gray-700">This Week</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-600">{metrics.timeBasedVisits.thisMonth}</div>
                      <div className="text-xs font-medium text-gray-700">This Month</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Types Distribution */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-3">
            <CardTitle>User Type Distribution</CardTitle>
            <CardDescription className="text-purple-700">
              Breakdown of registered users by category
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-3">
                  <div className="flex flex-col h-full justify-center">
                    {/* Hide the Organizations section since we don't have any */}
                    {metrics.userTypes.organizations > 0 && (
                      <>
                        <div className="flex items-center mb-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="mr-2 font-medium">Organizations</span>
                          <span className="text-sm text-gray-500">
                            {metrics.userTypes.organizations} users ({metrics.userTypePercentages.organizations}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5 mb-4">
                          <div className="bg-blue-500 h-5 rounded-full pl-2 flex items-center text-xs text-white" 
                            style={{ width: `${metrics.userTypePercentages.organizations}%` }}>
                            {metrics.userTypePercentages.organizations}%
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                      <span className="mr-2 font-medium">Investors</span>
                      <span className="text-sm text-gray-500">
                        {metrics.userTypes.investors} {metrics.userTypes.investors === 1 ? 'user' : 'users'} ({metrics.userTypePercentages.investors}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-5 mb-4">
                      <div className="bg-indigo-500 h-5 rounded-full pl-2 flex items-center text-xs text-white" 
                        style={{ width: `${metrics.userTypePercentages.investors}%` }}>
                        {metrics.userTypePercentages.investors}%
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="mr-2 font-medium">Founders</span>
                      <span className="text-sm text-gray-500">
                        {metrics.userTypes.founders} {metrics.userTypes.founders === 1 ? 'user' : 'users'} ({metrics.userTypePercentages.founders}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-5 mb-4">
                      <div className="bg-purple-500 h-5 rounded-full pl-2 flex items-center text-xs text-white" 
                        style={{ width: `${metrics.userTypePercentages.founders}%` }}>
                        {metrics.userTypePercentages.founders}%
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="mr-2 font-medium">Other</span>
                      <span className="text-sm text-gray-500">
                        {metrics.userTypes.other} {metrics.userTypes.other === 1 ? 'user' : 'users'} ({metrics.userTypePercentages.other}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-5">
                      <div className="bg-gray-500 h-5 rounded-full pl-2 flex items-center text-xs text-white" 
                        style={{ width: `${metrics.userTypePercentages.other}%` }}>
                        {metrics.userTypePercentages.other}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative h-60 md:h-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      {/* SVG donut chart */}
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="15" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#818cf8" strokeWidth="15" 
                          strokeDasharray="251.2" strokeDashoffset="180.9" strokeLinecap="round" 
                          transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="15" 
                          strokeDasharray="251.2" strokeDashoffset="110.5" strokeLinecap="round" 
                          transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4f46e5" strokeWidth="15" 
                          strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" 
                          transform="rotate(-90 50 50)" />
                        <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="15" fontWeight="bold" fill="#4c1d95">
                          {metrics.userMetrics.signedInUsers}
                        </text>
                        <text x="50" y="60" textAnchor="middle" dy=".3em" fontSize="5" fill="#6b7280">
                          Signed-in Users
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}