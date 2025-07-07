import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MentorRequestsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Inquiries</CardTitle>
      </CardHeader>
      <CardContent>
        <p>View and respond to requests from founders and investors seeking mentorship or advice.</p>
        {/* TODO: List and manage requests here */}
      </CardContent>
    </Card>
  );
}
