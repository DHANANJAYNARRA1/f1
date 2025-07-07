import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, ApiResponse } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface InterestForm {
    _id: string;
    productId: { name: string; anonymousId: string; };
    investorId: { anonymousId: string; };
    messageFromInvestor: string;
}

interface FormsResponse {
    forms: InterestForm[];
}

export default function InvestorRequestsSection() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [adminMessage, setAdminMessage] = useState('');

    const { data, isLoading, error } = useQuery<ApiResponse<FormsResponse>>({
        queryKey: ['admin-interest-forms'],
        queryFn: async () => apiRequest<ApiResponse<FormsResponse>>('GET', '/api/matchmaking/interest-forms/admin'),
    });

    const forwardMutation = useMutation({
        mutationFn: ({ formId, message }: { formId: string; message: string }) =>
            apiRequest('PUT', `/api/matchmaking/interest-forms/admin/${formId}/forward`, { adminToFounderMessage: message }),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Form has been forwarded to the founder.' });
            queryClient.invalidateQueries({ queryKey: ['admin-interest-forms'] });
            setSelectedFormId(null);
            setAdminMessage('');
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message || 'Failed to forward form.', variant: 'destructive' });
        }
    });

    const handleForward = (formId: string) => {
        forwardMutation.mutate({ formId, message: adminMessage });
    };

    const forms = data?.forms || [];

    if (isLoading) return <Loader2 className="animate-spin" />;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Investor Interest Requests</h2>
            {forms.length === 0 && <p>No pending requests.</p>}
            {forms.map((form: InterestForm) => (
                <Card key={form._id}>
                    <CardHeader>
                        <CardTitle>Interest from {form.investorId.anonymousId}</CardTitle>
                        <CardDescription>For product: {form.productId.anonymousId}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Investor's Message:</h4>
                            <p className="p-2 bg-gray-100 rounded">{form.messageFromInvestor}</p>
                        </div>
                        {selectedFormId === form._id ? (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add your message to the founder..."
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={() => handleForward(form._id)} disabled={forwardMutation.isPending}>
                                        {forwardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm & Forward
                                    </Button>
                                    <Button variant="ghost" onClick={() => setSelectedFormId(null)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={() => setSelectedFormId(form._id)}>Approve & Forward to Founder</Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 