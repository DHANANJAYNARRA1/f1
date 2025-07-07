import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Link as LinkIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CommunicationRequestList from "./CommunicationRequestList";

export default function AdminCommunicationReview() {
  const { toast } = useToast();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [zoomUrl, setZoomUrl] = useState("");
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  
  // Get pending communication requests
  const { 
    data, 
    isLoading: isLoadingPending 
  } = useQuery<{ requests: any[] }>({
    queryKey: ["/api/admin/communication-requests/pending"],
    queryFn: async () => {
      return await apiRequest("GET", "/api/admin/communication-requests/pending");
    },
  });
  
  const pendingRequests = data?.requests ?? [];
  
  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PATCH", `/api/admin/communication-requests/${requestId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communication-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communication-requests"] });
      toast({
        title: "Request approved",
        description: "The communication request has been approved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await apiRequest("PATCH", `/api/admin/communication-requests/${requestId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communication-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communication-requests"] });
      toast({
        title: "Request rejected",
        description: "The communication request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to reject request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Add Zoom URL mutation
  const addZoomUrlMutation = useMutation({
    mutationFn: async ({ requestId, zoomUrl }: { requestId: string; zoomUrl: string }) => {
      return await apiRequest("PATCH", `/api/admin/communication-requests/${requestId}/zoom-url`, { zoomUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communication-requests"] });
      toast({
        title: "Zoom link added",
        description: "The Zoom meeting link has been added to the communication request.",
      });
      setIsZoomDialogOpen(false);
      setZoomUrl("");
    },
    onError: (error) => {
      toast({
        title: "Failed to add Zoom link",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Handler for adding Zoom URL
  const handleAddZoomUrl = () => {
    if (!selectedRequestId || !zoomUrl) return;
    
    addZoomUrlMutation.mutate({ requestId: selectedRequestId, zoomUrl });
  };
  
  // Open Zoom dialog
  const openZoomDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setZoomUrl("");
    setIsZoomDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Requests</CardTitle>
          <CardDescription>
            Review and manage communication requests between founders and investors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="pt-4">
              {isLoadingPending ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingRequests && pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request: any) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{request.subject}</CardTitle>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-green-600"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-red-600"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          From {request.requesterName} to {request.targetName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2">{request.message}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4 text-sm text-gray-500">
                        <div>Type: {request.requestType}</div>
                        {request.date && <div>Date: {request.date}</div>}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No pending requests
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="pt-4">
              <div className="space-y-4">
                <CommunicationRequestList 
                  type="all" 
                  className="space-y-4" 
                />
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Add Zoom Meeting Link</CardTitle>
                    <CardDescription>
                      For approved meeting/call requests, you can add a Zoom meeting link
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {/* Approved requests that need Zoom links will be listed here */}
                      <div className="text-center text-sm">
                        Click on a request's actions menu to add a Zoom link
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="pt-4">
              <CommunicationRequestList 
                type="all" 
                showActions={true} 
                className="space-y-4" 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Zoom URL Dialog */}
      <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Zoom Meeting Link</DialogTitle>
            <DialogDescription>
              Enter the Zoom meeting URL for this communication request
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <LinkIcon className="h-5 w-5 text-gray-500" />
              <Input
                placeholder="https://zoom.us/j/example"
                value={zoomUrl}
                onChange={(e) => setZoomUrl(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsZoomDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleAddZoomUrl}
              disabled={!zoomUrl || addZoomUrlMutation.isPending}
            >
              {addZoomUrlMutation.isPending ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}