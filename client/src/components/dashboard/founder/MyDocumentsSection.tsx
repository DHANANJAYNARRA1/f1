import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PdfViewer from '@/components/ui/PdfViewer';

const docLabels: Record<string, string> = {
  id: 'ID Document',
  business: 'Business Registration',
  // Add more keys as needed for future document types
};

const MyDocumentsSection = () => {
  const { user } = useAuth();
  const documents = user?.documents || {};

  const docEntries = Object.entries(documents).filter(([, value]) => !!value);

  if (docEntries.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Uploaded Documents</CardTitle>
          <CardDescription>No documents uploaded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">My Uploaded Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docEntries.map(([key, url]) => (
          <Card key={key} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{docLabels[key] || key}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 border rounded overflow-hidden bg-gray-50">
                <PdfViewer fileUrl={url} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyDocumentsSection; 