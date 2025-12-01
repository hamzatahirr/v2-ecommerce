"use client";

import React, { useEffect, useMemo } from "react";
import {
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} from "@/app/store/apis/ChatApi";
import { useSocketConnection } from "@/app/(private)/chat/useSocketConnection";
import { useChatMessages } from "@/app/(private)/chat/useChatMessages";

import ChatHeader from "@/app/(private)/chat/components/ChatHeader";
import MessageList from "@/app/(private)/chat/components/MessageList";
import ChatStatus from "@/app/(private)/chat/components/ChatStatus";
import ChatInput from "@/app/(private)/chat/components/ChatInput";
import CallConnectingScreen from "@/app/(private)/chat/CallConnectingScreen";
import CallInProgressScreen from "@/app/(private)/chat/CallInProgressScreen";

import { useGetMeQuery } from "@/app/store/apis/UserApi";
import { useWebRTCCall } from "@/app/(private)/chat/useWebRTCCall";
import CustomLoader from "@/app/components/feedback/CustomLoader";

interface ChatProps {
  chatId: string;
}

const ChatContainer: React.FC<ChatProps> = ({ chatId }) => {
  const { data: userData } = useGetMeQuery(undefined);
  // Extract the actual user object from server response wrapper
  const user = (userData as any)?.user ?? (userData as any) ?? undefined;

  const {
    data,
    isLoading,
    error,
  } = useGetConversationQuery({ id: chatId });

  // Extract conversation and messages based on ACTUAL SERVER RESPONSE
  const chat = data?.conversation || null;
  const serverMessages = data?.messages || [];

  // Mutations
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  // Socket connection scoped to chatId
  const socket = useSocketConnection(chatId);

  // Auto-mark messages as read when conversation opens
  useEffect(() => {
    if (chatId && chat) {
      markAsRead({ conversationId: chatId });
    }
  }, [chatId, chat, markAsRead]);

  // Chat message handler (merges local & server messages)
  const {
    messages: localMessages,
    message,
    setMessage,
    handleSendMessage,
    isTyping
  } = useChatMessages(chatId, userData, chat, socket.socket, sendMessage);

  // Merge server + local messages and sort
  const mergedMessages = useMemo(() => {
    // Create a Map to ensure uniqueness by ID
    const messageMap = new Map();
    
    // Add server messages
    serverMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // Add or update with local messages
    localMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // Convert back to array and sort
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [serverMessages, localMessages]);

  // WebRTC Call Handling
  const { callStatus, endCall } = useWebRTCCall({
    chatId,
    socket: socket.socket
  });

  // UI STATES
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ChatContainer error:', error);
    // Check if it's an authentication error
    if ((error as any)?.status === 401 || (error as any)?.data?.message?.includes('Authentication')) {
      // Don't redirect automatically, let auth layout handle it
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="bg-red-50 border border-red-300 text-red-600 px-6 py-4 rounded-lg shadow-sm">
            Authentication required. Please sign in again.
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="bg-red-50 border border-red-300 text-red-600 px-6 py-4 rounded-lg shadow-sm">
          Error: {(error as any).data?.message || "Failed to load chat"}
        </div>
      </div>
    );
  }

  if (!chat) {
    console.error('Chat not found for ID:', chatId);
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Conversation not found</div>
          <div className="text-sm">The conversation you're trying to access doesn't exist or you don't have permission to view it.</div>
        </div>
      </div>
    );
  }

  const canResolve = false; // no admin features for now

  // RENDER
  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader
        chat={chat}
        onResolve={() => {}}
        canResolve={canResolve}
      />

      <MessageList
        messages={mergedMessages}
        currentUserId={user?.id || ""}
      />

      {isTyping && <ChatStatus isTyping={true} />}

      {callStatus === "calling" && (
        <CallConnectingScreen chat={chat} onCancel={endCall} />
      )}

      {callStatus === "in-call" && (
        <CallInProgressScreen onEndCall={endCall} />
      )}

      {callStatus === "ended" && (
        <div className="p-4 text-gray-600 bg-gray-50">Call ended</div>
      )}

      {chat.status === "OPEN" && (
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
        />
      )}

      {chat.status !== "OPEN" && (
        <div className="p-4 bg-gray-100 text-center text-gray-500 border-t border-gray-200">
          This conversation has been resolved
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
