import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FounderResponse {
    _id: string;
    founderId: { anonymousId: string; verificationStatus?: string };
    productId: { name: string };
    investorId: { anonymousId: string };
    founderSelectedTopics: string[];
    founderOriginalQuestion: string;
}

interface ResponsesData {
    responses: FounderResponse[];
}

export default function FounderResponsesSection() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [editingText, setEditingText] = useState<{ [key: string]: string }>({});

    const { data, isLoading, error } = useQuery<ResponsesData>({
        queryKey: ['admin-founder-responses'],
        queryFn: async () => apiRequest<ResponsesData>('GET', '/api/query/admin/founder-responses'),
    });

    // Handle data when it loads
    useEffect(() => {
        if (data?.responses) {
            const initialText = data.responses.reduce((acc: any, res: FounderResponse) => {
                acc[res._id] = res.founderOriginalQuestion;
                return acc;
            }, {});
            setEditingText(initialText);
        }
    }, [data]);

    const approveMutation = useMutation({
        mutationFn: async ({ queryId, approvedText }: { queryId: string; approvedText: string }) =>
            apiRequest('POST', `/api/query/admin/approve-founder-response/${queryId}`, { approvedText }),
        onSuccess: () => {
            toast({ title: 'Response Approved', description: 'The founder response has been sent to the investor.' });
            queryClient.invalidateQueries({ queryKey: ['admin-founder-responses'] });
        },
        onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });

    const handleApprove = (queryId: string) => {
        const approvedText = editingText[queryId] || '';
        approveMutation.mutate({ queryId, approvedText });
    };

    if (isLoading) return <Loader2 className="animate-spin" />;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>;

    // Only show responses from verified founders (if verificationStatus exists)
    const responses = (data?.responses || []).filter(res => 
        !res.founderId?.verificationStatus || res.founderId.verificationStatus === 'approved'
    );

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Review Founder Responses</h2>
            {responses.length === 0 && <p>No pending founder responses to review.</p>}
            {responses.map((res: FounderResponse) => (
                <Card key={res._id}>
                    <CardHeader>
                        <CardTitle>Response from {res.founderId.anonymousId} for Product: {res.productId.name}</CardTitle>
                        <CardDescription>Regarding query from: {res.investorId.anonymousId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <strong>Founder's Selected Topics:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {res.founderSelectedTopics.map((topic: string) => <Badge key={topic} variant="secondary">{topic}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold">Original Question from Founder:</label>
                            <p className="text-sm p-2 bg-gray-100 rounded text-gray-800">{res.founderOriginalQuestion}</p>
                        </div>
                         <div className="space-y-2">
                            <label htmlFor={`admin-text-${res._id}`} className="font-semibold">Admin-Approved Text for Investor:</label>
                             <Textarea
                                id={`admin-text-${res._id}`}
                                value={editingText[res._id] || ''}
                                onChange={(e) => setEditingText(prev => ({ ...prev, [res._id]: e.target.value }))}
                                placeholder="Edit or filter the question if needed before sending to the investor."
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => handleApprove(res._id)}
                                disabled={approveMutation.isPending}
                            >
                                {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Approve & Send to Investor
                            </Button>
                            <Button variant="destructive">Reject</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 