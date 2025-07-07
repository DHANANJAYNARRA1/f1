import { useEffect, useState } from "react";
import { socket } from "@/socket";

export function useChat(conversationId: string, userId: string, role: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    socket.emit("join", { userId, role });

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("limitReached", ({ conversationId: id }) => {
      if (id === conversationId) setLimitReached(true);
    });

    socket.on("adminApproved", ({ conversationId: id }) => {
      if (id === conversationId) setLimitReached(false);
    });

    return () => {
      socket.off("chatMessage");
      socket.off("limitReached");
      socket.off("adminApproved");
    };
  }, [conversationId, userId, role]);

  const sendMessage = (msg: any) => {
    if (!limitReached) socket.emit("chatMessage", msg);
  };

  return { messages, sendMessage, limitReached };
}