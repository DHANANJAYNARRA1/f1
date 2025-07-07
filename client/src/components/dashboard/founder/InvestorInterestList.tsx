import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCircle, MessageCircle, Building, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface InvestorInterest {
  id: string;
  investorId: string;
  investorName: string;
  productId: string;
  productName: string;
  createdAt: string;
}

interface InvestorInterestListProps {
  maxItems?: number;
}

export default function InvestorInterestList({ maxItems = 5 }: InvestorInterestListProps) {
  const [interests, setInterests] = useState<InvestorInterest[]>([]);

  // Query product interests
  const { data: productInterests, isLoading } = useQuery({
    queryKey: ['/api/user/product-interests'],
    queryFn: async () => {
      return await apiRequest<{ interests: InvestorInterest[] }>('GET', '/api/user/product-interests');
    },
  });

  useEffect(() => {
    if (productInterests?.interests) {
      setInterests(productInterests.interests);
    }
  }, [productInterests]);

  const handleRequestZoomCall = async (investorId: string) => {
    try {
      await apiRequest('POST', '/api/communication-requests', {
        targetId: investorId,
        requestType: 'call',
        subject: 'Discuss product interest',
        message: 'I would like to discuss my product with you based on your expressed interest.',
        ndaAgreed: true
      });
      
      // Show toast notification of success
      // Update local state or refetch as needed
    } catch (error) {
      console.error('Failed to request call:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!interests || interests.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-medium mb-2">No investor interest yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Investors will appear here when they express interest in your products
        </p>
      </div>
    );
  }

  const displayInterests = maxItems ? interests.slice(0, maxItems) : interests;

  return (
    <div className="space-y-4">
      {displayInterests.map((interest) => (
        <Card key={interest.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 p-2 rounded-full">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{interest.investorName}</p>
              <p className="text-sm text-gray-500">Interested in: {interest.productName}</p>
              <p className="text-xs text-gray-400">
                {new Date(interest.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={() => handleRequestZoomCall(interest.investorId)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Request Call
            </Button>
          </div>
        </Card>
      ))}
      
      {interests.length > maxItems && (
        <div className="text-center pt-2">
          <Button variant="link" className="text-primary">
            View all {interests.length} interested investors
          </Button>
        </div>
      )}
    </div>
  );
}