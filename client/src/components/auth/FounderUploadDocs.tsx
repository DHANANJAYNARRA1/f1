import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const documentFields = [
  { key: 'idDocument', label: 'Personal ID Document (PDF)' },
  { key: 'businessDocument', label: 'Business Registration Document (PDF)' },
  { key: 'pitchDeck', label: 'Pitch Deck (PDF)' },
  { key: 'certificationOfIncorporation', label: 'Certificate of Incorporation (PDF)' },
  { key: 'companyOverview', label: 'Company Overview (PDF)' },
  { key: 'memorandumOfAssociation', label: 'Memorandum of Association (PDF)' },
  { key: 'businessPlan', label: 'Comprehensive Business Plan (PDF)' },
  { key: 'financialModel', label: 'Detailed Financial Model (PDF)' },
  { key: 'intellectualProperty', label: 'Intellectual Property (PDF)' },
  { key: 'executiveSummary', label: 'One-Page Executive Summary (PDF)' },
  { key: 'marketAnalysis', label: 'Market Analysis Reports (PDF)' },
  { key: 'productRoadmap', label: 'Product Roadmap (PDF)' },
  { key: 'useOfInvestments', label: 'Use of Investments Breakdown (PDF)' },
];

export default function FounderUploadDocs() {
  const [docFiles, setDocFiles] = useState<{ [key: string]: File | undefined }>({});
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDocChange = (key: string, file: File | undefined) => {
    setDocFiles(prev => ({ ...prev, [key]: file }));
  };

  const onDocUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData();
    documentFields.forEach(({ key }) => {
      if (docFiles[key]) formData.append(key, docFiles[key]!);
    });
    try {
      const response = await fetch('/api/auth/founder-documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Documents uploaded!' });
        navigate('/founder-upload-success');
      } else {
        setErrorMsg(result.message || 'Failed to upload documents');
        toast({ title: 'Error', description: result.message || 'Failed to upload documents', variant: 'destructive' });
        console.error('Document upload error:', result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error: Failed to upload documents');
      toast({ title: 'Error', description: err.message || 'Network error: Failed to upload documents', variant: 'destructive' });
      console.error('Document upload network error:', err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader><CardTitle>Upload Required Documents</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onDocUploadSubmit} className="space-y-4">
          {documentFields.map(({ key, label }) => (
            <div key={key}>
              <FormLabel>{label}</FormLabel>
              <Input type="file" accept="application/pdf" onChange={e => handleDocChange(key, e.target.files?.[0])} />
            </div>
          ))}
          <Button type="submit" className="w-full">Submit Documents</Button>
          {errorMsg && <div className="text-red-600 text-sm mt-2">{errorMsg}</div>}
        </form>
      </CardContent>
    </Card>
  );
} 