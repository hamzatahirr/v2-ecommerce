import { Router } from "express";
import { makeSellerController } from "./seller.factory";
import protect from "@/shared/middlewares/protect";
import authorizeSeller from "@/shared/middlewares/authorizeSeller";
import { validateDto } from "@/shared/middlewares/validateDto";
import {
  ApplySellerDto,
  UpdateSellerProfileDto,
  SellerIdDto,
} from "./seller.dto";

const router = Router();
const sellerController = makeSellerController();

/**
 * @swagger
 * /sellers/apply:
 *   post:
 *     summary: Apply to become a seller
 *     description: Allows a user to apply to become a seller by creating a seller profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *             properties:
 *               storeName:
 *                 type: string
 *                 description: Name of the store
 *               storeDescription:
 *                 type: string
 *                 description: Description of the store
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               address:
 *                 type: string
 *                 description: Store address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State/Province
 *               country:
 *                 type: string
 *                 description: Country
 *               zipCode:
 *                 type: string
 *                 description: ZIP/Postal code
 *     responses:
 *       201:
 *         description: Seller application submitted successfully
 *       400:
 *         description: Invalid input or already a seller
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/apply",
  protect,
  validateDto(ApplySellerDto),
  sellerController.applyToBecomeSeller
);

/**
 * @swagger
 * /sellers/profile:
 *   get:
 *     summary: Get my seller profile
 *     description: Retrieves the authenticated seller's profile.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.get(
  "/profile",
  protect,
  authorizeSeller,
  sellerController.getMySellerProfile
);

/**
 * @swagger
 * /sellers/profile:
 *   patch:
 *     summary: Update seller profile
 *     description: Updates the authenticated seller's profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *               storeDescription:
 *                 type: string
 *               storeLogo:
 *                 type: string
 *               storeBanner:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.patch(
  "/profile",
  protect,
  authorizeSeller,
  validateDto(UpdateSellerProfileDto),
  sellerController.updateSellerProfile
);

/**
 * @swagger
 * /sellers/stats:
 *   get:
 *     summary: Get seller statistics
 *     description: Retrieves statistics for the authenticated seller including sales, orders, revenue, etc.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.get(
  "/stats",
  protect,
  authorizeSeller,
  sellerController.getSellerStats
);

/**
 * @swagger
 * /sellers/{id}:
 *   get:
 *     summary: Get seller profile by ID
 *     description: Retrieves a seller profile by its ID (public endpoint).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller profile ID
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       404:
 *         description: Seller profile not found
 */
router.get(
  "/:id",
  validateDto(SellerIdDto),
  sellerController.getSellerProfile
);

/**
 * @swagger
 * /sellers/stripe/connect/create:
 *   post:
 *     summary: Create Stripe Connect account
 *     description: Creates a Stripe Connect account for the authenticated seller.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Stripe Connect account created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Account already exists
 */
router.post(
  "/stripe/connect/create",
  protect,
  authorizeSeller,
  sellerController.createConnectAccount
);

/**
 * @swagger
 * /sellers/stripe/connect/onboarding:
 *   post:
 *     summary: Create Stripe Connect onboarding link
 *     description: Creates an onboarding link for the seller to complete Stripe Connect setup.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding link created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Stripe Connect account not found
 */
router.post(
  "/stripe/connect/onboarding",
  protect,
  authorizeSeller,
  sellerController.createOnboardingLink
);

/**
 * @swagger
 * /sellers/stripe/connect/status:
 *   get:
 *     summary: Check Stripe Connect account status
 *     description: Checks the status of the seller's Stripe Connect account.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/stripe/connect/status",
  protect,
  authorizeSeller,
  sellerController.checkAccountStatus
);

/**
 * @swagger
 * /sellers/stripe/connect/dashboard:
 *   get:
 *     summary: Get Stripe Connect dashboard link
 *     description: Gets a login link to the seller's Stripe Connect dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard link created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Stripe Connect account not found
 */
router.get(
  "/stripe/connect/dashboard",
  protect,
  authorizeSeller,
  sellerController.getDashboardLink
);

/**
 * @swagger
 * /sellers/payouts:
 *   get:
 *     summary: Get seller payouts
 *     description: Retrieves all payout records for the authenticated seller.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payouts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.get(
  "/payouts",
  protect,
  authorizeSeller,
  sellerController.getPayouts
);

/**
 * @swagger
 * /sellers/analytics/dashboard:
 *   get:
 *     summary: Get seller dashboard analytics
 *     description: Retrieves comprehensive analytics for the authenticated seller including sales, orders, revenue, reviews, and trends.
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
 *         description: Year for analytics (if timePeriod is year-based)
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
 *         description: Dashboard analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seller profile not found
 */
router.get(
  "/analytics/dashboard",
  protect,
  authorizeSeller,
  sellerController.getDashboardAnalytics
);

/**
 * @swagger
 * /sellers/analytics/products:
 *   get:
 *     summary: Get seller product performance analytics
 *     description: Retrieves product performance metrics for the authenticated seller.
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
 *         description: Product performance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/analytics/products",
  protect,
  authorizeSeller,
  sellerController.getProductPerformance
);

/**
 * @swagger
 * /sellers/analytics/reviews:
 *   get:
 *     summary: Get seller review analytics
 *     description: Retrieves review and rating analytics for the authenticated seller.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/analytics/reviews",
  protect,
  authorizeSeller,
  sellerController.getReviewAnalytics
);

export default router;

