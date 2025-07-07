import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

type MessagePanelProps = {
  recipientId: string;
  onClose: () => void;
};

export default function MessagePanel({ recipientId, onClose }: MessagePanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch(`/api/messages?to=${user._id}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages));
  }, [user]);

  const sendMessage = async () => {
    if (!user) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: recipientId, content }),
    });
    setContent("");
    // Optionally refetch messages
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="mb-2 font-bold">Messages</div>
      <div className="h-40 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from._id === user?._id ? "text-right" : "text-left"}>
            <span className="block">{msg.content}</span>
            <span className="text-xs text-gray-400">{msg.from.name}</span>
          </div>
        ))}
      </div>
      <Input value={content} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)} placeholder="Type a message..." />
      <Button onClick={sendMessage} className="mt-2">Send</Button>
      <Button onClick={onClose} variant="outline" className="mt-2 ml-2">Close</Button>
    </div>
  );
}