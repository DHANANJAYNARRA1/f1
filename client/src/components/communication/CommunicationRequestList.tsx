import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MoreVertical, Calendar, Clock, MessageSquare, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CommunicationRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  requestType: "meeting" | "call" | "message";
  subject: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "completed";
  date?: string;
  time?: string;
  zoomMeetingUrl?: string;
}

interface CommunicationRequestListProps {
  type?: "sent" | "received" | "all";
  maxItems?: number;
  showActions?: boolean;
  className?: string;
}

export default function CommunicationRequestList({
  type = "sent",
  maxItems,
  showActions = true,
  className = "",
}: CommunicationRequestListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine query endpoint based on type
  const endpoint = type === "all" 
    ? "/api/admin/communication-requests" 
    : type === "sent" 
      ? "/api/communication-requests/sent" 
      : "/api/communication-requests/received";
  
  // Fetch communication requests
  const { data, isLoading, error } = useQuery<CommunicationRequest[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      return await apiRequest("GET", endpoint);
    },
  });
  
  // Mutations for updating request status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/communication-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({
        title: "Status updated",
        description: "The communication request status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Helper function to get request type icon
  const getRequestTypeIcon = (requestType: string) => {
    switch (requestType) {
      case "meeting":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "call":
        return <Clock className="h-4 w-4 mr-1" />;
      case "message":
        return <MessageSquare className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  // Handle approving a request
  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };
  
  // Handle rejecting a request
  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };
  
  // Handle marking a request as completed
  const handleComplete = (id: string) => {
    updateStatusMutation.mutate({ id, status: "completed" });
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Display error state
  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load communication requests
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Filter requests if maxItems is set
  const displayedRequests = maxItems ? data.slice(0, maxItems) : data;
  
  // Display empty state
  if (displayedRequests.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            No communication requests found
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {displayedRequests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {getRequestTypeIcon(request.requestType)}
                  <span className="capitalize">{request.requestType}</span>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    
                    {/* Different actions based on user role and request status */}
                    {user?.isAdmin && request.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReject(request.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {request.status === "approved" && request.zoomMeetingUrl && (
                      <DropdownMenuItem asChild>
                        <a href={request.zoomMeetingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Join Meeting
                        </a>
                      </DropdownMenuItem>
                    )}
                    
                    {request.status === "approved" && (
                      <DropdownMenuItem onClick={() => handleComplete(request.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => {
                        // Logic to view details
                        toast({
                          title: "View details",
                          description: "This feature is coming soon.",
                        });
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <CardTitle className="text-lg">{request.subject}</CardTitle>
            <CardDescription>
              {request.date && request.time ? (
                <span>
                  Scheduled for {format(new Date(request.date), "PPP")} at {request.time}
                </span>
              ) : (
                <span>Created on {format(new Date(request.createdAt), "PPP")}</span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">{request.message}</p>
          </CardContent>
          
          <CardFooter className="pt-1 border-t flex justify-between">
            <div className="flex items-center text-sm text-gray-500">
              {type === "sent" ? (
                <div className="flex items-center gap-2">
                  <span>To:</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{request.targetName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{request.targetName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>From:</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{request.requesterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{request.requesterName}</span>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}