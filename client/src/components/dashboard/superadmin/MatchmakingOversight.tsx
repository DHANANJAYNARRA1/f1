import { useQuery } from '@tanstack/react-query';
import { apiRequest, ApiResponse } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuperAdminForm {
    _id: string;
    formId: string;
    productId: { anonymousId: string };
    investorId: { anonymousId: string };
    founderId: { anonymousId: string };
    status: string;
    createdAt: string;
}

interface AllFormsResponse {
    forms: SuperAdminForm[];
}

const statusVariant = (status: string): 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'pending-admin-review': return 'secondary';
        case 'pending-founder-response': return 'outline';
        case 'founder-responded': return 'outline';
        case 'closed-accepted': return 'outline';
        case 'closed-rejected': return 'destructive';
        default: return 'outline';
    }
};

export default function MatchmakingOversight() {
    const { data, isLoading, error } = useQuery<ApiResponse<AllFormsResponse>>({
        queryKey: ['superadmin-all-forms'],
        queryFn: async () => apiRequest<ApiResponse<AllFormsResponse>>('GET', '/api/matchmaking/interest-forms/superadmin/all'),
    });

    const forms = data?.forms || [];

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Matchmaking Oversight</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Form ID</TableHead>
                            <TableHead>Investor</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Founder</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {forms.map((form: SuperAdminForm) => (
                            <TableRow key={form._id}>
                                <TableCell>{form.formId}</TableCell>
                                <TableCell>{form.investorId.anonymousId}</TableCell>
                                <TableCell>{form.productId.anonymousId}</TableCell>
                                <TableCell>{form.founderId.anonymousId}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant(form.status)}>{form.status.replace(/-/g, ' ').toUpperCase()}</Badge>
                                </TableCell>
                                <TableCell>{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {forms.length === 0 && <p className="text-center p-4">No matchmaking activity found.</p>}
            </CardContent>
        </Card>
    );
} 