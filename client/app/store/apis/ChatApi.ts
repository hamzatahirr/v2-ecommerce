import { apiSlice } from "../slices/ApiSlice";

// TypeScript types for multi-vendor chat - matching backend Chat model
interface Conversation {
  id: string;
  userId: string;
  sellerId: string | null;
  user: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string } | null;
  lastMessage: string | null;
  lastMessageAt: string;
  userUnread: number;
  sellerUnread: number;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  messages?: Message[]; // Optional messages array for detailed view
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: { id: string; name: string; email: string };
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
  url: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface ConversationDetails {
  status: string;
  conversation: Conversation;
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface UnreadCountResponse {
  unreadCount: number;
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Start conversation with seller
    startConversation: builder.mutation<{ success: boolean; message: string; conversation: Conversation }, { sellerId: string }>({
      query: (data) => ({
        url: '/chat/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),
    
    // Get my conversations (buyer or seller view)
    getMyConversations: builder.query<{ success: boolean; message: string; conversations: Conversation[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversations'],
    }),
    
    // Get conversation by ID with messages
    getConversation: builder.query<{ success: boolean; message: string; conversation: ConversationDetails; messages: Message[]; pagination: any }, { id: string }>({
      query: ({ id }) => `/chat/conversations/${id}`,
      providesTags: ['Conversation'],
    }),
    
    // Send message in conversation
    sendMessage: builder.mutation<{ data: { message: Message } }, { 
      conversationId: string; 
      content: string; 
      messageType?: 'TEXT' | 'IMAGE' | 'FILE';
      file?: File;
    }>({
      query: ({ conversationId, file, ...data }) => {
        if (file) {
          const formData = new FormData();
          formData.append('content', data.content || '');
          if (data.messageType) formData.append('messageType', data.messageType);
          formData.append('file', file);
          
          return {
            url: `/chat/conversations/${conversationId}/messages`,
            method: 'POST',
            body: formData,
          };
        }
        
        return {
          url: `/chat/conversations/${conversationId}/messages`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['Conversation'],
    }),
    
    // Mark conversation as read
    markAsRead: builder.mutation<void, { conversationId: string }>({
      query: ({ conversationId }) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Conversation', 'UnreadCount'],
    }),
    
    // Get unread message count
    getUnreadCount: builder.query<{ data: UnreadCountResponse }, void>({
      query: () => '/chat/unread-count',
      providesTags: ['UnreadCount'],
      transformResponse: (response: { data: UnreadCountResponse }) => response,
    }),

    // Get all chats (for admin/support)
    getAllChats: builder.query<{ conversations: Conversation[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversations'],
    }),

    // Get user chats (for support)
    getUserChats: builder.query<{ conversations: Conversation[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversations'],
    }),

    // Create chat (for support - admin creates conversation with user)
    createChat: builder.mutation<{ data: { conversation: Conversation } }, { userId: string }>({
      query: (data) => ({
        url: '/chat/conversations/support',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Update chat status (for admin)
    updateChatStatus: builder.mutation<{ data: { conversation: Conversation } }, { 
      chatId: string; 
      status: 'OPEN' | 'RESOLVED' 
    }>({
      query: ({ chatId, ...data }) => ({
        url: `/chat/conversations/${chatId}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

// TypeScript hooks for frontend
export const {
  useStartConversationMutation,
  useGetMyConversationsQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetUnreadCountQuery,
  useGetAllChatsQuery,
  useGetUserChatsQuery,
  useCreateChatMutation,
  useUpdateChatStatusMutation,
} = chatApi;
