import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaCheck, FaTimes, FaInfoCircle, FaLightbulb } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock mentor suggestion data
type MentorSuggestion = {
  id: string;
  founderName: string;
  founderId: string;
  founderEmail: string;
  mentorName: string;
  mentorId?: string;
  mentorType: 'internal' | 'external';
  expertise: string[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function MentorSuggestionsSection() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<MentorSuggestion | null>(null);
  const [adminNote, setAdminNote] = useState("");
  
  // Mock data for displaying suggestions
  const [suggestions, setSuggestions] = useState<MentorSuggestion[]>([
    {
      id: "ms-001",
      founderName: "Rajesh Kumar",
      founderId: "FOB-032",
      founderEmail: "rajesh@example.com",
      mentorName: "Vikram Shah",
      mentorId: "MNT-005",
      mentorType: 'internal',
      expertise: ["AgriTech", "Market Expansion", "Rural Distribution"],
      reason: "Looking for guidance on our rural distribution model for automated irrigation systems",
      status: 'pending',
      createdAt: "2025-04-12T10:30:00Z"
    },
    {
      id: "ms-002",
      founderName: "Priya Singh",
      founderId: "FOB-047",
      founderEmail: "priya@example.com",
      mentorName: "External Mentor - Dr. Arun Mehta",
      mentorType: 'external',
      expertise: ["HealthTech", "Medical Compliance", "FDA Approval"],
      reason: "Need experienced guidance on medical device regulatory approval process",
      status: 'approved',
      createdAt: "2025-04-05T14:15:00Z"
    },
    {
      id: "ms-003",
      founderName: "Amit Sharma",
      founderId: "FOB-089",
      founderEmail: "amit@example.com",
      mentorName: "Neha Gupta",
      mentorId: "MNT-012",
      mentorType: 'internal',
      expertise: ["FinTech", "Investment Strategy", "Venture Capital"],
      reason: "Seeking help with pitch preparation for Series A funding round",
      status: 'rejected',
      createdAt: "2025-04-01T09:45:00Z"
    },
    {
      id: "ms-004",
      founderName: "Sanjay Patel",
      founderId: "FOB-125",
      founderEmail: "sanjay@example.com",
      mentorName: "External Mentor - Michelle Wong",
      mentorType: 'external',
      expertise: ["EduTech", "International Expansion", "SaaS Pricing"],
      reason: "Need guidance on international market entry strategy for our educational platform",
      status: 'pending',
      createdAt: "2025-04-15T16:20:00Z"
    }
  ]);
  
  // Handle approving a mentor suggestion
  const handleApprove = (suggestion: MentorSuggestion) => {
    setCurrentSuggestion(suggestion);
    setAdminNote("");
    setOpenDialog(true);
  };
  
  // Handle confirming the approval
  const confirmApproval = () => {
    if (!currentSuggestion) return;
    
    // Update the suggestion status
    setSuggestions(prev => 
      prev.map(s => 
        s.id === currentSuggestion.id 
          ? {...s, status: 'approved'} 
          : s
      )
    );
    
    // Show success toast
    toast({
      title: "Mentor Suggestion Approved",
      description: `The mentor suggestion for ${currentSuggestion.founderName} has been approved.`,
    });
    
    // Close dialog
    setOpenDialog(false);
    setCurrentSuggestion(null);
  };
  
  // Handle rejecting a mentor suggestion
  const handleReject = (suggestion: MentorSuggestion) => {
    setCurrentSuggestion(suggestion);
    setAdminNote("");
    setOpenDialog(true);
  };
  
  // Handle confirming the rejection
  const confirmRejection = () => {
    if (!currentSuggestion) return;
    
    // Update the suggestion status
    setSuggestions(prev => 
      prev.map(s => 
        s.id === currentSuggestion.id 
          ? {...s, status: 'rejected'} 
          : s
      )
    );
    
    // Show success toast
    toast({
      title: "Mentor Suggestion Rejected",
      description: `The mentor suggestion for ${currentSuggestion.founderName} has been rejected.`,
    });
    
    // Close dialog
    setOpenDialog(false);
    setCurrentSuggestion(null);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Filter suggestions based on active tab
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (activeTab === "all") return true;
    return suggestion.status === activeTab;
  });
  
  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <FaLightbulb className="text-yellow-600 h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mentor Suggestion Management</h3>
            <p className="text-sm text-gray-500">Review and approve/reject mentor suggestions from founders</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Suggestions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map(suggestion => (
              <Card key={suggestion.id} className="border-l-4 shadow-sm hover:shadow-md transition-shadow" 
                style={{
                  borderLeftColor: suggestion.status === 'pending' 
                    ? '#f59e0b' // amber-500
                    : suggestion.status === 'approved'
                      ? '#10b981' // emerald-500
                      : '#ef4444' // red-500
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Mentor Request: {suggestion.id}</CardTitle>
                      <CardDescription>From {suggestion.founderName} ({suggestion.founderId})</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        suggestion.status === 'pending' 
                          ? 'outline' 
                          : suggestion.status === 'approved'
                            ? 'default'
                            : 'destructive'
                      }
                    >
                      {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="font-medium">Requested Mentor:</span>{" "}
                      <span className="text-gray-700">{suggestion.mentorName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mentor Type:</span>{" "}
                      <Badge variant="outline" className={
                        suggestion.mentorType === 'internal' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }>
                        {suggestion.mentorType === 'internal' ? 'Platform Mentor' : 'External Mentor'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Created on:</span>{" "}
                      <span className="text-gray-700">{formatDate(suggestion.createdAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Founder Email:</span>{" "}
                      <span className="text-gray-700">{suggestion.founderEmail}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="font-medium text-sm">Expertise Needed:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {suggestion.expertise.map((exp, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm">Reason for Mentorship:</span>
                    <p className="mt-1 text-sm text-gray-700 p-3 bg-gray-50 rounded-md border">
                      {suggestion.reason}
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  {suggestion.status === 'pending' && (
                    <div className="flex space-x-2 ml-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReject(suggestion)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FaTimes className="mr-1 h-3 w-3" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(suggestion)} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <FaCheck className="mr-1 h-3 w-3" /> Approve
                      </Button>
                    </div>
                  )}
                  
                  {suggestion.status !== 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-black"
                    >
                      <FaInfoCircle className="mr-1 h-3 w-3" /> View Details
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaLightbulb className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No {activeTab !== 'all' ? activeTab : ''} mentor suggestions found</h3>
              <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                When founders request specific mentors, they will appear here for your review and approval.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Approval/Rejection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentSuggestion?.status === 'pending' ? 'Confirm Action' : 'Update Status'}
            </DialogTitle>
            <DialogDescription>
              {currentSuggestion?.status === 'pending' 
                ? 'Please confirm you want to change the status of this mentor suggestion.'
                : 'You can add a note about why this status was changed.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mentor Request ID</Label>
              <Input value={currentSuggestion?.id || ''} readOnly disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Founder</Label>
              <Input value={`${currentSuggestion?.founderName || ''} (${currentSuggestion?.founderId || ''})`} readOnly disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Requested Mentor</Label>
              <Input value={currentSuggestion?.mentorName || ''} readOnly disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Admin Note (Optional)</Label>
              <Textarea 
                placeholder="Add any notes about this decision..." 
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejection}
            >
              Reject Request
            </Button>
            <Button 
              onClick={confirmApproval}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}