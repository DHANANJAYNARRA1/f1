import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { IProduct } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProductCard = ({ product, onViewDetails }: { product: IProduct, onViewDetails: (product: IProduct) => void }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
            {product.image ? (
                <img src={`/${product.image}`} alt={product.name} className="h-full w-full object-cover" />
            ) : (
                <span className="text-gray-500">No Image</span>
            )}
        </div>
        <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <Badge variant="secondary">{product.category}</Badge>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
            <div className="mt-4 flex justify-end">
                <Button onClick={() => onViewDetails(product)}>View Details</Button>
            </div>
        </CardContent>
    </Card>
);

const ProductCatalogSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data, isLoading, error } = useQuery<{ success: boolean; products: IProduct[] }>({
    queryKey: ['verified-products'],
    queryFn: () => apiRequest('/api/products/verified', 'GET'),
  });

  const categories = useMemo(() => {
    if (!data?.products) return [];
    const cats = data.products.map(p => p.category);
    return [...new Set(cats)];
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter(p => {
        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchesSearch = searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        return matchesCategory && matchesSearch;
    });
  }, [data, searchTerm, selectedCategory]);

  // TODO: Add a modal for viewing product details
  const handleViewDetails = (product: IProduct) => {
    console.log("Viewing details for:", product.name);
  };

  if (error) return <p className="text-red-500">Failed to load products.</p>;

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold">Discover Projects</h2>
                <p className="text-gray-500">Browse and filter through verified founder products.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Input 
                        placeholder="Search by name..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {selectedCategory || "All Categories"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
                        {categories.map(cat => (
                            <DropdownMenuItem key={cat} onSelect={() => setSelectedCategory(cat)}>{cat}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product._id as string} product={product} onViewDetails={handleViewDetails} />
                ))}
            </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
                <p>No products found matching your criteria.</p>
            </div>
        )}
    </div>
  );
};

export default ProductCatalogSection;
