import { useEffect, useState } from "react";
import { socket } from "@/socket";

export function useAdminChat() {
  const [pendingApprovals, setPendingApprovals] = useState<string[]>([]);

  useEffect(() => {
    socket.emit("join", { userId: "admin", role: "admin" });

    socket.on("approvalNeeded", ({ conversationId }) => {
      setPendingApprovals((prev) => [...prev, conversationId]);
    });

    socket.on('dealFinalized', (data) => {
      alert(data.message);
      // Optionally, refresh user data
    });

    socket.on("formReviewed", (data) => {
      // Update product status in your state/query cache
      // Example: refetch products or update the specific product in state
    });

    return () => {
      socket.off("approvalNeeded");
      socket.off("formReviewed");
    };
  }, []);

  const approve = (conversationId: string) => {
    socket.emit("adminApprove", { conversationId });
    setPendingApprovals((prev) => prev.filter((id) => id !== conversationId));
  };

  return { pendingApprovals, approve };
}