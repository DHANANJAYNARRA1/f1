import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { FaClock, FaCheck, FaTimesCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

// Define the type for an admin request
type AdminRequest = {
  id: string;
  requestType: string;
  userType: 'founder' | 'investor' | 'organization' | 'mentor' | 'other';
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'canceled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
};

export default function MyRequestsSection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data for displaying admin requests
  const [requests, setRequests] = useState<AdminRequest[]>([
    {
      id: "req-001",
      requestType: "Account Verification",
      userType: 'founder',
      userId: "FOB-032",
      userName: "Rajesh Kumar",
      subject: "Verify company documents",
      description: "Founder has submitted company registration documents that need to be verified for account approval.",
      status: 'pending',
      priority: 'high',
      createdAt: "2025-04-15T09:30:00Z"
    },
    {
      id: "req-002",
      requestType: "Payment Dispute",
      userType: 'investor',
      userId: "INV-018",
      userName: "Anjali Gupta",
      subject: "Refund for double payment",
      description: "Investor was charged twice for the Professional subscription. Needs refund of ₹3,999.",
      status: 'in-progress',
      priority: 'medium',
      createdAt: "2025-04-12T14:15:00Z",
      updatedAt: "2025-04-13T10:20:00Z"
    },
    {
      id: "req-003",
      requestType: "Content Approval",
      userType: 'founder',
      userId: "FOB-076",
      userName: "Vikram Singh",
      subject: "Product description review",
      description: "New agricultural product description needs approval before going live on the platform.",
      status: 'completed',
      priority: 'low',
      createdAt: "2025-04-10T11:45:00Z",
      updatedAt: "2025-04-11T16:30:00Z"
    },
    {
      id: "req-004",
      requestType: "Technical Support",
      userType: 'organization',
      userId: "ORG-025",
      userName: "TechSolutions Inc.",
      subject: "API integration issue",
      description: "Organization is having trouble with our API integration. Need technical support to resolve connection issues.",
      status: 'canceled',
      priority: 'high',
      createdAt: "2025-04-08T13:20:00Z",
      updatedAt: "2025-04-09T09:15:00Z"
    }
  ]);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle completing a request
  const handleCompleteRequest = (requestId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? {...req, status: 'completed', updatedAt: new Date().toISOString()} 
          : req
      )
    );
    
    toast({
      title: "Request Completed",
      description: "The request has been marked as completed.",
    });
  };

  // Handle canceling a request
  const handleCancelRequest = (requestId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? {...req, status: 'canceled', updatedAt: new Date().toISOString()} 
          : req
      )
    );
    
    toast({
      title: "Request Canceled",
      description: "The request has been canceled.",
    });
  };

  // Handle starting progress on a request
  const handleStartProgress = (requestId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId 
          ? {...req, status: 'in-progress', updatedAt: new Date().toISOString()} 
          : req
      )
    );
    
    toast({
      title: "Request In Progress",
      description: "The request has been marked as in progress.",
    });
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <FaClock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <FaSpinner className="h-3 w-3" /> In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <FaCheck className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <FaTimesCircle className="h-3 w-3" /> Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1">
            <FaExclamationTriangle className="h-3 w-3" /> Unknown
          </Badge>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get user type badge
  const getUserTypeBadge = (userType: string) => {
    switch(userType) {
      case 'founder':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Founder</Badge>;
      case 'investor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Investor</Badge>;
      case 'organization':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Organization</Badge>;
      case 'mentor':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Mentor</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Other</Badge>;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <FaSpinner className="text-blue-600 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Admin Request Management</h3>
            <p className="text-sm text-gray-500">Track and manage your administrative tasks and requests</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Card key={request.id} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      <CardDescription>Request ID: {request.id} • {request.requestType}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium">User:</span>{" "}
                      <span className="text-gray-700">{request.userName} ({request.userId})</span>
                    </div>
                    <div>
                      <span className="font-medium">User Type:</span>{" "}
                      {getUserTypeBadge(request.userType)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      <span className="text-gray-700">{formatDate(request.createdAt)}</span>
                    </div>
                    {request.updatedAt && (
                      <div>
                        <span className="font-medium">Last Updated:</span>{" "}
                        <span className="text-gray-700">{formatDate(request.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div>
                    <span className="font-medium text-sm">Description:</span>
                    <p className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md border">
                      {request.description}
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <div className="flex space-x-2 ml-auto">
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancelRequest(request.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <FaTimesCircle className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStartProgress(request.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FaSpinner className="mr-1 h-3 w-3" /> Start Progress
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'in-progress' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancelRequest(request.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <FaTimesCircle className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FaCheck className="mr-1 h-3 w-3" /> Mark Complete
                        </Button>
                      </>
                    )}
                    
                    {(request.status === 'completed' || request.status === 'canceled') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-black"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaSpinner className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No {activeTab !== 'all' ? activeTab : ''} requests found</h3>
              <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                {activeTab === 'all' 
                  ? "You don't have any administrative requests to manage at the moment."
                  : `You don't have any ${activeTab} administrative requests.`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}