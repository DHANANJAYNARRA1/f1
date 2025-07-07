import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface IZoomCallRequest {
  _id: string;
  topic: string;
  message: string;
  proposedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'completed';
  createdAt: string;
}

export default function ZoomCallSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({ topic: "", message: "" });
  const [proposedDate, setProposedDate] = useState<Date | undefined>(new Date());

  const { data: requests, isLoading } = useQuery<IZoomCallRequest[]>({
    queryKey: ['zoomCallRequests', user?._id],
    queryFn: async () => {
      const data = await apiRequest<{ requests: IZoomCallRequest[] }>("GET", "/api/zoom/requests/my");
      return data.requests;
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: (requestData: { topic: string; message: string; proposedDate: Date }) => 
      apiRequest("POST", "/api/zoom/request", requestData),
    onSuccess: () => {
      toast({ title: "Success", description: "Zoom call request sent." });
      queryClient.invalidateQueries({ queryKey: ['zoomCallRequests'] });
      setShowRequestDialog(false);
      setNewRequest({ topic: "", message: "" });
      setProposedDate(new Date());
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send request.", variant: "destructive" });
    },
  });

  const handleCreateRequest = () => {
    if (newRequest.topic && newRequest.message && proposedDate) {
      createRequestMutation.mutate({ ...newRequest, proposedDate });
    } else {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'scheduled': return <Badge variant="outline" className="bg-green-100 text-green-800">Scheduled</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-gray-100 text-gray-800">Completed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zoom Call Requests</h1>
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Zoom Call Request</DialogTitle>
              <DialogDescription>Request a Zoom call with an admin. Propose a date and time.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" value={newRequest.topic} onChange={(e) => setNewRequest({ ...newRequest, topic: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={newRequest.message} onChange={(e) => setNewRequest({ ...newRequest, message: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Proposed Date</Label>
                <Calendar mode="single" selected={proposedDate} onSelect={setProposedDate} className="rounded-md border" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateRequest} disabled={createRequestMutation.isPending}>
                {createRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>}

      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{request.topic}</span>
                  {getStatusBadge(request.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                <p className="text-xs text-gray-500">
                  Proposed Date: {new Date(request.proposedDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  Requested on: {new Date(request.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          !isLoading && <p>No Zoom call requests found.</p>
        )}
      </div>
    </div>
  );
} 