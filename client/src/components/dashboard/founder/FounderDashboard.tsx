import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';
import FounderSidebar from './FounderSidebar';
import ProductsSection from './ProductsSection';
import InvestorInterestList from './InvestorInterestList';
import { socket } from '@/socket';
import { useToast } from '@/hooks/use-toast';

const requiredDocuments = [
  { key: 'certificationOfIncorporation', label: 'Certification of Incorporation' },
  { key: 'companyOverview', label: "Company's Overview" },
  { key: 'memorandumOfAssociation', label: 'Memorandum of Association (MoM)' },
  { key: 'productRoadmap', label: 'Product Roadmap' },
  { key: 'useOfInvestments', label: 'Use of Investments Breakdown' },
  { key: 'businessPlan', label: 'Comprehensive Business Plan' },
  { key: 'pitchDeck', label: 'Pitch Deck' },
  { key: 'financialModel', label: 'Detailed Financial Model' },
  { key: 'intellectualProperty', label: 'Intellectual Property' },
  { key: 'executiveSummary', label: 'One Page Executive Summary' },
  { key: 'marketAnalysis', label: 'Market Analysis Reports' },
];

const FounderDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = React.useState('dashboard');

  React.useEffect(() => {
    if (!user) return;
    const handleDocStatus = ({ docKey, status }: { docKey: string, status: string }) => {
      toast({
        title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Your document '${docKey}' has been ${status}.`,
      });
    };
    socket.on('documentStatusChanged', handleDocStatus);
    return () => {
      socket.off('documentStatusChanged', handleDocStatus);
    };
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This should ideally redirect to login, but for now, show an error
    return <div>Error: Not logged in.</div>;
  }

  // Awaiting Verification View
  if (user.verificationStatus === 'pending_verification') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-full max-w-2xl text-center shadow-lg">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <CardTitle className="text-2xl font-bold mt-4">Profile Awaiting Verification</CardTitle>
            <CardDescription>
              Your profile has been submitted and is currently under review by our team. 
              You will be notified once the verification process is complete. In the meantime, please ensure all your documents are uploaded correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Document Submission Checklist</h3>
            <ul className="text-left space-y-2">
              {requiredDocuments.map(doc => (
                <li key={doc.key} className="flex items-center">
                  {user.documents && user.documents[doc.key as keyof typeof user.documents] ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>{doc.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rejected View
  if (user.verificationStatus === 'rejected') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-full max-w-2xl text-center shadow-lg">
          <CardHeader>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="text-2xl font-bold mt-4">Profile Verification Rejected</CardTitle>
            <CardDescription>
              Unfortunately, your profile could not be verified at this time. Please review the feedback from our team and resubmit your information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 bg-red-50 p-4 rounded-md">
              {/* Admin feedback would go here */}
              Admin Feedback: Please ensure your Certificate of Incorporation is valid and legible.
            </p>
            <Button className="mt-6">Resubmit Information</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verified Founder View (Full Dashboard)
  return (
    <div className="flex min-h-screen">
      <FounderSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductsSection />
          <InvestorInterestList />
        </div>
      </main>
    </div>
  );
};

export default FounderDashboard; 