import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AddProductPage() {
    const { toast } = useToast();
    const [product, setProduct] = useState({
        name: '',
        category: '',
        useCase: '',
        problemStatement: '',
        solutionDescription: '',
    });

    const mutation = useMutation({
        mutationFn: (newProduct: typeof product) => apiRequest('POST', '/api/matchmaking/products', newProduct),
        onSuccess: () => {
            toast({ title: "Success!", description: "Your product has been submitted for review." });
            setProduct({ name: '', category: '', useCase: '', problemStatement: '', solutionDescription: '' });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message || "Failed to submit product.", variant: "destructive" });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(product);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Add a New Product</CardTitle>
                    <CardDescription>Fill out the details below to submit your product for investors to see.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" name="name" value={product.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category (e.g., AgriTech, HealthTech)</Label>
                            <Input id="category" name="category" value={product.category} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="useCase">Use Case</Label>
                            <Input id="useCase" name="useCase" value={product.useCase} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="problemStatement">Problem Statement</Label>
                            <Textarea id="problemStatement" name="problemStatement" value={product.problemStatement} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="solutionDescription">Solution Description</Label>
                            <Textarea id="solutionDescription" name="solutionDescription" value={product.solutionDescription} onChange={handleChange} required />
                        </div>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Product
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 