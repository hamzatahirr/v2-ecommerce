import { Router } from "express";
import { makeSellerReviewController } from "./seller-review.factory";
import protect from "@/shared/middlewares/protect";
import { validateDto } from "@/shared/middlewares/validateDto";
import { CreateSellerReviewDto, SellerIdDto } from "./seller-review.dto";

const router = Router();
const controller = makeSellerReviewController();

/**
 * @swagger
 * /seller-reviews:
 *   post:
 *     summary: Submit a seller review
 *     description: Allows buyers to submit a review for a seller after order completion.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sellerId
 *               - rating
 *             properties:
 *               sellerId:
 *                 type: string
 *                 description: ID of the seller being reviewed
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *               orderId:
 *                 type: string
 *                 description: Optional order ID to link review to specific order
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or review already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Sellers cannot review other sellers
 *       404:
 *         description: Seller not found
 */
router.post(
  "/",
  protect,
  validateDto(CreateSellerReviewDto),
  controller.createReview
);

/**
 * @swagger
 * /seller-reviews/seller/{sellerId}:
 *   get:
 *     summary: Get seller reviews with pagination
 *     description: Retrieves all reviews for a specific seller with pagination support.
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
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
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Seller not found
 */
router.get(
  "/seller/:sellerId",
  controller.getReviewsBySellerId
);

/**
 * @swagger
 * /seller-reviews/seller/{sellerId}/rating:
 *   get:
 *     summary: Get seller average rating
 *     description: Retrieves the average rating and total review count for a seller.
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Average rating retrieved successfully
 *       404:
 *         description: Seller not found
 */
router.get(
  "/seller/:sellerId/rating",
  controller.getAverageRating
);

/**
 * @swagger
 * /seller-reviews/{id}:
 *   delete:
 *     summary: Delete a seller review
 *     description: Allows reviewers to delete their own review or super admin to delete any review.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 */
router.delete("/:id", protect, controller.deleteReview);

export default router;

