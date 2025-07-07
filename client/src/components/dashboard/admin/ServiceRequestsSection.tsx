import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaSync } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ServiceRequestsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: requestsResponse, isLoading: isLoadingRequests, error: requestsError, refetch } = useQuery<{ success: boolean, requests: any[] }>({
    queryKey: ["/api/admin/service-requests"],
    staleTime: 10000, // 10 seconds - cache remains fresh for 10s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep unused data in cache for 5 min
    refetchOnWindowFocus: true, // Refetch on window focus to get latest updates
    refetchInterval: 15000, // Auto-refresh every 15 seconds for more frequent updates
    refetchIntervalInBackground: true // Refresh in background to always have latest status
  });
  
  // Log for debugging
  console.log("Service Requests Response:", requestsResponse);
  if (requestsError) {
    console.error("Error fetching service requests:", requestsError);
  }
  
  const serviceRequests = requestsResponse?.success ? requestsResponse.requests : [];
  
  // Filter by search query
  const filteredRequests = serviceRequests.filter((request: any) => 
    request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.preferredTime.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: string }) => {
      const response = await apiRequest<{ success: boolean; message?: string }>("PATCH", `/api/admin/service-requests/${requestId}`, { status });
      if (!response.success) {
        throw new Error(response.message || "Failed to update service request status");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Service request status has been updated successfully.",
      });
      
      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      
      // Close the dialog
      setRequestDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service request status",
        variant: "destructive",
      });
    },
  });

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const handleStatusChange = (status: string) => {
    if (!selectedRequest) return;
    
    statusUpdateMutation.mutate({
      requestId: selectedRequest.id,
      status
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Service Requests</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="font-bold text-lg">Customer Service Requests</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetch();
                  toast({
                    title: "Refreshed",
                    description: "Service request data has been updated",
                  });
                }}
                className="gap-1 w-full sm:w-auto"
              >
                <FaSync className="h-4 w-4" /> Refresh
              </Button>
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:-mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Date</th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingRequests ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center">Loading service requests...</td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-4 text-center">No service requests found</td>
                  </tr>
                ) : (
                  filteredRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">{request.userName}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-xs sm:text-sm">{request.serviceType}</div>
                        {/* Mobile only info */}
                        <div className="text-xs text-gray-400 md:hidden mt-1">
                          {formatDate(request.preferredDate)}, {request.preferredTime}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-xs sm:text-sm">
                          {formatDate(request.preferredDate)} at {request.preferredTime}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-gray-500 text-xs sm:text-sm">{request.location}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-900 h-7 px-2 sm:px-3 py-0"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-900 h-7 px-2 sm:px-3 py-0"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete service request from ${request.userName}?`)) {
                                try {
                                  const response = await apiRequest<{ success: boolean; message?: string }>("DELETE", `/api/admin/service-requests/${request.id}`);
                                  
                                  if (response.success) {
                                    toast({
                                      title: "Request Deleted",
                                      description: `Service request from ${request.userName} has been deleted.`,
                                      duration: 3000
                                    });
                                    
                                    // Optimistic update
                                    const updatedRequests = serviceRequests.filter((r: any) => r.id !== request.id);
                                    queryClient.setQueryData(["/api/admin/service-requests"], {
                                      success: true,
                                      requests: updatedRequests
                                    });
                                    
                                    // Refetch to ensure data consistency
                                    setTimeout(() => refetch(), 500);
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: response.message || "Failed to delete service request.",
                                      variant: "destructive",
                                      duration: 3000
                                    });
                                  }
                                } catch (error) {
                                  console.error("Error deleting service request:", error);
                                  toast({
                                    title: "Error",
                                    description: "An unexpected error occurred. Please try again.",
                                    variant: "destructive",
                                    duration: 3000
                                  });
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs sm:text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left">
              Showing <span className="font-medium">{filteredRequests.length} out of {serviceRequests.length}</span> service requests
            </div>
            <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm h-8 px-2 sm:px-3">Previous</Button>
              <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm h-8 px-2 sm:px-3">Next</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Request Details Dialog - Responsive for mobile and desktop */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">Service Request Details</DialogTitle>
            <DialogDescription className="text-sm opacity-80">
              Details and management options for this request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2 sm:py-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-start gap-2 sm:gap-4 text-sm">
                <div className="font-semibold text-gray-700">Customer:</div>
                <div className="font-medium">{selectedRequest.userName}</div>
                
                <div className="font-semibold text-gray-700">Service:</div>
                <div className="text-sm text-gray-900">{selectedRequest.serviceType}</div>
                
                <div className="font-semibold text-gray-700">Date:</div>
                <div className="text-sm text-gray-700">{formatDate(selectedRequest.preferredDate)}</div>
                
                <div className="font-semibold text-gray-700">Time:</div>
                <div className="text-sm text-gray-700">{selectedRequest.preferredTime}</div>
                
                <div className="font-semibold text-gray-700">Location:</div>
                <div className="text-sm text-gray-700 break-words">{selectedRequest.location}</div>
                
                <div className="font-semibold text-gray-700">Notes:</div>
                <div className="text-sm text-gray-600 break-words">{selectedRequest.notes || "No notes provided"}</div>
                
                <div className="font-semibold text-gray-700">Created:</div>
                <div className="text-sm text-gray-700">{new Date(selectedRequest.createdAt).toLocaleString()}</div>
                
                <div className="font-semibold text-gray-700">Status:</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {getStatusBadge(selectedRequest.status)}
                  <Select
                    defaultValue={selectedRequest.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] sm:ml-2 mt-1 sm:mt-0 h-8 text-sm">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex items-center justify-end mt-2 sm:mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}