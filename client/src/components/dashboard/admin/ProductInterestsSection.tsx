import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  FaSearch, FaSync, FaFilter, FaCheckCircle, 
  FaTimesCircle, FaComment, FaEnvelope, FaPhone 
} from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { socket } from '@/socket';
import { Textarea } from '@/components/ui/textarea';
import bcrypt from 'bcrypt';

// Product name mapping
const PRODUCT_NAMES: Record<string, string> = {
  "hydroponics": "Hydroponics Solutions",
  "ecg": "ECG Monitoring Systems",
  "hps": "Health Parameter Systems",
  "terrace-garden": "Terrace Garden Solutions",
  "1": "Hydroponics",
  "2": "ECG Solutions",
  "3": "HPS Systems",
  "4": "Terrace Garden",
};

type ProductInterestsSectionProps = {
  moderationMode?: boolean;
};

export default function ProductInterestsSection({ moderationMode = false }: ProductInterestsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all_products");
  const [selectedInterest, setSelectedInterest] = useState<any>(null);
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  
  // Mutations for approving and rejecting investor interests
  const approveInterest = useMutation({
    mutationFn: async (interestId: string) => {
      return await apiRequest('PATCH', `/api/admin/interests/${interestId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Interest Approved",
        description: "The investor interest has been approved and will be forwarded to the team.",
      });
      refetch();
      setSelectedInterest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message || "There was an error approving the interest",
        variant: "destructive"
      });
    }
  });

  const rejectInterest = useMutation({
    mutationFn: async (interestId: string) => {
      return await apiRequest('PATCH', `/api/admin/interests/${interestId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Interest Rejected",
        description: "The investor interest has been rejected.",
      });
      refetch();
      setSelectedInterest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "There was an error rejecting the interest",
        variant: "destructive"
      });
    }
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<{ success: boolean, interests: any[] }>({
    queryKey: ["/api/admin/product-interests"],
    queryFn: async () => await apiRequest("GET", "/api/admin/product-interests"),
    staleTime: 30000, // 30 seconds - cache remains fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep unused data in cache for 5 min
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce unnecessary requests
    // Add refetchInterval to automatically refresh data every 30 seconds, but only when component is visible
    refetchInterval: 30000,
    refetchIntervalInBackground: false // Don't refresh in background
  });

  useEffect(() => {
    function handleFormReviewed(data: any) {
      toast({ title: 'Submission Reviewed', description: 'Product submission has been reviewed.' });
      setSelectedSubmission(null);
      setAdminFeedback('');
    }
    socket.on('formReviewed', handleFormReviewed);
    return () => {
      socket.off('formReviewed', handleFormReviewed);
    };
  }, [toast]);

  if (error) {
    console.error("Error fetching product interests:", error);
  }

  const interests = data?.interests || [];
  const totalInterests = interests.length;
  
  // Filter interests based on search term and product filter
  const filteredInterests = interests.filter((interest: any) => {
    const matchesSearch = 
      !searchTerm || 
      interest.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = 
      productFilter === "all_products" || 
      !productFilter || 
      interest.productId === productFilter;
    
    return matchesSearch && matchesProduct;
  });

  // Extract unique product IDs for the filter dropdown
  const uniqueProducts = Array.from(
    new Set(interests.map((interest: any) => interest.productId))
  );
  
  // Create a map to track unique user/product combinations to avoid duplicates
  const uniqueInterestKeys = new Map();
  const deduplicatedInterests = filteredInterests.filter((interest: any) => {
    // Create a unique key combining userId and productId
    const uniqueKey = `${interest.userId}_${interest.productId}`;
    
    // If we haven't seen this combination before, keep it
    if (!uniqueInterestKeys.has(uniqueKey)) {
      uniqueInterestKeys.set(uniqueKey, true);
      return true;
    }
    
    // Otherwise filter it out as a duplicate
    return false;
  });
  
  // After uniqueProducts is defined, group interests by productId
  const interestsByProduct: Record<string, { productName: string, investors: string[] }> = {};
  interests.forEach((interest: any) => {
    if (!interestsByProduct[interest.productId]) {
      interestsByProduct[interest.productId] = {
        productName: PRODUCT_NAMES[String(interest.productId)] || interest.productId,
        investors: []
      };
    }
    if (!interestsByProduct[interest.productId].investors.includes(interest.userName)) {
      interestsByProduct[interest.productId].investors.push(interest.userName);
    }
  });
  
  // Special render for moderation mode
  if (moderationMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Investor Interest Moderation</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              refetch();
              toast({
                title: "Refreshed",
                description: "Investor interest data has been updated",
              });
            }}
            className="text-black gap-1"
          >
            <FaSync className="mr-2 h-4 w-4" /> Refresh Queue
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Pending interests */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Investor Interests</CardTitle>
                <CardDescription>
                  Review and manage investment inquiries from potential investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by user name..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <FaFilter className="h-4 w-4 text-gray-500" />
                    <Select
                      value={productFilter}
                      onValueChange={setProductFilter}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_products">All Products</SelectItem>
                        {uniqueProducts.map((productId: unknown) => {
                          const id = String(productId);
                          return (
                            <SelectItem key={id} value={id}>
                              {PRODUCT_NAMES[id] || id}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Investor</TableHead>
                          <TableHead className="w-[30%]">Product</TableHead>
                          <TableHead className="w-[20%]">Source</TableHead>
                          <TableHead className="w-[20%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deduplicatedInterests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                              No pending investor interests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          deduplicatedInterests.map((interest: any) => (
                            <TableRow 
                              key={interest._id} 
                              className={selectedInterest?._id === interest._id ? "bg-gray-50" : ""}
                            >
                              <TableCell className="font-medium">
                                {interest.userName}
                              </TableCell>
                              <TableCell>
                                {PRODUCT_NAMES[String(interest.productId)] || interest.productId}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {interest.source || "Direct"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => setSelectedInterest(interest)}
                                  >
                                    <FaComment className="h-4 w-4" />
                                    <span className="sr-only">View Details</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => approveInterest.mutate(interest._id)}
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                                  >
                                    <FaCheckCircle className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => rejectInterest.mutate(interest._id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  >
                                    <FaTimesCircle className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Selected interest details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Investor Details</CardTitle>
                <CardDescription>
                  Information about the selected investor interest
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedInterest ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Investor</h3>
                      <p className="text-lg font-semibold">{selectedInterest.userName}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Product Interest</h3>
                      <p className="font-medium">{PRODUCT_NAMES[String(selectedInterest.productId)] || selectedInterest.productId}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date Expressed</h3>
                      <p>{new Date(selectedInterest.createdAt).toLocaleDateString()} {new Date(selectedInterest.createdAt).toLocaleTimeString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Via</h3>
                      <Badge className="mt-1">{selectedInterest.source || "Direct Platform Message"}</Badge>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Potential Engagement</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FaEnvelope className="mr-2 text-blue-500" />
                          <span>Send Introduction Email</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FaPhone className="mr-2 text-green-500" />
                          <span>Schedule Call with Product Team</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaComment className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No Interest Selected</h3>
                    <p className="text-gray-500 mt-1">Click on an investor interest to view details</p>
                  </div>
                )}
              </CardContent>
              
              {selectedInterest && (
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => rejectInterest.mutate(selectedInterest._id)}
                    className="gap-1"
                  >
                    <FaTimesCircle className="h-4 w-4" /> Reject
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => approveInterest.mutate(selectedInterest._id)}
                    className="gap-1"
                  >
                    <FaCheckCircle className="h-4 w-4" /> Approve
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Regular view (non-moderation mode)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Interests</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            refetch();
            toast({
              title: "Refreshed",
              description: "Product interest data has been updated",
            });
          }}
          className="text-black gap-1"
        >
          <FaSync className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {deduplicatedInterests.length} out of {totalInterests} product interests
            <span className="text-xs text-gray-500 block mt-1">
              (Showing unique user-product combinations only; some users may have expressed interest in the same product multiple times)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by user name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaFilter className="h-4 w-4 text-gray-500" />
              <Select
                value={productFilter}
                onValueChange={setProductFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_products">All Products</SelectItem>
                  {uniqueProducts.map((productId: unknown) => {
                    const id = String(productId);
                    return (
                      <SelectItem key={id} value={id}>
                        {PRODUCT_NAMES[id] || id}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Real-Time Product Interests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(interestsByProduct).map(([productId, { productName, investors }]) => (
                <Card key={productId} className="p-4">
                  <div className="font-bold text-blue-700 mb-1">{productName}</div>
                  <div className="text-sm text-gray-600 mb-2">Total Interests: <span className="font-semibold text-green-600">{investors.length}</span></div>
                  <div className="text-xs text-gray-500">Investors:</div>
                  <ul className="list-disc ml-5 text-xs">
                    {investors.map((name, idx) => (
                      <li key={idx} className="text-gray-800">{name}</li>
                    ))}
                  </ul>
                </Card>
              ))}
              {Object.keys(interestsByProduct).length === 0 && (
                <div className="text-gray-400 col-span-2">No interests yet.</div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">User</TableHead>
                    <TableHead className="w-[30%]">Product</TableHead>
                    <TableHead className="w-[20%]">Contact Method</TableHead>
                    <TableHead className="w-[30%]">Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deduplicatedInterests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        No product interests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    deduplicatedInterests.map((interest: any) => (
                      <TableRow key={interest._id}>
                        <TableCell className="font-medium">
                          {interest.userName}
                        </TableCell>
                        <TableCell>
                          {PRODUCT_NAMES[String(interest.productId)] || interest.productId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {interest.source || "Direct"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(interest.createdAt).toLocaleDateString()} {new Date(interest.createdAt).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedSubmission && (
        <div className="p-4 border rounded bg-white max-w-lg mt-4">
          <h3 className="font-semibold text-lg mb-2">Review Product Submission</h3>
          <div className="mb-2">Product: {selectedSubmission.name}</div>
          <Textarea
            value={adminFeedback}
            onChange={e => setAdminFeedback(e.target.value)}
            placeholder="Admin feedback or revision notes"
            className="mb-2"
          />
          <div className="flex space-x-2">
            <Button onClick={() => setSelectedSubmission(null)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}