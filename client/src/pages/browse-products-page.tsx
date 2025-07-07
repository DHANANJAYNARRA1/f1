import { useQuery } from '@tanstack/react-query';
import { apiRequest, ApiResponse } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import InterestModal from '@/components/modals/InterestModal';

interface Product {
    _id: string;
    anonymousId: string;
    category: string;
    useCase: string;
}

// Define the expected structure of the API response
interface ProductsResponse {
    products: Product[];
}

export default function BrowseProductsPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data, isLoading, error } = useQuery<ApiResponse<ProductsResponse>>({
        queryKey: ['products'],
        queryFn: async () => apiRequest<ApiResponse<ProductsResponse>>('GET', '/api/matchmaking/products'),
    });

    const products = data?.products || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message || 'Failed to fetch products.'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                    <Card key={product._id}>
                        <CardHeader>
                            <CardTitle>{product.anonymousId}</CardTitle>
                            <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">Use Case:</p>
                            <p>{product.useCase}</p>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => setSelectedProduct(product)}>Express Interest</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {selectedProduct && (
                <InterestModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
