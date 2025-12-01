import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { makeChatController } from "./chat.factory";
import protect from "@/shared/middlewares/protect";
import upload from "@/shared/middlewares/upload";

export const configureChatRoutes = (io: SocketIOServer) => {
  const router = express.Router();
  const chatController = makeChatController(io);

  // Multi-vendor chat endpoints

  /**
   * @swagger
   * /chat/conversations:
   *   post:
   *     summary: Start conversation with seller
   *     description: Starts a new conversation between buyer and seller.
   *     security:
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sellerId
   *             properties:
   *               sellerId:
   *                 type: string
   *                 description: ID of the seller to start conversation with
   *     responses:
   *       201:
   *         description: Conversation started successfully.
   *       404:
   *         description: Seller not found.
   *       403:
   *         description: Seller not approved.
   */
  router.post("/conversations", protect, chatController.startConversation);

  /**
   * @swagger
   * /chat/conversations:
   *   get:
   *     summary: Get my conversations
   *     description: Retrieves all conversations for the authenticated user (as buyer or seller).
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of user's conversations with unread counts.
   */
  router.get("/conversations", protect, chatController.getMyConversations);

  /**
   * @swagger
   * /chat/conversations/{id}:
   *   get:
   *     summary: Get conversation details
   *     description: Retrieves conversation details with messages (paginated).
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the conversation to retrieve.
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination.
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Number of messages per page.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Conversation details with messages.
   *       404:
   *         description: Conversation not found.
   *       403:
   *         description: Access denied.
   */
  router.get("/conversations/:id", protect, chatController.getConversation);

  /**
   * @swagger
   * /chat/conversations/{id}/messages:
   *   post:
   *     summary: Send message in conversation
   *     description: Sends a message in a specified conversation, with optional file attachment.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the conversation to send the message to.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *                 description: Message content
   *               messageType:
   *                 type: string
   *                 enum: [TEXT, IMAGE, FILE]
   *                 description: Type of message
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: Optional file attachment
   *     responses:
   *       200:
   *         description: Message sent successfully.
   *       404:
   *         description: Conversation not found.
   *       403:
   *         description: Access denied.
   *       400:
   *         description: Invalid message content.
   */
  router.post(
    "/conversations/:id/messages",
    protect,
    upload.single("file"),
    chatController.sendMessage
  );

  /**
   * @swagger
   * /chat/conversations/{id}/read:
   *   put:
   *     summary: Mark conversation as read
   *     description: Marks all messages in conversation as read for the authenticated user.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the conversation to mark as read.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Conversation marked as read successfully.
   *       404:
   *         description: Conversation not found.
   *       403:
   *         description: Access denied.
   */
  router.put("/conversations/:id/read", protect, chatController.markAsRead);

  /**
   * @swagger
   * /chat/unread-count:
   *   get:
   *     summary: Get unread message count
   *     description: Retrieves total unread message count for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Unread message count retrieved successfully.
   */
  router.get("/unread-count", protect, chatController.getUnreadCount);

  /**
   * @swagger
   * /chat/conversations/support:
   *   post:
   *     summary: Create support conversation
   *     description: Creates a new support conversation (admin only).
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: ID of the user to create conversation with
   *     responses:
   *       201:
   *         description: Support conversation created successfully.
   *       403:
   *         description: Admin access required.
   */
  router.post("/conversations/support", protect, chatController.createSupportConversation);
  
  return router;
};
