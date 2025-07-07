import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch, FaSync } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PdfViewer from '@/components/ui/PdfViewer';
import { socket } from '@/socket';

const docLabels: Record<string, string> = {
  certificationOfIncorporation: 'Certificate of Incorporation',
  companyOverview: 'Company Overview',
  memorandumOfAssociation: 'Memorandum of Association',
  businessPlan: 'Comprehensive Business Plan',
  pitchDeck: 'Pitch Deck',
  financialModel: 'Detailed Financial Model',
  intellectualProperty: 'Intellectual Property (Patents, Trademarks)',
  executiveSummary: 'One-Page Executive Summary',
  marketAnalysis: 'Market Analysis Reports',
  productRoadmap: 'Product Roadmap',
  useOfInvestments: 'Use of Investments Breakdown',
  idDocument: 'Personal ID Document',
  businessDocument: 'Business Registration Document',
};

export default function UsersSection(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [docApproval, setDocApproval] = useState<Record<string, 'approved' | 'rejected' | 'pending'>>({});
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [userToViewDocuments, setUserToViewDocuments] = useState<User | null>(null);

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery<{ success: boolean; users: User[] }>({
    queryKey: ["/api/admin/users"],
  });

  useEffect(() => {
    socket.on('user-updated', refetch);
    socket.on('user-deleted', refetch);
    socket.on('user-created', refetch);
    return () => {
      socket.off('user-updated', refetch);
      socket.off('user-deleted', refetch);
      socket.off('user-created', refetch);
    };
  }, [refetch]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "User data has been updated.",
    });
  };

  const effectiveUsers = usersResponse?.success ? usersResponse.users : [];

  const filteredUsers = effectiveUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.name || "").toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenViewModal = (user: User) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleOpenDocumentsModal = (user: User) => {
    setUserToViewDocuments(user);
    setIsDocumentsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiRequest("DELETE", `/api/users/${userId}`);
      refetch();
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async (userId: string, status: 'approved' | 'rejected') => {
    setVerifying(true);
    try {
      await apiRequest('PUT', `/api/admin/users/${userId}/verify`, { status });
      refetch();
      setIsViewModalOpen(false);
      toast({
        title: `User ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The founder has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update verification status',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleApproveDoc = async (userId: string, docKey: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest('PATCH', `/api/auth/verify-document/${userId}/${docKey}`, { status });
      setDocApproval(prev => ({ ...prev, [`${userId}-${docKey}`]: status }));
      refetch();
      toast({
        title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The document '${docKey}' has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update document status',
        variant: 'destructive',
      });
    }
  };

  if (userToViewDocuments) {
    console.log('userToViewDocuments', userToViewDocuments);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Founder Verification</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Founders</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-black" onClick={handleRefresh}>
                <FaSync className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search founders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading founders...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id as string}>
                      <TableCell className="text-black">{user.name}</TableCell>
                      <TableCell className="text-black">{user.username}</TableCell>
                      <TableCell className="text-black">{user.userType}</TableCell>
                      <TableCell className="text-black">
                        <Badge>{user.status || 'pending'}</Badge>
                      </TableCell>
                      <TableCell className="text-black">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-black"
                            onClick={() => handleOpenViewModal(user)}
                          >
                            View Details
                          </Button>
                          {user.userType === 'founder' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenDocumentsModal(user)}
                            >
                              View Documents
                            </Button>
                          )}
                          {user.userType !== 'superadmin' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(String(user._id))}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Viewing details for {userToView?.name}.
            </DialogDescription>
          </DialogHeader>
          {userToView && (
            <div className="py-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-black">Unique ID</TableCell>
                    <TableCell className="text-black">{userToView.uniqueId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-black">Name</TableCell>
                    <TableCell className="text-black">{userToView.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-black">Email</TableCell>
                    <TableCell className="text-black">{userToView.username}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-black">User Type</TableCell>
                    <TableCell className="text-black">
                      <Badge>{userToView.userType}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-black">Verification Status</TableCell>
                    <TableCell className="text-black">
                      <Badge>{userToView.status || 'pending'}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-black">Registration Date</TableCell>
                    <TableCell className="text-black">
                      {new Date(userToView.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {/* Approve/Reject Founder Buttons */}
              {userToView.userType === 'founder' && userToView.status === 'pending' && (
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    disabled={verifying}
                    onClick={() => handleVerify(userToView._id as string, 'approved')}
                  >
                    Approve Founder
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={verifying}
                    onClick={() => handleVerify(userToView._id as string, 'rejected')}
                  >
                    Reject Founder
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentsModalOpen} onOpenChange={setIsDocumentsModalOpen}>
        <DialogContent className="bg-white text-black max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Founder Documents</DialogTitle>
            <DialogDescription>
              Reviewing documents for {userToViewDocuments?.name}.
            </DialogDescription>
          </DialogHeader>
          {userToViewDocuments && userToViewDocuments.documents && userToViewDocuments.userType === 'founder' && (
            <div className="py-4">
              {Object.entries(userToViewDocuments.documents)
                .filter(([_, docUrl]) => !!docUrl)
                .length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(userToViewDocuments.documents)
                    .filter(([_, docUrl]) => !!docUrl)
                    .map(([docKey, docUrl]) => (
                      <div key={docKey} className="border rounded p-2 bg-gray-50">
                        <div className="font-semibold mb-1">{docLabels[docKey] || docKey}</div>
                        <div className="h-48 mb-2">
                          <PdfViewer fileUrl={docUrl as string} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>
                            {(userToViewDocuments.documentsMeta && userToViewDocuments.documentsMeta[docKey]?.status)
                              ? userToViewDocuments.documentsMeta[docKey].status
                              : 'pending'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={userToViewDocuments.documentsMeta && userToViewDocuments.documentsMeta[docKey]?.status === 'approved'}
                            onClick={() => handleApproveDoc(userToViewDocuments._id as string, docKey, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={userToViewDocuments.documentsMeta && userToViewDocuments.documentsMeta[docKey]?.status === 'rejected'}
                            onClick={() => handleApproveDoc(userToViewDocuments._id as string, docKey, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <div>No documents uploaded by this founder yet.</div>
              )}
            </div>
          )}
          {userToViewDocuments && userToViewDocuments.userType !== 'founder' && (
            <div className="py-4 text-center text-gray-500">
              No documents to review for this user type.
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDocumentsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}