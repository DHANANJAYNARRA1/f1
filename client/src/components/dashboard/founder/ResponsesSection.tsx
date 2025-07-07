import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface QueryResponse {
  _id: string;
  productId: { name: string };
  investorId: { anonymousId: string };
  founderResponse: string;
  status: string;
  investorPrimaryIntent: string;
  investorAreasOfInterest: string[];
  investorQueryAdminApprovedText: string;
}

interface ResponsesData {
  responses: QueryResponse[];
}

const topicsForInvestor = [
  "Clarify Investor Requirements",
  "Investment Criteria",
  "Value-Add Beyond Funding",
  "Time Horizon",
  "Portfolio Companies",
  "Decision Process",
  "Market Insights",
  "Next Steps"
];

export default function ResponsesSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [founderQuestion, setFounderQuestion] = useState('');
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<{ [key: string]: string }>({});

  const { data, isLoading, error } = useQuery<ResponsesData>({
    queryKey: ['founder-responses'],
    queryFn: async () => apiRequest<ResponsesData>('GET', '/api/query/founder/responses'),
  });

  const respondMutation = useMutation({
    mutationFn: (response: any) => apiRequest('POST', '/api/query/founder/respond-to-request', response),
    onSuccess: () => {
      toast({ title: "Response Sent", description: "Your questions have been sent to the admin for review." });
      queryClient.invalidateQueries({ queryKey: ['founder-responses'] });
      setActiveQueryId(null);
      setSelectedTopics([]);
      setFounderQuestion('');
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleTopicChange = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQueryId) return;
    
    respondMutation.mutate({ 
      queryId: activeQueryId,
      founderSelectedTopics: selectedTopics, 
      founderOriginalQuestion: founderQuestion 
    });
  };

  const requests = data?.responses || [];

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Responses from Admin</h2>
      {requests.length === 0 && <p>No pending queries from the admin.</p>}
      {requests.map((req: QueryResponse) => (
        <Card key={req._id}>
          <CardHeader>
            <CardTitle>Query for Product: {req.productId.name}</CardTitle>
            <CardDescription>From: {req.investorId.anonymousId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Section 1: Investor's Approved Queries (Read-Only)</h3>
              <p><strong className='font-medium'>Primary Intent:</strong> {req.investorPrimaryIntent}</p>
              <p><strong className='font-medium'>Areas of Interest:</strong> {req.investorAreasOfInterest?.join(', ')}</p>
              <p className='mt-2'><strong className='font-medium'>Specific Questions:</strong></p>
              <p className="p-2 bg-gray-100 rounded text-gray-800">{req.investorQueryAdminApprovedText}</p>
              <p className="text-xs text-gray-500 mt-2">Note: Some parts may have been filtered by Admin for privacy.</p>
            </div>

            {activeQueryId === req._id ? (
              <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50 text-gray-800">
                <fieldset className="mb-4">
                  <legend className="font-semibold text-lg mb-2">Section 2: Your Questions for the Investor</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {topicsForInvestor.map(topic => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${req._id}-${topic}`}
                          onCheckedChange={() => handleTopicChange(topic)}
                          checked={selectedTopics.includes(topic)}
                        />
                        <Label htmlFor={`${req._id}-${topic}`}>{topic}</Label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="font-semibold text-lg mb-2">Section 3: Specific Questions / Clarifications</legend>
                  <Textarea
                    value={founderQuestion}
                    onChange={e => setFounderQuestion(e.target.value)}
                    placeholder="e.g., What is your typical investment ticket size?"
                  />
                  <p className="text-xs text-red-600 mt-1">A WARNING: Do not share personal contact info here. It will be filtered.</p>
                </fieldset>
                <div className="mt-4 flex gap-4">
                  <Button type="submit" disabled={respondMutation.isPending}>
                    {respondMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Questions
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveQueryId(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setActiveQueryId(req._id)}>Submit Response</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 