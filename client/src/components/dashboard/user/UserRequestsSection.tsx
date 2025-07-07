import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FaClock, FaCheck, FaTimesCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

// Define the type for a service request
type ServiceRequest = {
  id: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  notes?: string;
  status: 'pending' | 'approved' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt?: string;
};

export default function UserRequestsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Simulated data for demo purposes
  useEffect(() => {
    const demoRequests: ServiceRequest[] = [
      {
        id: "sr-001",
        serviceType: "Business Consultation",
        preferredDate: "2025-06-15",
        preferredTime: "morning",
        location: "online",
        notes: "Need help with scaling strategy",
        status: "pending",
        createdAt: "2025-05-15T08:30:00Z"
      },
      {
        id: "sr-002",
        serviceType: "Investor Readiness Package",
        preferredDate: "2025-06-20",
        preferredTime: "afternoon",
        location: "office",
        notes: "Preparing for Series A funding",
        status: "approved",
        createdAt: "2025-05-10T14:45:00Z",
        updatedAt: "2025-05-12T09:15:00Z"
      },
      {
        id: "sr-003",
        serviceType: "Technical Support",
        preferredDate: "2025-05-28",
        preferredTime: "evening",
        location: "client",
        status: "completed",
        createdAt: "2025-05-05T11:20:00Z",
        updatedAt: "2025-05-06T16:30:00Z"
      },
      {
        id: "sr-004",
        serviceType: "Legal Documentation",
        preferredDate: "2025-06-10",
        preferredTime: "morning",
        location: "online",
        notes: "Need NDA and partnership agreements",
        status: "canceled",
        createdAt: "2025-05-02T10:00:00Z",
        updatedAt: "2025-05-03T15:20:00Z"
      }
    ];
    
    // Simulate API call delay
    setTimeout(() => {
      setRequests(demoRequests);
      setLoading(false);
    }, 800);
  }, []);

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

  // Format preferred time for display
  const formatTime = (time: string) => {
    switch(time) {
      case 'morning': return 'Morning (9AM - 12PM)';
      case 'afternoon': return 'Afternoon (1PM - 5PM)';
      case 'evening': return 'Evening (6PM - 9PM)';
      default: return time;
    }
  };

  // Format location for display
  const formatLocation = (location: string) => {
    switch(location) {
      case 'online': return 'Online/Virtual';
      case 'office': return 'Our Office';
      case 'client': return 'Your Location';
      default: return location;
    }
  };

  // Handle cancel request
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
      description: "Your service request has been canceled.",
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
      case 'approved':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <FaCheck className="h-3 w-3" /> Approved
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Service Requests</h2>
        <p className="text-gray-600">
          Track and manage your service requests. Monitor their status and view details.
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="canceled">Canceled</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        // Loading skeletons
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Separator />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{request.serviceType}</h3>
                  <p className="text-sm text-gray-500">
                    Request ID: {request.id}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
                <div>
                  <span className="font-medium text-gray-600">Preferred Date:</span>{" "}
                  {new Date(request.preferredDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Preferred Time:</span>{" "}
                  {formatTime(request.preferredTime)}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Location:</span>{" "}
                  {formatLocation(request.location)}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Submitted:</span>{" "}
                  {formatDate(request.createdAt)}
                </div>
              </div>
              
              {request.notes && (
                <>
                  <Separator className="my-3" />
                  <div className="text-sm mb-3">
                    <span className="font-medium text-gray-600">Notes:</span>
                    <p className="mt-1 text-gray-600">{request.notes}</p>
                  </div>
                </>
              )}
              
              {request.status === "pending" && (
                <>
                  <Separator className="my-3" />
                  <div className="flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel Request
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FaSpinner className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab !== "all" ? activeTab : ""} requests found</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === "all" 
              ? "You haven't made any service requests yet."
              : `You don't have any ${activeTab} service requests.`}
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              const event = new CustomEvent('change-section', { 
                detail: { section: 'services' } 
              });
              window.dispatchEvent(event);
            }}
          >
            Explore Services
          </Button>
        </div>
      )}
    </div>
  );
}