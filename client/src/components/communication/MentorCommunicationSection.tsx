import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MentorCommunicationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Communication</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Chat with founders and investors. (Real-time chat integration coming soon.)</p>
        {/* TODO: Integrate Socket.IO and backend for real-time chat */}
      </CardContent>
    </Card>
  );
}
