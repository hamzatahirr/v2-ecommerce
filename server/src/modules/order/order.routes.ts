import express from "express";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import authorizeSellerOrAdmin from "@/shared/middlewares/authorizeSellerOrAdmin";
import { makeOrderController } from "./order.factory";

const router = express.Router();
const orderController = makeOrderController();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     description: Retrieves all orders in the system. Accessible only by admins and superadmins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all orders.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.get(
  "/",
  protect,
  authorizeSellerOrAdmin,
  orderController.getAllOrders
);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Get user orders
 *     description: Retrieves all orders placed by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders placed by the user.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.get("/user", protect, orderController.getUserOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     description: Retrieves detailed information about a specific order.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to retrieve.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The details of the specified order.
 *       404:
 *         description: Order not found.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.get("/:orderId", protect, orderController.getOrderDetails);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from cart
 *     description: Creates orders from the user's cart, splitting by seller.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *                 description: The ID of the cart to convert to orders
 *     responses:
 *       201:
 *         description: Orders created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, orderController.createOrder);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     description: Updates the status of an order. Only the seller of the order or admin can update.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, REJECTED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/status", protect, authorizeSellerOrAdmin, orderController.updateOrderStatus);

/**
 * @swagger
 * /orders/{orderId}/accept:
 *   patch:
 *     summary: Accept order
 *     description: Accepts an order. Only the seller of the order can accept.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order accepted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/accept", protect, authorizeSellerOrAdmin, orderController.acceptOrder);

/**
 * @swagger
 * /orders/{orderId}/reject:
 *   patch:
 *     summary: Reject order
 *     description: Rejects an order. Only the seller of the order can reject.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order rejected successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/reject", protect, authorizeSellerOrAdmin, orderController.rejectOrder);

/**
 * @swagger
 * /orders/{orderId}/ship:
 *   patch:
 *     summary: Ship order
 *     description: Marks an order as shipped. Only the seller of the order can ship.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order shipped successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/ship", protect, authorizeSellerOrAdmin, orderController.shipOrder);

/**
 * @swagger
 * /orders/{orderId}/complete:
 *   patch:
 *     summary: Complete order
 *     description: Marks an order as delivered/completed. Only the seller of the order can complete.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order completed successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch("/:orderId/complete", protect, authorizeSellerOrAdmin, orderController.completeOrder);

export default router;
