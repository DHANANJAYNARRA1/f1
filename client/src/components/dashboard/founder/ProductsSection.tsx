import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { IProduct } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductsSection = () => {
  const { data, isLoading, error } = useQuery<{ success: boolean; products: IProduct[] }>({
    queryKey: ["founder-products"],
    queryFn: () => apiRequest('/api/products/founder', 'GET'),
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'pending_review':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div>
      <CardHeader>
        <CardTitle>My Products & Projects</CardTitle>
        <CardDescription>A list of all your submitted products and their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load your products. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.products?.map(product => (
                <Card key={product._id as string} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{product.description}</p>
                    {getStatusBadge(product.status)}
                  </CardContent>
                  <div className="p-4 border-t flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-black">View Details</Button>
                      <Button variant="default" size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>

            {data?.products?.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No products yet!</h3>
                <p className="text-gray-500 mt-2">Click "Add Product" in the sidebar to get started.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </div>
  );
};

export default ProductsSection; 