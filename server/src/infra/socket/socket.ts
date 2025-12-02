import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "@/infra/database/database.config";

export class SocketManager {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_URL_PROD
            : ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      },
    });

    // Add authentication middleware - read from cookies
    this.io.use(async (socket, next) => {
      try {
        // Extract token from cookies in handshake headers
        const cookies = socket.handshake.headers.cookie || socket.request.headers.cookie;
        let token = null;
        
        if (cookies) {
          const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
          if (accessTokenMatch) {
            token = accessTokenMatch[1];
          }
        }
        
        // Fallback to authorization header
        if (!token) {
          token = socket.handshake.headers.authorization?.replace('Bearer ', '');
        }
        
        console.log('SERVER: socket token found:', !!token, 'length:', token ? String(token).length : 0);
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, isSeller: true, role: true }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        console.log('SERVER: Socket authenticated for user:', user.email);
        next();
      } catch (error) {
        console.error('SERVER: Socket authentication error:', error);
        next(new Error('Authentication failed - token may be expired'));
      }
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("New client connected:", socket.id);

      // Join user to their personal room for notifications
      if (socket.data.user) {
        socket.join(`user:${socket.data.user.id}`);
        console.log(`User ${socket.data.user.id} joined their personal room`);

        // Join seller to their personal room for notifications
        if (socket.data.user.isSeller) {
          socket.join(`seller:${socket.data.user.id}`);
          console.log(`Seller ${socket.data.user.id} joined their personal room`);
        }
      }

      // Multi-vendor chat events

      // Join conversation room
      socket.on("joinConversation", async (conversationId: string) => {
        // Verify user has access to conversation (optional - can be handled by service)
        socket.join(`chat:${conversationId}`);
        console.log(`Client ${socket.id} joined conversation:${conversationId}`);
      });

      // Leave conversation room
      socket.on("leaveConversation", (conversationId: string) => {
        socket.leave(`chat:${conversationId}`);
        console.log(`Client ${socket.id} left conversation:${conversationId}`);
      });

      // Send message (real-time)
      socket.on("sendMessage", async (data) => {
        try {
          const { conversationId, content, messageType } = data;
          const senderId = socket.data.user?.id;
          
          if (!senderId || !conversationId) {
            socket.emit("error", { message: "Authentication required or invalid data" });
            return;
          }

          // Validate message content
          if (!content?.trim() && messageType !== 'IMAGE' && messageType !== 'FILE') {
            socket.emit("error", { message: "Message content cannot be empty" });
            return;
          }

          // Import chat service dynamically to avoid circular dependency
          const { makeChatService } = await import("@/modules/chat/chat.factory");
          const chatService = makeChatService(this.io);

          // Create message through service
          const message = await chatService.sendMessage(
            conversationId,
            senderId,
            content || '',
            undefined // No file upload via socket for now
          );

          console.log(`Message sent in conversation:${conversationId} by ${senderId}`);
          
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Typing indicators
      socket.on("typing", ({ conversationId }) => {
        if (socket.data.user) {
          socket.to(`chat:${conversationId}`).emit("userTyping", {
            userId: socket.data.user.id,
            userName: socket.data.user.name,
            conversationId
          });
          console.log(`User ${socket.data.user.id} typing in conversation:${conversationId}`);
        }
      });

      // Stop typing indicator
      socket.on("stopTyping", ({ conversationId }) => {
        if (socket.data.user) {
          socket.to(`chat:${conversationId}`).emit("userStoppedTyping", {
            userId: socket.data.user.id,
            conversationId
          });
          console.log(`User ${socket.data.user.id} stopped typing in conversation:${conversationId}`);
        }
      });

      // Mark messages as read
      socket.on("markAsRead", async (conversationId: string) => {
        try {
          const userId = socket.data.user?.id;
          
          if (!userId || !conversationId) {
            socket.emit("error", { message: "Authentication required or invalid data" });
            return;
          }

          // Import chat service dynamically
          const { makeChatService } = await import("@/modules/chat/chat.factory");
          const chatService = makeChatService(this.io);

          // Mark messages as read through service
          await chatService.markAsRead(conversationId, userId);

          console.log(`Messages marked as read in conversation:${conversationId} by ${userId}`);
          
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("error", { message: "Failed to mark messages as read" });
        }
      });

      // WebRTC events (existing functionality preserved)
      socket.on("callOffer", ({ conversationId, offer }) => {
        socket
          .to(`chat:${conversationId}`)
          .emit("callOffer", { offer, from: socket.id });
        console.log(`Call offer sent for conversation:${conversationId} from ${socket.id}`);
      });

      socket.on("callAnswer", ({ conversationId, answer, to }) => {
        socket.to(to).emit("callAnswer", { answer });
        console.log(`Call answer sent to ${to} for conversation:${conversationId}`);
      });

      socket.on("iceCandidate", ({ conversationId, candidate, to }) => {
        console.log("candidate => ", candidate);
        socket.to(to).emit("iceCandidate", { candidate });
        console.log(`ICE candidate sent to ${to} for conversation:${conversationId}`);
      });

      socket.on("endCall", ({ conversationId }) => {
        socket.to(`chat:${conversationId}`).emit("callEnded");
        console.log(`Call ended for conversation:${conversationId}`);
      });

      // Legacy events for backward compatibility
      socket.on("joinChat", (chatId: string) => {
        socket.join(`chat:${chatId}`);
        console.log(`Client ${socket.id} joined chat:${chatId} (legacy)`);
      });

      socket.on("joinAdmin", () => {
        socket.join("admin");
        console.log(`Client ${socket.id} joined admin room (legacy)`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  // Method to authenticate socket and set user data
  authenticateSocket(socket: Socket, user: any) {
    socket.data.user = user;
    
    // Join appropriate rooms based on user role
    socket.join(`user:${user.id}`);
    if (user.isSeller) {
      socket.join(`seller:${user.id}`);
    }
    
    console.log(`Socket ${socket.id} authenticated for user ${user.id} (${user.role})`);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
