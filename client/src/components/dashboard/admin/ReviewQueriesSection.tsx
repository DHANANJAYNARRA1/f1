import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// This will be used later when we build the full workflow
// import ReviewQueryModal from './ReviewQueryModal';

interface Query {
  _id: string;
  productName: string;
  investorEmail: string;
  primaryIntent: string;
  originalQuestion: string;
  status: string;
}

const fetchQueries = async (): Promise<Query[]> => {
  // This endpoint needs to be fully implemented on the backend.
  // For now, we return an empty array to prevent errors.
  try {
    const data = await apiRequest<{ queries: Query[] }>("GET", "/api/query/admin/review-queries");
    return data.queries || [];
  } catch (error) {
    console.error("Failed to fetch queries:", error);
    return []; // Return empty array on error to prevent crashes
  }
};

export default function ReviewQueriesSection() {
  const { data: queries, isLoading, error } = useQuery({
    queryKey: ["adminReviewQueries"],
    queryFn: fetchQueries,
  });
  
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  if (isLoading) return <div>Loading queries for review...</div>;

  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">Review Investor Queries</h2>
        <p className="text-gray-600">Review, edit, and approve queries submitted by investors before forwarding them to founders.</p>
        
        <div className="space-y-4">
            {queries && queries.length > 0 ? queries.map((query) => (
                <Card key={query._id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Query for: {query.productName}</span>
                            <Badge variant={query.status === 'pending_admin_review' ? 'destructive' : 'secondary'}>
                                {query.status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            From Investor: {query.investorEmail}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">Primary Intent:</p>
                        <p className="mb-2">{query.primaryIntent}</p>
                        <p className="font-semibold">Original Question:</p>
                        <p className="text-sm p-2 bg-gray-100 rounded">{query.originalQuestion}</p>
                        <Button className="mt-4" onClick={() => setSelectedQuery(query)}>
                            Review & Approve
                        </Button>
                    </CardContent>
                </Card>
            )) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">No pending queries to review.</p>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* The modal for reviewing will be implemented next */}
        {/* 
        {selectedQuery && (
            <ReviewQueryModal
                isOpen={!!selectedQuery}
                onClose={() => setSelectedQuery(null)}
                query={selectedQuery}
            />
        )}
        */}
    </div>
  );
}
