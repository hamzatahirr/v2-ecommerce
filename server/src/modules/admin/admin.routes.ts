import { Router } from "express";
import { makeAdminController } from "./admin.factory";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import { validateDto } from "@/shared/middlewares/validateDto";
import { SellerIdDto, SellerListQueryDto } from "./admin.dto";

const router = Router();
const adminController = makeAdminController();

/**
 * @swagger
 * /admin/sellers/pending:
 *   get:
 *     summary: Get pending seller applications
 *     description: Retrieves a list of sellers with pending approval status (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pending sellers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get(
  "/sellers/pending",
  protect,
  authorizeRole("ADMIN"),
  adminController.getPendingSellers
);

/**
 * @swagger
 * /admin/sellers:
 *   get:
 *     summary: Get all sellers with filters
 *     description: Retrieves a list of all sellers with optional filters (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING_APPROVAL, APPROVED, SUSPENDED, REJECTED]
 *         description: Filter by seller status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or store name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Sellers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get(
  "/sellers",
  protect,
  authorizeRole("ADMIN"),
  adminController.getAllSellers
);

/**
 * @swagger
 * /admin/sellers/{id}/approve:
 *   post:
 *     summary: Approve a seller
 *     description: Approves a pending seller application (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller user ID
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *       400:
 *         description: Invalid request or seller already approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 *       404:
 *         description: Seller not found
 */
router.post(
  "/sellers/:id/approve",
  protect,
  authorizeRole("ADMIN"),
  // validateDto(SellerIdDto),
  adminController.approveSeller
);

/**
 * @swagger
 * /admin/sellers/{id}/reject:
 *   post:
 *     summary: Reject a seller
 *     description: Rejects a pending seller application (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller user ID
 *     responses:
 *       200:
 *         description: Seller rejected successfully
 *       400:
 *         description: Invalid request or seller already rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 *       404:
 *         description: Seller not found
 */
router.post(
  "/sellers/:id/reject",
  protect,
  authorizeRole("ADMIN"),
  // validateDto(SellerIdDto),
  adminController.rejectSeller
);

/**
 * @swagger
 * /admin/sellers/{id}/suspend:
 *   post:
 *     summary: Suspend a seller
 *     description: Suspends an approved seller (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller user ID
 *     responses:
 *       200:
 *         description: Seller suspended successfully
 *       400:
 *         description: Invalid request or seller already suspended
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 *       404:
 *         description: Seller not found
 */
router.post(
  "/sellers/:id/suspend",
  protect,
  authorizeRole("ADMIN"),
  // validateDto(SellerIdDto),
  adminController.suspendSeller
);

/**
 * @swagger
 * /admin/analytics/sellers:
 *   get:
 *     summary: Get aggregated seller analytics
 *     description: Retrieves aggregated analytics for all sellers with per-seller breakdown (SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [last7days, lastMonth, lastYear, allTime, custom]
 *         description: Time period for analytics
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for analytics
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom range
 *     responses:
 *       200:
 *         description: Aggregated seller analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - SuperAdmin only
 */
router.get(
  "/analytics/sellers",
  protect,
  authorizeRole("ADMIN"),
  adminController.getAggregatedSellerAnalytics
);

export default router;

