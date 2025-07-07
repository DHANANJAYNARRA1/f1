import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { PdfViewer } from '../ui/PdfViewer';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  documentType: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  userName: string;
}

interface DocumentViewerProps {
  userId?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export function DocumentViewer({ userId, isAdmin = false, isSuperAdmin = false }: DocumentViewerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const endpoint = userId ? `/api/documents/user/${userId}` : '/api/documents';
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'approved' as const }
              : doc
          )
        );
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(prev => prev ? { ...prev, status: 'approved' } : null);
        }
      }
    } catch (error) {
      console.error('Failed to approve document:', error);
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'rejected' as const }
              : doc
          )
        );
        
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
      }
    } catch (error) {
      console.error('Failed to reject document:', error);
    }
  };

  const openDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  const formatDocumentType = (type: string) => {
    return type
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isAdmin || isSuperAdmin ? 'Document Review' : 'My Documents'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No documents found</p>
            <p className="text-sm text-muted-foreground">
              {isAdmin || isSuperAdmin 
                ? 'No documents have been uploaded for review yet.'
                : 'You haven\'t uploaded any documents yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{document.fileName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDocumentType(document.documentType)}
                        {(isAdmin || isSuperAdmin) && ` • Uploaded by ${document.userName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(document.status)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocument(document)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Document Viewer</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="overflow-auto">
              <PdfViewer
                fileUrl={`/api/documents/view/${selectedDocument.id}`}
                fileName={selectedDocument.fileName}
                approvalStatus={selectedDocument.status}
                showApprovalButtons={
                  (isAdmin || isSuperAdmin) && selectedDocument.status === 'pending'
                }
                onApprove={() => handleApproveDocument(selectedDocument.id)}
                onReject={() => handleRejectDocument(selectedDocument.id)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}