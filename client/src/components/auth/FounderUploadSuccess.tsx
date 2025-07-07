import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FounderUploadSuccess() {
  const [, navigate] = useLocation();
  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader><CardTitle>Documents Submitted!</CardTitle></CardHeader>
      <CardContent>
        <p className="mb-4">Your documents have been submitted successfully. Please log in to continue.</p>
        <Button className="w-full" onClick={() => navigate('/auth')}>Go to Login</Button>
      </CardContent>
    </Card>
  );
} 