import prisma from "@/infra/database/database.config";
import { Chat, ChatMessage, User, ROLE } from "@prisma/client";

export class ChatRepository {
  constructor() {}

  // Get or create conversation between buyer and seller
  async findOrCreateConversation(buyerId: string, sellerId: string): Promise<Chat> {
    // First try to find existing conversation
    let conversation = await prisma.chat.findFirst({
      where: {
        userId: buyerId,
        sellerId: sellerId,
      },
      include: {
        user: true,
        seller: true,
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // If not found, create new conversation
    if (!conversation) {
      conversation = await prisma.chat.create({
        data: {
          userId: buyerId,
          sellerId: sellerId,
          status: "OPEN",
        },
        include: {
          user: true,
          seller: true,
          messages: {
            include: { sender: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return conversation;
  }

  // Get all conversations for a user (as buyer or seller)
  async findUserConversations(userId: string, role: 'BUYER' | 'SELLER'): Promise<Chat[]> {
    const whereClause = role === 'BUYER' 
      ? { userId: userId }
      : { sellerId: userId };

    console.log('Finding conversations for user:', userId, 'as role:', role);
    console.log('Where clause:', whereClause);

    const conversations = await prisma.chat.findMany({
      where: whereClause,
      include: {
        user: true,
        seller: true,
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "desc" },
          take: 1, // Only latest message for preview
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    console.log('Found conversations:', conversations.length);
    return conversations;
  }

  // Get conversation by ID with participant check
  async findConversationById(conversationId: string, userId: string): Promise<Chat | null> {
    console.log('Looking for conversation:', conversationId, 'for user:', userId);
    
    const conversation = await prisma.chat.findFirst({
      where: {
        id: conversationId,
        OR: [
          { userId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        user: true,
        seller: true,
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    console.log('Conversation found:', !!conversation, 'for user access:', conversation ? (conversation.userId === userId || conversation.sellerId === userId) : 'N/A');
    return conversation;
  }

  // Send message
  async createMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: 'BUYER' | 'SELLER';
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  }): Promise<ChatMessage> {
    const { conversationId, senderId, senderType, content, messageType = 'TEXT' } = data;

    return prisma.chatMessage.create({
      data: {
        chatId: conversationId,
        senderId,
        content,
        type: messageType,
        isRead: false,
      },
      include: { sender: true },
    });
  }

  // Get conversation messages with pagination
  async findConversationMessages(
    conversationId: string,
    page: number,
    limit: number
  ): Promise<{ messages: ChatMessage[]; total: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { chatId: conversationId },
        include: { sender: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({
        where: { chatId: conversationId },
      }),
    ]);

    return { messages, total };
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Get conversation to determine user role
    const conversation = await prisma.chat.findUnique({
      where: { id: conversationId },
      select: { userId: true, sellerId: true },
    });

    if (!conversation) return;

    // Determine which unread counter to update
    const isBuyer = conversation.userId === userId;
    const isSeller = conversation.sellerId === userId;

    if (!isBuyer && !isSeller) return; // User not part of conversation

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        chatId: conversationId,
        senderId: { not: userId }, // Only mark messages from other person as read
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update unread count
    if (isBuyer) {
      await prisma.chat.update({
        where: { id: conversationId },
        data: { userUnread: 0 },
      });
    } else if (isSeller) {
      await prisma.chat.update({
        where: { id: conversationId },
        data: { sellerUnread: 0 },
      });
    }
  }

  // Update conversation metadata
  async updateConversationMetadata(
    conversationId: string,
    data: { lastMessage: string; lastMessageAt: Date }
  ): Promise<void> {
    const { lastMessage, lastMessageAt } = data;

    await prisma.chat.update({
      where: { id: conversationId },
      data: {
        lastMessage,
        lastMessageAt,
        updatedAt: new Date(),
      },
    });
  }

  // Increment unread count
  async incrementUnreadCount(conversationId: string, senderId: string): Promise<void> {
    const conversation = await prisma.chat.findUnique({
      where: { id: conversationId },
      select: { userId: true, sellerId: true },
    });

    if (!conversation) return;

    // Increment unread count for the recipient
    if (conversation.userId === senderId && conversation.sellerId) {
      // Sender is buyer, increment seller's unread count
      await prisma.chat.update({
        where: { id: conversationId },
        data: { sellerUnread: { increment: 1 } },
      });
    } else if (conversation.sellerId === senderId) {
      // Sender is seller, increment buyer's unread count
      await prisma.chat.update({
        where: { id: conversationId },
        data: { userUnread: { increment: 1 } },
      });
    }
  }

  // Get unread count
  async getUnreadCount(userId: string, role: 'BUYER' | 'SELLER'): Promise<number> {
    const result = await prisma.chat.aggregate({
      where: role === 'BUYER' 
        ? { userId: userId }
        : { sellerId: userId },
      _sum: {
        userUnread: true,
        sellerUnread: true,
      },
    });

    if (role === 'BUYER') {
      return result._sum.userUnread || 0;
    } else {
      return result._sum.sellerUnread || 0;
    }
  }

  // Verify seller exists and is approved
  async verifySeller(sellerId: string): Promise<User | null> {
    return prisma.user.findFirst({
  where: {
          id: sellerId,
          isSeller: true,
          sellerStatus: 'APPROVED',
        },
      });
    }

  // Legacy methods for backward compatibility
  async createChat(userId: string): Promise<Chat> {
    return prisma.chat.create({
      data: {
        userId,
        status: "OPEN",
      },
      include: { user: true, messages: { include: { sender: true } } },
    });
  }

  // Create support conversation (admin creates conversation with user)
  async createSupportConversation(adminId: string, userId: string): Promise<Chat> {
    return prisma.chat.create({
      data: {
        userId,
        sellerId: adminId, // Admin acts as seller in support conversation
        status: "OPEN",
      },
      include: { user: true, seller: true, messages: { include: { sender: true } } },
    });
  }

  async findChatById(id: string): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { id },
      include: { user: true, messages: { include: { sender: true } } },
    });
  }

  async findAllChats(status?: "OPEN" | "RESOLVED"): Promise<Chat[]> {
    return prisma.chat.findMany({
      where: status ? { status } : {},
      include: { messages: { include: { sender: true } } },
    });
  }

  async updateChatStatus(
    chatId: string,
    status: "OPEN" | "RESOLVED"
  ): Promise<Chat> {
    return prisma.chat.update({
      where: { id: chatId },
      data: { status },
      include: { user: true, messages: { include: { sender: true } } },
    });
  }
}
