import ChatRoom from "../components/ChatRoom";

export default function ChatPage() {
  // Replace with your actual logic to get these values
  const userId = "user123";
  const role = "founder"; // or "investor" or "admin"
  const conversationId = "YOUR_CONVERSATION_ID";
  const receiverId = "user456";

  return (
    <ChatRoom
      userId={userId}
      role={role}
      conversationId={conversationId}
      receiverId={receiverId}
    />
  );
}