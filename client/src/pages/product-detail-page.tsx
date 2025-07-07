import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product } from '@shared/schema';
import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PdfViewer from '@/components/ui/PdfViewer';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ApiResponse {
    success: boolean;
    product: Product;
}

export default function ProductDetailPage() {
    const [, params] = useRoute("/product/:id");
    const productId = params?.id;

    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfTitle, setPdfTitle] = useState('');

    const { expressInterest } = useAuth();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery<ApiResponse>({
        queryKey: ['product', productId],
        queryFn: () => apiRequest('GET', `/api/products/${productId}`),
        enabled: !!productId,
    });

    const openPdfModal = (url: string, title: string) => {
        setPdfUrl(url);
        setPdfTitle(title);
        setIsPdfModalOpen(true);
    };

    const handleExpressInterest = () => {
        if (!productId) return;
        expressInterest.mutate(
            { productId },
            {
                onSuccess: () => {
                    toast({
                        title: 'Interest Expressed',
                        description: 'The founder has been notified of your interest.',
                    });
                },
                onError: (err) => {
                    toast({
                        title: 'Error',
                        description: err.message || 'Could not express interest.',
                        variant: 'destructive',
                    });
                },
            }
        );
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-12 w-12" /></div>;
    }

    if (error) {
        return <div className="p-8"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert></div>;
    }

    const product = data?.product;

    if (!product) {
        return <div className="p-8 text-center">Product not found.</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>{product.description}</p>
                    
                    {/* Add more product details here */}

                    <div className="flex space-x-4">
                        <Button onClick={handleExpressInterest} disabled={expressInterest.isPending}>
                            {expressInterest.isPending ? 'Submitting...' : 'Express Interest'}
                        </Button>
                        {product.pitchDeck &&
                            <Button variant="outline" onClick={() => openPdfModal(product.pitchDeck!, 'Pitch Deck')}>
                                View Pitch Deck
                            </Button>
                        }
                        {product.documents?.businessPlan &&
                            <Button variant="outline" onClick={() => openPdfModal(product.documents.businessPlan, 'Business Plan')}>
                                View Documents
                            </Button>
                        }
                        <Button variant="ghost">Save for Later</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{pdfTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="h-full overflow-y-auto">
                        <PdfViewer fileUrl={pdfUrl} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 