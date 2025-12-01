import { ChatRepository } from "./chat.repository";
import { Chat, ChatMessage, User, ROLE } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private io: SocketIOServer
  ) {}

  // Start conversation with seller
  async startConversation(buyerId: string, sellerId: string): Promise<Chat> {
    // Verify seller exists and is approved
    const seller = await this.chatRepository.verifySeller(sellerId);
    if (!seller) {
      throw new Error("Seller not found or not approved");
    }

    // Get or create conversation
    const conversation = await this.chatRepository.findOrCreateConversation(buyerId, sellerId);
    
    // Emit to seller's room if this is a new conversation
    if (conversation.createdAt.getTime() === new Date().getTime()) {
      this.io.to(`seller:${sellerId}`).emit("newConversation", conversation);
    }

    return conversation;
  }

  // Get user's conversations (as buyer or seller)
  async getMyConversations(userId: string, userRole: 'BUYER' | 'SELLER'): Promise<Chat[]> {
    return this.chatRepository.findUserConversations(userId, userRole);
  }

  // Send message in conversation
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    file?: Express.Multer.File
  ): Promise<ChatMessage> {
    // Get conversation to verify access and determine sender type
    const conversation = await this.chatRepository.findConversationById(conversationId, senderId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Determine sender type
    const senderType = conversation.userId === senderId ? 'BUYER' : 'SELLER';

    // Validate message content
    if (!content?.trim() && !file) {
      throw new Error("Message content cannot be empty");
    }

    let messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT';
    let url: string | undefined;

    // Handle file upload
    if (file) {
      console.log("File received:", {
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      });

      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: file.mimetype.startsWith("image/")
                ? "image"
                : file.mimetype.startsWith("video/")
                ? "video"
                : "auto",
              folder: "chat_media",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          const bufferStream = new Readable();
          bufferStream.push(file.buffer);
          bufferStream.push(null);
          bufferStream.pipe(stream);
        });

        console.log("Cloudinary upload result:", uploadResult);
        messageType = file.mimetype.startsWith("image/") ? "IMAGE" : "FILE";
        url = uploadResult.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new Error("Failed to upload file");
      }
    }

    // Create message
    const message = await this.chatRepository.createMessage({
      conversationId,
      senderId,
      senderType,
      content: content || '',
      messageType,
    });

    // Update conversation metadata
    await this.chatRepository.updateConversationMetadata(conversationId, {
      lastMessage: content || (messageType === 'IMAGE' ? '📷 Image' : '📎 File'),
      lastMessageAt: message.createdAt,
    });

    // Increment unread count for recipient
    await this.chatRepository.incrementUnreadCount(conversationId, senderId);

    // Emit to conversation room
    this.io.to(`chat:${conversationId}`).emit("newMessage", {
      ...message,
      senderType,
    });

    // Emit unread count update to recipient
    const recipientId = conversation.userId === senderId ? conversation.sellerId : conversation.userId;
    if (recipientId) {
      this.io.to(`user:${recipientId}`).emit("unreadCountUpdated", {
        conversationId,
        unreadCount: await this.chatRepository.getUnreadCount(
          recipientId, 
          conversation.userId === recipientId ? 'BUYER' : 'SELLER'
        ),
      });
    }

    return message;
  }

  // Get conversation details with messages
  async getConversation(conversationId: string, userId: string): Promise<Chat | null> {
    const conversation = await this.chatRepository.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }
    return conversation;
  }

  // Get paginated messages
  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: ChatMessage[]; total: number }> {
    // Verify user has access to conversation
    const conversation = await this.chatRepository.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    return this.chatRepository.findConversationMessages(conversationId, page, limit);
  }

  // Mark conversation as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify user has access to conversation
    const conversation = await this.chatRepository.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // Mark messages as read
    await this.chatRepository.markMessagesAsRead(conversationId, userId);

    // Emit read status to other participant
    const otherParticipantId = conversation.userId === userId ? conversation.sellerId : conversation.userId;
    if (otherParticipantId) {
      this.io.to(`chat:${conversationId}`).emit("messagesRead", {
        conversationId,
        userId,
        readAt: new Date(),
      });
    }
  }

  // Get unread message count
  async getUnreadCount(userId: string, userRole: 'BUYER' | 'SELLER'): Promise<number> {
    return this.chatRepository.getUnreadCount(userId, userRole);
  }

  // Legacy methods for backward compatibility
  async createChat(userId: string): Promise<Chat> {
    const chat = await this.chatRepository.createChat(userId);
    this.io.to("admin").emit("chatCreated", chat);
    return chat;
  }

  async getChat(id: string): Promise<Chat | null> {
    const chat = await this.chatRepository.findChatById(id);
    if (!chat) throw new Error("Chat not found");
    return chat;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatRepository.findUserConversations(userId, 'BUYER');
  }

  async getAllChats(status?: "OPEN" | "RESOLVED"): Promise<Chat[]> {
    return this.chatRepository.findAllChats(status);
  }

  async updateChatStatus(
    chatId: string,
    status: "OPEN" | "RESOLVED"
  ): Promise<Chat> {
    const chat = await this.chatRepository.updateChatStatus(chatId, status);
    this.io.to("admin").emit("chatStatusUpdated", chat);
    return chat;
  }

  async createSupportConversation(adminId: string, userId: string): Promise<Chat> {
    return this.chatRepository.createSupportConversation(adminId, userId);
  }
}