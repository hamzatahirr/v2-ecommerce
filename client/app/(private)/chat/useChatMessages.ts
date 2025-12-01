import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

export const useChatMessages = (
  chatId: string,
  user?: { id: string; name: string; role: string },
  chat?: any,
  socket?: Socket | null,
  sendMessage?: any
) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeoutRef] = useState<NodeJS.Timeout | null>(
    null
  );

  // Update messages when chat data is fetched
  useEffect(() => {
    if (chat?.messages) {
      setMessages((prev) => {
        // Create a Map to ensure uniqueness by ID
        const messageMap = new Map();
        
        // Add existing messages
        prev.forEach(msg => messageMap.set(msg.id, msg));
        
        // Add or update with new messages
        chat.messages.forEach((msg: any) => {
          messageMap.set(msg.id, msg);
        });
        
        // Convert back to array and sort
        return Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  }, [chat?.messages]);

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    // Set up socket event listeners
    const handleNewMessage = (newMessage: any) => {
      setMessages((prev) => {
        // Normalize sender field
        const normalizedMessage = {
          ...newMessage,
          sender: newMessage.sender || { id: newMessage.senderId, name: 'Unknown User' },
        };
        
        // Create a Map to ensure uniqueness
        const messageMap = new Map();
        
        // Add existing messages
        prev.forEach(msg => messageMap.set(msg.id, msg));
        
        // Add or update new message
        messageMap.set(normalizedMessage.id, normalizedMessage);
        
        // Convert back to array and sort
        return Array.from(messageMap.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    };

    const handleUserTyping = (typingUser: any) => {
      if (typingUser.userId !== user?.id) {
        setIsTyping(true);
        const timeout = setTimeout(() => setIsTyping(false), 3000);
        setTypingTimeoutRef(timeout);
      }
    };

    const handleUserStoppedTyping = () => {
      setIsTyping(false);
    };

    const handleMessagesRead = (data: any) => {
      // Update read status for messages in the conversation
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId !== user?.id
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    };

    const handleUnreadCountUpdate = (data: any) => {
      console.log('Unread count updated:', data);
      // This could update a global unread count state
    };

    // Register event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("unreadCountUpdated", handleUnreadCountUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("unreadCountUpdated", handleUnreadCountUpdate);
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [socket, user?.id, typingTimeout]);

  // Emit typing event
  useEffect(() => {
    if (message && socket && chatId) {
      socket.emit("typing", { conversationId: chatId });
    }
  }, [message, socket, chatId]);

  // Send a message
  const handleSendMessage = async (file?: File) => {
    if (!message.trim() && !file) return;

    try {
      const result = await sendMessage({
        conversationId: chatId,
        content: message || undefined,
        messageType: file ? (file.type.startsWith('image/') ? 'IMAGE' : 'FILE') : 'TEXT',
      }).unwrap();
      console.log("result => ", result);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };
  return {
    messages,
    message,
    setMessage,
    handleSendMessage,
    isTyping,
  };
};
