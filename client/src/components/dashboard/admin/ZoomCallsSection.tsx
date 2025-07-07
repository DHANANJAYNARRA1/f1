import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ZoomCallsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zoom Call Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">This section will display and manage scheduled Zoom calls between founders and investors.</p>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <p className="text-center text-sm text-gray-500">No active Zoom calls.</p>
        </div>
      </CardContent>
    </Card>
  );
} 