import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";

interface Message {
  _id: string;
  senderId: string;
  content: string;
  timestamp: string;
  adminApproved?: boolean;
}

interface Props {
  userId: string;
  role: string; // "founder" | "investor" | "admin"
  conversationId: string;
  receiverId: string;
}

export default function ChatRoom({ userId, role, conversationId, receiverId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);

  const socketRef = useSocket(userId, role, {
    chatMessage: (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    },
    messageDelivered: () => {},
    limitReached: () => {
      setLimitReached(true);
      setApprovalNeeded(true);
    },
    adminApproved: () => {
      setAdminApproved(true);
      setLimitReached(false);
      setApprovalNeeded(false);
    },
    approvalNeeded: () => {
      setApprovalNeeded(true);
    },
    conversationHistory: (data) => {
      setMessages(data.messages);
    },
    error: (err) => {
      alert(err.message || "Socket error");
    },
  });

  // Fetch conversation history on mount
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("getConversationHistory", { conversationId });
    }
  }, [conversationId, socketRef]);

  // Typing indicator
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit("typing", { conversationId, isTyping: true });
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current?.emit("typing", { conversationId, isTyping: false });
      }, 1000);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!input.trim() || limitReached) return;
    socketRef.current?.emit("chatMessage", {
      conversationId,
      senderId: userId,
      receiverId,
      content: input,
    });
    setInput("");
  };

  // Admin approval action
  const handleAdminApprove = () => {
    socketRef.current?.emit("adminApprove", { conversationId });
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, maxWidth: 400 }}>
      <div style={{ minHeight: 200, marginBottom: 8 }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{ color: msg.senderId === userId ? "blue" : "black" }}>
            <b>{msg.senderId === userId ? "You" : msg.senderId}:</b> {msg.content}
            <span style={{ fontSize: 10, marginLeft: 8 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      {limitReached && (
        <div style={{ color: "red" }}>
          Message limit reached. {approvalNeeded && !adminApproved && "Waiting for admin approval..."}
        </div>
      )}
      <input
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        disabled={limitReached && !adminApproved}
        placeholder="Type a message"
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} disabled={limitReached && !adminApproved}>
        Send
      </button>
      {role === "admin" && approvalNeeded && (
        <button onClick={handleAdminApprove} style={{ marginLeft: 8 }}>
          Approve Conversation
        </button>
      )}
    </div>
  );
}