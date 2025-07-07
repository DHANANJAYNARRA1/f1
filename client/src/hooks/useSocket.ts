import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export function useSocket(userId: string, role: string, onEvents: Record<string, (data: any) => void>) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !role) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.emit("join", { userId, role });

    Object.entries(onEvents).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(onEvents).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.disconnect();
    };
  }, [userId, role]);

  return socketRef;
}