import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Clock } from "lucide-react";

const PendingVerification = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Application Pending Review</CardTitle>
          <CardDescription className="mt-2 text-gray-600">
            Thank you for submitting your documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Your application is currently being reviewed by our team. This process usually takes 2-3 business days. 
            You will receive an email notification once the review is complete. You can then log in to access the full features of your dashboard.
          </p>
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <Mail className="mr-2 h-4 w-4" />
            <span>Contact support@example.com for any urgent inquiries.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingVerification; 