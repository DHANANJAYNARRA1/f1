import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductInterest, User } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FaUsers, FaChartBar, FaHistory, FaPercentage, FaSync, 
  FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaEye,
  FaClipboardCheck
} from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { socket } from '@/socket';

type ProductCount = {
  name: string;
  count: number;
  percentage: number;
};

type MonthlyInterest = {
  month: string;
  count: number;
};

type SourceData = {
  name: string;
  value: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Updated product mapping to match numeric IDs used in the application
const PRODUCT_NAMES: Record<string, string> = {
  "1": "Hydroponics",
  "2": "ECG Monitoring",
  "3": "Health Parameter System",
  "4": "Terrace Garden",
  // Keep string keys for backward compatibility
  "hydroponics": "Hydroponics",
  "ecg": "ECG Monitoring",
  "hps": "Health Parameter System",
  "terrace-garden": "Terrace Garden"
};

type ProductAnalyticsSectionProps = {
  approvalMode?: boolean;
};

export default function ProductAnalyticsSection({ approvalMode = false }: ProductAnalyticsSectionProps) {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [adminApprovedText, setAdminApprovedText] = useState('');
  const [adminApprovedFounderText, setAdminApprovedFounderText] = useState('');
  
  const { 
    data: productInterestsResponse, 
    isLoading: interestsLoading,
    refetch: refetchInterests 
  } = useQuery<{success: boolean, interests: ProductInterest[]}>({
    queryKey: ["/api/admin/product-interests"],
    staleTime: 30000, // 30 seconds - cache remains fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep unused data in cache for 5 min
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false // Don't refresh in background
  });
  
  const { 
    data: usersResponse, 
    isLoading: usersLoading,
    refetch: refetchUsers 
  } = useQuery<{success: boolean, users: User[]}>({
    queryKey: ["/api/admin/users"],
    staleTime: 30000, // 30 seconds - cache remains fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep unused data in cache for 5 min
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false // Don't refresh in background
  });
  
  // Function to refresh all data
  const refreshAnalytics = () => {
    refetchInterests();
    refetchUsers();
    toast({
      title: "Analytics Refreshed",
      description: "The product analytics data has been updated."
    });
  };
  
  // Extract the actual arrays from the response
  const productInterests = productInterestsResponse?.success ? productInterestsResponse.interests || [] : [];
  const users = usersResponse?.success ? usersResponse.users || [] : [];

  // Calculate product interest counts
  const getProductCounts = (): ProductCount[] => {
    const counts: Record<string, number> = {};
    
    productInterests.forEach(interest => {
      counts[interest.productId] = (counts[interest.productId] || 0) + 1;
    });
    
    const total = productInterests.length;
    return Object.entries(counts).map(([id, count]) => ({
      name: PRODUCT_NAMES[id] || id,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  };

  // Calculate monthly trends
  const getMonthlyTrends = (): MonthlyInterest[] => {
    const monthlyData: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize with zeros
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[months[monthIndex]] = 0;
    }
    
    // Fill in actual data
    productInterests.forEach(interest => {
      const date = new Date(interest.createdAt);
      const monthName = months[date.getMonth()];
      
      // Only count last 6 months
      if (monthName in monthlyData) {
        monthlyData[monthName] += 1;
      }
    });
    
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    }));
  };
  
  // Calculate source data
  const getSourceData = (): SourceData[] => {
    const sources: Record<string, number> = {};
    
    productInterests.forEach(interest => {
      const source = interest.source || "Website";
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  };
  
  const productCounts = getProductCounts();
  const monthlyTrends = getMonthlyTrends();
  const sourceData = getSourceData();

  // Recent product interests with uniqueness by user
  const recentInterestsTemp = [...productInterests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  // Create a map of users to their product interests
  const userInterestMap = new Map();
  
  // Group interests by user
  recentInterestsTemp.forEach(interest => {
    if (!userInterestMap.has(interest.userId)) {
      userInterestMap.set(interest.userId, {
        userId: interest.userId,
        userName: interest.userName,
        products: [],
        latestDate: new Date(interest.createdAt),
        sources: new Set()
      });
    }
    
    const userEntry = userInterestMap.get(interest.userId);
    // Add product if not already in the list
    if (!userEntry.products.includes(interest.productId)) {
      userEntry.products.push(interest.productId);
    }
    
    // Add source if present
    if (interest.source) {
      userEntry.sources.add(interest.source);
    }
    
    // Update date if this interest is newer
    const interestDate = new Date(interest.createdAt);
    if (interestDate > userEntry.latestDate) {
      userEntry.latestDate = interestDate;
    }
  });
  
  // Convert map to array and take the 10 most recent users
  const recentInterests = Array.from(userInterestMap.values())
    .sort((a, b) => b.latestDate.getTime() - a.latestDate.getTime())
    .slice(0, 10);
    
  // User stats
  const totalUsers = users.length;
  const totalFounders = users.filter(user => user.userType === 'founder').length;
  const adminUsers = users.filter(user => user.isAdmin).length;
  const regularUsers = totalUsers - adminUsers;
  
  // Count unique users with interests
  const uniqueUserIds = new Set(productInterests.map(interest => interest.userId));
  const usersWithInterests = uniqueUserIds.size;
  
  // Engagement percentage
  const engagementRate = totalUsers > 0 ? Math.round((usersWithInterests / totalUsers) * 100) : 0;

  const isLoading = interestsLoading || usersLoading;
  
  // Handle product approvals
  const approveProduct = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('PATCH', `/api/admin/products/${productId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Product Approved",
        description: "The product has been approved and is now available to all users.",
      });
      refetchInterests();
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message || "There was an error approving the product",
        variant: "destructive"
      });
    }
  });

  const rejectProduct = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('PATCH', `/api/admin/products/${productId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Product Rejected",
        description: "The product has been rejected and is not available to users.",
      });
      refetchInterests();
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "There was an error rejecting the product",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    function handleFormReviewed(data: any) {
      toast({ title: 'Review Complete', description: 'Submission has been reviewed and sent.' });
      setSelectedReview(null);
      setAdminApprovedText('');
      setAdminApprovedFounderText('');
    }
    socket.on('formReviewed', handleFormReviewed);
    return () => {
      socket.off('formReviewed', handleFormReviewed);
    };
  }, [toast]);

  const handleReview = (review: any) => {
    setSelectedReview(review);
    setAdminApprovedText(review.adminApprovedText || '');
    setAdminApprovedFounderText(review.adminApprovedFounderText || '');
  };

  const handleApproveInvestor = () => {
    socket.emit('formReviewed', {
      type: 'interest',
      interestId: selectedReview._id,
      status: 'approved',
      adminApprovedText,
    });
  };
  const handleRejectInvestor = () => {
    socket.emit('formReviewed', {
      type: 'interest',
      interestId: selectedReview._id,
      status: 'rejected',
      adminApprovedText,
    });
  };
  const handleRequestRevisionInvestor = () => {
    socket.emit('formReviewed', {
      type: 'interest',
      interestId: selectedReview._id,
      status: 'revision',
      adminApprovedText,
    });
  };
  const handleApproveFounder = () => {
    socket.emit('formReviewed', {
      type: 'product',
      productId: selectedReview._id,
      status: 'approved',
      adminApprovedFounderText,
    });
  };
  const handleRejectFounder = () => {
    socket.emit('formReviewed', {
      type: 'product',
      productId: selectedReview._id,
      status: 'rejected',
      adminApprovedFounderText,
    });
  };
  const handleRequestRevisionFounder = () => {
    socket.emit('formReviewed', {
      type: 'product',
      productId: selectedReview._id,
      status: 'revision',
      adminApprovedFounderText,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-2">Loading {approvalMode ? "product" : "analytics"} data...</span>
    </div>;
  }

  // Special render for approval mode
  if (approvalMode) {
    // We'll use the product counts to show products that need approval
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Product Approval Management</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshAnalytics}
            className="gap-1 text-black"
          >
            <FaSync className="h-4 w-4" /> Refresh Products
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Products Pending Approval</CardTitle>
              <CardDescription>
                Review and manage products that need approval before being available to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productCounts.map((product, index) => (
                  <Card key={product.name} className="border border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gray-50 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant={index < 2 ? "default" : "outline"}>
                          {index < 2 ? "Popular" : "New"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {product.count} user interests ({product.percentage}%)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FaUsers className="mr-2 text-blue-500" />
                          <span>Target Demographics: Businesses, Organizations</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FaClipboardCheck className="mr-2 text-green-500" />
                          <span>Status: Pending Approval</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          {product.name} is an innovative solution designed to help users with their tasks and improve productivity.
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 text-black"
                        onClick={() => {}}
                      >
                        <FaEye size={12} /> View Details
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => approveProduct.mutate(Object.keys(PRODUCT_NAMES).find(key => 
                          PRODUCT_NAMES[key] === product.name
                        ) || '')}
                      >
                        <FaCheckCircle size={12} /> Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => rejectProduct.mutate(Object.keys(PRODUCT_NAMES).find(key => 
                          PRODUCT_NAMES[key] === product.name
                        ) || '')}
                      >
                        <FaTimesCircle size={12} /> Reject
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {productCounts.length === 0 && (
                  <div className="col-span-full text-center p-8 bg-gray-50 rounded-md">
                    <FaClipboardCheck className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No Products Pending Approval</h3>
                    <p className="text-gray-500 mt-1">All products have been reviewed.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Regular analytics view
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {approvalMode ? "Product Approval Management" : "Product Interest Analytics"}
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshAnalytics}
          className="gap-1 text-black"
        >
          <FaSync className="h-4 w-4" /> Refresh {approvalMode ? "Products" : "Analytics"}
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Interests</p>
              <p className="text-3xl font-bold">{productInterests.length}</p>
            </div>
            <FaChartBar className="text-3xl text-primary" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold">{regularUsers}</p>
              <p className="text-xs text-gray-500">Regular users only</p>
            </div>
            <FaUsers className="text-3xl text-primary" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">User Engagement</p>
              <p className="text-3xl font-bold">{engagementRate}%</p>
              <p className="text-xs text-gray-500">{usersWithInterests} users expressed interest</p>
            </div>
            <FaPercentage className="text-3xl text-primary" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Activity</p>
              <p className="text-3xl font-bold">
                {recentInterests.length > 0 
                  ? new Date(recentInterests[0].latestDate).toLocaleDateString() 
                  : "No activity"}
              </p>
              {recentInterests.length > 0 && (
                <p className="text-xs text-gray-500">
                  {recentInterests.length} active users recently
                </p>
              )}
            </div>
            <FaHistory className="text-3xl text-primary" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Interest Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Product Interest Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productCounts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} interests`, 'Count']} />
                  <Bar dataKey="count" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {productCounts.map((product, index) => (
                <div key={product.name} className="text-center p-2 rounded-md bg-gray-50">
                  <span className="text-sm font-medium">{product.name}</span>
                  <div className="text-gray-500 text-xs">{product.count} interests ({product.percentage}%)</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Interest Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} interests`, 'Count']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5" 
                    activeDot={{ r: 8 }} 
                    name="Product Interests"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} interests`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500">No source data available</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Product Interests */}
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Product Interests
              <span className="block text-xs font-normal text-gray-500 mt-1">
                Showing {recentInterests.length} unique users with their combined interests
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInterests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">No product interests recorded yet</td>
                    </tr>
                  ) : (
                    recentInterests.map((interest) => (
                      <tr key={interest.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{interest.userName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {interest.products.map((productId: string) => (
                              <span 
                                key={productId} 
                                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                              >
                                {PRODUCT_NAMES[productId] || productId}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">
                            {interest.latestDate.toLocaleDateString()} {interest.latestDate.toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {interest.sources.size > 0 ? 
                              Array.from(interest.sources).map((source: unknown) => {
                                const sourceStr = String(source);
                                return (
                                  <span 
                                    key={sourceStr} 
                                    className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10"
                                  >
                                    {sourceStr}
                                  </span>
                                );
                              }) : 
                              <span className="text-gray-500">Website</span>
                            }
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedReview && (
        <div className="p-4 border rounded bg-white max-w-2xl mt-4">
          <h3 className="font-semibold text-lg mb-2">Review & Approve Queries</h3>
          <div className="mb-2">Interest ID: {selectedReview.interestId}</div>
          <div className="mb-2">Product: {selectedReview.productName}</div>
          <div className="mb-2">Investor: {selectedReview.investorEmail} | Founder: {selectedReview.founderEmail}</div>
          <div className="mb-2">Current Status: {selectedReview.status}</div>
          <hr className="my-2" />
          <div className="mb-2 font-semibold">Investor's Submitted Queries</div>
          <div className="mb-2">Primary Intent (Editable):
            <Input value={selectedReview.primaryIntent} onChange={e => {/* handle edit */}} />
          </div>
          <div className="mb-2">Areas of Interest (Editable):
            {/* Render checkboxes for each area, pre-checked as needed */}
          </div>
          <div className="mb-2">Original Question:
            <Textarea value={selectedReview.originalQuestion} readOnly />
          </div>
          <div className="mb-2">Admin-Approved Text:
            <Textarea value={adminApprovedText} onChange={e => setAdminApprovedText(e.target.value)} />
          </div>
          <div className="mb-2 text-red-600 font-semibold">⚠ DANGER: Potential contact info detected! Please remove before approving.</div>
          <div className="flex space-x-2 mb-4">
            <Button onClick={handleApproveInvestor}>Approve Investor Queries & Send to Founder</Button>
            <Button onClick={handleRejectInvestor} variant="destructive">Reject Investor Queries / Request Revision</Button>
          </div>
          <hr className="my-2" />
          <div className="mb-2 font-semibold">Founder's Submitted Questions</div>
          <div className="mb-2">Topics Selected:
            {/* Render checkboxes for each topic, pre-checked as needed */}
          </div>
          <div className="mb-2">Original Question:
            <Textarea value={selectedReview.founderQuestion} readOnly />
          </div>
          <div className="mb-2">Admin-Approved Text:
            <Textarea value={adminApprovedFounderText} onChange={e => setAdminApprovedFounderText(e.target.value)} />
          </div>
          <div className="mb-2 text-red-600 font-semibold">⚠ DANGER: Potential contact info detected! Please remove before approving.</div>
          <div className="flex space-x-2 mb-4">
            <Button onClick={handleApproveFounder}>Approve Founder Questions & Send to Investor</Button>
            <Button onClick={handleRejectFounder} variant="destructive">Reject Founder Questions / Request Revision</Button>
          </div>
          <Button onClick={() => setSelectedReview(null)} variant="outline">Close Modal</Button>
        </div>
      )}
    </>
  );
}
