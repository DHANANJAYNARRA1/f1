import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductSubmissions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Product Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This section is for reviewing and verifying new products submitted by founders.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <p className="text-center text-sm text-gray-500">No new product submissions to review.</p>
        </div>
      </CardContent>
    </Card>
  );
}