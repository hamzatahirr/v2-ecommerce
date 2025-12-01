import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { ChatService } from "./chat.service";
import { makeLogsService } from "../logs/logs.factory";
import { ROLE } from "@prisma/client";

export class ChatController {
  private logsService = makeLogsService();
  constructor(private chatService: ChatService) {}

  // Start conversation with seller
  startConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const { sellerId } = req.body;
    const buyerId = req.user.id;
    console.log('Starting conversation:', { buyerId, sellerId });

    if (!sellerId) {
      return sendResponse(res, 400, { message: "Seller ID is required" });
    }

    try {
      const conversation = await this.chatService.startConversation(buyerId, sellerId);

      sendResponse(res, 201, {
        data: { conversation },
        message: "Conversation started successfully",
      });

      this.logsService.info("Conversation started", {
        buyerId,
        sellerId,
        conversationId: conversation.id,
      });
    } catch (error: any) {
      if (error.message === "Seller not found or not approved") {
        return sendResponse(res, 404, { message: "Seller not found or not approved" });
      }
      throw error;
    }
  });

  // Get all conversations (buyer or seller view)
  getMyConversations = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const userId = req.user.id;
    const userRole = req.user.isSeller ? 'SELLER' : 'BUYER';

    try {
      const conversations = await this.chatService.getMyConversations(userId, userRole);

      console.log('=== CONTROLLER DEBUG ===');
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      console.log('Conversations found:', conversations.length);
      console.log('About to call sendResponse...');
      console.log('Conversations to send:', conversations.length);
      console.log('Conversations data:', JSON.stringify(conversations, null, 2));

      const response = sendResponse(res, 200, {
        data: { conversations },
        message: "Conversations fetched successfully",
      });

      console.log('sendResponse called, returned:', typeof response);
      console.log('Response will be sent with data:', { conversations: conversations.length });

      this.logsService.info("Conversations fetched", {
        userId,
        userRole,
        count: conversations.length,
      });
    } catch (error: any) {
      throw error;
    }
  });

  // Get conversation by ID with messages
  getConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const { id: conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!conversationId) {
      return sendResponse(res, 400, { message: "Conversation ID is required" });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return sendResponse(res, 400, { 
        message: "Invalid pagination parameters"
      });
    }

    try {
      const conversation = await this.chatService.getConversation(conversationId, req.user.id);
      const { messages, total } = await this.chatService.getConversationMessages(
        conversationId,
        req.user.id,
        pageNum,
        limitNum
      );

      sendResponse(res, 200, {
        data: { conversation, messages, pagination: { page: pageNum, limit: limitNum, total } },
        message: "Conversation fetched successfully",
      });

      this.logsService.info("Conversation fetched", {
        userId: req.user.id,
        conversationId,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error: any) {
      if (error.message === "Conversation not found or access denied") {
        return sendResponse(res, 403, { message: "Conversation not found or access denied" });
      }
      throw error;
    }
  });

  // Send message in conversation
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const { id: conversationId } = req.params;
    const { content, messageType } = req.body;
    const file = req.file;

    if (!conversationId) {
      return sendResponse(res, 400, { message: "Conversation ID is required" });
    }

    // Validate message content
    if (!content?.trim() && !file) {
      return sendResponse(res, 400, { message: "Message content cannot be empty" });
    }

    try {
      const message = await this.chatService.sendMessage(
        conversationId,
        req.user.id,
        content || '',
        file
      );

      sendResponse(res, 200, {
        data: { message },
        message: "Message sent successfully",
      });

      this.logsService.info("Message sent", {
        userId: req.user.id,
        conversationId,
        messageType: message.type,
      });
    } catch (error: any) {
      if (error.message === "Conversation not found or access denied") {
        return sendResponse(res, 403, { message: "Conversation not found or access denied" });
      }
      if (error.message === "Failed to upload file") {
        return sendResponse(res, 400, { message: "Failed to upload file" });
      }
      throw error;
    }
  });

  // Mark conversation as read
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const { id: conversationId } = req.params;

    if (!conversationId) {
      return sendResponse(res, 400, { message: "Conversation ID is required" });
    }

    try {
      await this.chatService.markAsRead(conversationId, req.user.id);

      sendResponse(res, 200, {
        message: "Conversation marked as read",
      });

      this.logsService.info("Conversation marked as read", {
        userId: req.user.id,
        conversationId,
      });
    } catch (error: any) {
      if (error.message === "Conversation not found or access denied") {
        return sendResponse(res, 403, { message: "Conversation not found or access denied" });
      }
      throw error;
    }
  });

  // Get unread message count
  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendResponse(res, 401, { message: "Authentication required" });
    }

    const userRole = req.user.isSeller ? 'SELLER' : 'BUYER';

    try {
      const unreadCount = await this.chatService.getUnreadCount(req.user.id, userRole);

      sendResponse(res, 200, {
        data: { unreadCount },
        message: "Unread count fetched successfully",
      });

      this.logsService.info("Unread count fetched", {
        userId: req.user.id,
        userRole,
        unreadCount,
      });
    } catch (error: any) {
      throw error;
    }
  });

  // Create support conversation (admin only)
  createSupportConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;
      const adminId = req.user?.id;
      
      if (!adminId) {
        return sendResponse(res, 401, { message: "Authentication required" });
      }
      
      if (!userId) {
        return sendResponse(res, 400, { message: "User ID is required" });
      }
      
      const conversation = await this.chatService.createSupportConversation(adminId, userId);
      
      sendResponse(res, 201, { 
        message: "Support conversation created successfully",
        data: { conversation }
      });
    } catch (error) {
      console.error("Error creating support conversation:", error);
      sendResponse(res, 500, { message: "Failed to create support conversation" });
    }
  });
}