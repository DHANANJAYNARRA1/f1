import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {product.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate(`/product/${product._id}`)} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 