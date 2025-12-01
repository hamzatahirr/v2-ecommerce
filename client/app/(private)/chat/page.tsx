"use client";
import { useState, useEffect } from "react";
import { useGetMyConversationsQuery } from "@/app/store/apis/ChatApi";
import { useGetMeQuery } from "@/app/store/apis/UserApi";
import { useRouter, useParams } from "next/navigation";
import ChatContainer from "@/app/(private)/chat/components/ChatContainer";
import MainLayout from "@/app/components/templates/MainLayout";
import { MessageCircle, ShoppingBag, Clock } from "lucide-react";

export default function ChatIndexPage() {
  const router = useRouter();
  const params = useParams();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { data: userData } = useGetMeQuery(undefined);
  // Server may return either `User` directly or a wrapper { success, message, user }
  // Keep the API unchanged and handle both shapes safely here.
  const user = (userData as any)?.user ?? (userData as any) ?? undefined;
  const { data: conversationsData, isLoading } = useGetMyConversationsQuery(undefined);
  const conversations = conversationsData?.conversations || [];

  function getConversationName(conversation, currentUserId) {
    const isUser = conversation.userId === currentUserId;
    const isSeller = conversation.sellerId === currentUserId;

    if (isUser) {
      return conversation.seller?.name || "Unknown Seller";
    }

    if (isSeller) {
      return conversation.user?.name || "Unknown User";
    }

    return "Unknown Conversation";
  }

  // Handle URL parameter for chat ID (for main chat page, params.id should be undefined)
  useEffect(() => {
    // On the main chat page (/chat), there should be no id parameter
    // Keep the current activeChatId or set to null if none
    if (!params?.id && activeChatId) {
      // User navigated to /chat directly, clear the active chat
      setActiveChatId(null);
    }
  }, [params?.id, activeChatId]);

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    router.push(`/chat/${chatId}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const content = (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Messages
            </h1>
            <div className="text-sm text-gray-500">
              {conversations.length} conversations
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading conversations...
            </div>
            ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 font-medium mb-2">No conversations yet</div>
              <p className="text-gray-400 text-sm">
                Start a conversation with a seller to begin messaging
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                 <div
                   key={conversation.id}
                   onClick={() => handleChatSelect(conversation.id)}
                   className={`p-4 cursor-pointer transition-colors ${activeChatId === conversation.id
                       ? "bg-blue-50 border-l-4 border-blue-600"
                       : "hover:bg-gray-50"
                     }`}
                 >
                   <div className="flex items-start space-x-3">
                     {/* Avatar */}
                     <div className="flex-shrink-0">
                       <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                         {(() => {
                           const participantName = getConversationName(conversation, user?.id);
                           return participantName ? (
                             <span className="text-white font-bold text-sm">
                               {participantName[0]?.toUpperCase()}
                             </span>
                           ) : (
                             <ShoppingBag className="w-6 h-6 text-white" />
                           );
                         })()}
                       </div>
                     </div>

                     {/* Content */}
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                         <h3 className="font-semibold text-gray-900 truncate">
                           {(() => {
                             const participantName = user?.isSeller ? conversation.user?.name : conversation.seller?.name;
                             return participantName || 'Support';
                           })()}
                         </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 truncate mb-2">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${conversation.status === "OPEN"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1 ${conversation.status === "OPEN" ? "bg-green-400" : "bg-gray-400"
                                }`}
                            ></span>
                            {conversation.status === "OPEN" ? "Active" : "Closed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeChatId ? (
          <ChatContainer chatId={activeChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500">
                Choose a conversation from sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  return user?.isSeller === false ? <MainLayout>{content}</MainLayout> : content;
}