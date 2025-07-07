import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface IZoomCallRequest {
  _id: string;
  topic: string;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'completed';
  createdAt: string;
  requesterId: {
    username: string;
    email: string;
  };
  adminId?: {
    username: string;
  };
}

export default function SuperAdminZoomRequests() {
  const { data: requests, isLoading } = useQuery<IZoomCallRequest[]>({
    queryKey: ['superadmin-zoom-requests'],
    queryFn: async () => {
      const data = await apiRequest<{ requests: IZoomCallRequest[] }>('GET', '/api/zoom/requests/superadmin');
      return data.requests;
    },
  });

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
    <Card>
      <CardHeader>
        <CardTitle>All Zoom Call Requests</CardTitle>
        <CardDescription>Oversight view of all Zoom call requests in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Handled By</TableHead>
              <TableHead>Requested On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  <div className="font-medium">{request.requesterId.username}</div>
                  <div className="text-sm text-gray-500">{request.requesterId.email}</div>
                </TableCell>
                <TableCell>{request.topic}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{request.adminId?.username || 'N/A'}</TableCell>
                <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && requests?.length === 0 && <p className="text-center p-4">No requests found.</p>}
      </CardContent>
    </Card>
  );
} 