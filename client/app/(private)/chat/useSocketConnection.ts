import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
// import { addMessage, markMessagesAsRead, setTypingUser, clearTypingUser, updateUnreadCount } from "../store/slices/chatSlice";
const API_PATH = "/api/v1";

export const useSocketConnection = (conversationId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const userRef = useRef<{ isSeller?: boolean } | null>(null);

  useEffect(() => {
    // Determine backend URL
    const serverUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.NEXT_PUBLIC_API_URL_PROD}${API_PATH}`
        : "http://localhost:5000";

    console.log("Socket server URL:", serverUrl);

    // Initialize socket connection - cookies will be sent automatically with withCredentials
    socketRef.current = io(serverUrl, {
      withCredentials: true, // This sends httpOnly cookies automatically
      transports: ['websocket', 'polling']
    });

    // On connect
    socketRef.current?.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);

      // Load user into ref if available
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        userRef.current = JSON.parse(storedUser);
      }

      // If conversationId exists → auto join room
      if (conversationId) {
        joinConversation(conversationId);
      }
    });

    // On disconnect
    socketRef.current?.on("disconnect", () => {
      console.log("Socket disconnected:", socketRef.current?.id);
    });

    // Handle auth errors
    socketRef.current?.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      console.error("Error details:", error.message, (error as any)?.data);

      if (
        error.message.includes("Authentication") ||
        error.message.includes("token")
      ) {
        console.error("Socket authentication failed - token may be expired");
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);


  // Join/leave conversation when conversationId changes
  useEffect(() => {
    if (socketRef.current?.connected && conversationId) {
      joinConversation(conversationId);
    }

    return () => {
      if (socketRef.current?.connected && conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId]);

  // Multi-vendor chat socket methods
  const joinConversation = (conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('joinConversation', conversationId);
      console.log(`Joined conversation: ${conversationId}`);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('leaveConversation', conversationId);
      console.log(`Left conversation: ${conversationId}`);
    }
  };

  const sendMessage = (data: {
    conversationId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', data);
      console.log('Sending message:', data);
    }
  };

  const emitTyping = (conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing', { conversationId });
      console.log('Emitting typing for conversation:', conversationId);
    }
  };

  const onNewConversation = (callback: (conversation: any) => void) => {
    socketRef.current?.on('newConversation', callback);
  };

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    emitTyping,
    onNewConversation: onNewConversation((conversation) => {
      // Handle new conversation for sellers
      if (userRef.current?.isSeller) {
        console.log('New conversation received by seller:', conversation);
        // Could show notification, update UI, etc.
      }
    }),
  };
};
