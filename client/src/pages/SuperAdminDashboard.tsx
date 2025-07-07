import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface FounderDocument {
  userId: string;
  userName: string;
  userType: string;
  documents: {
    [key: string]: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminApproved?: boolean;
  superAdminApproved?: boolean;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [founderDocuments, setFounderDocuments] = useState<FounderDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFounderDocuments();
  }, []);

  const fetchFounderDocuments = async () => {
    try {
      const response = await fetch('/api/superadmin/founder-documents', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setFounderDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch founder documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/superadmin/approve-founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchFounderDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to super admin approve founder:', error);
    }
  };

  const handleSuperAdminReject = async (userId: string) => {
    try {
      const response = await fetch('/api/superadmin/reject-founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchFounderDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to super admin reject founder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome, Super Admin {user?.name}!
              </h2>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Founder Document Final Reviews</h3>
                
                {founderDocuments.length === 0 ? (
                  <p className="text-gray-600">No founder documents pending super admin review.</p>
                ) : (
                  <div className="space-y-6">
                    {founderDocuments.map((founder) => (
                      <div key={founder.userId} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium">{founder.userName}</h4>
                            <p className="text-sm text-gray-600">User Type: {founder.userType}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <p className="text-sm text-gray-600">
                                Admin Status: <span className={`font-medium ${
                                  founder.adminApproved ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {founder.adminApproved ? 'Approved' : 'Pending'}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Super Admin Status: <span className={`font-medium ${
                                  founder.superAdminApproved ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {founder.superAdminApproved ? 'Approved' : 'Pending'}
                                </span>
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              Submitted: {new Date(founder.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {founder.adminApproved && !founder.superAdminApproved && (
                            <div className="space-x-2">
                              <Button
                                onClick={() => handleSuperAdminApprove(founder.userId)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Final Approve
                              </Button>
                              <Button
                                onClick={() => handleSuperAdminReject(founder.userId)}
                                variant="destructive"
                              >
                                Final Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(founder.documents).map(([docType, filename]) => (
                            <div key={docType} className="border border-gray-300 rounded p-3">
                              <p className="text-sm font-medium mb-2">
                                {docType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => setSelectedDocument({
                                  url: `/uploads/founder-docs/${filename}`,
                                  name: `${docType} - ${founder.userName}`
                                })}
                              >
                                View Document
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDocument && (
        <DocumentViewer
          documentUrl={selectedDocument.url}
          documentName={selectedDocument.name}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}