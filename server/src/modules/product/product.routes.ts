import express from "express";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import authorizeSeller from "@/shared/middlewares/authorizeSeller";
import authorizeSellerOrAdmin from "@/shared/middlewares/authorizeSellerOrAdmin";
import authorizeProductOwner from "@/shared/middlewares/authorizeProductOwner";
import protect from "@/shared/middlewares/protect";
import { makeProductController } from "./product.factory";
import upload from "@/shared/middlewares/upload";

const router = express.Router();
const productController = makeProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves a list of all products.
 *     responses:
 *       200:
 *         description: A list of products.
 */
router.get("/", protect, productController.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieves a specific product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Product details.
 *       404:
 *         description: Product not found.
 */
router.get("/:id", productController.getProductById);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     description: Retrieves a specific product by its slug.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the product to retrieve.
 *     responses:
 *       200:
 *         description: Product details.
 *       404:
 *         description: Product not found.
 */
router.get("/slug/:slug", productController.getProductBySlug);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product
 *     description: Updates a specific product by its ID (Admin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.put(
  "/:id",
  protect,
  authorizeSellerOrAdmin,
  authorizeProductOwner,
  upload.array("images", 10),
  productController.updateProduct
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product
 *     description: Creates a new product (Seller or Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isNew:
 *                 type: string
 *                 example: "true"
 *               isTrending:
 *                 type: string
 *                 example: "false"
 *               isBestSeller:
 *                 type: string
 *                 example: "false"
 *               isFeatured:
 *                 type: string
 *                 example: "true"
 *               categoryId:
 *                 type: string
 *
 *               # --- VARIANTS ARRAY ---
 *               variants:
 *                 type: array
 *                 description: "At least one variant is required"
 *                 items:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: string
 *                       example: "1999"
 *                     stock:
 *                       type: string
 *                       example: "50"
 *                     lowStockThreshold:
 *                       type: string
 *                       example: "10"
 *                     attributes:
 *                       type: string
 *                       description: "JSON string"
 *                       example: '[{"key":"color", "value":"red"}]'
 *                     imageIndexes:
 *                       type: string
 *                       description: "JSON array of indexes pointing to uploaded images"
 *                       example: "[0,1]"
 *
 *               # --- IMAGES UPLOAD ---
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized.
 */

router.post(
  "/",
  protect,
  authorizeSeller,
  upload.any(),
  productController.createProduct
);

/**
 * @swagger
 * /products/bulk:
 *   post:
 *     summary: Bulk create products
 *     description: Bulk creates multiple products via file upload (Admin only).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Products created successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.post(
  "/bulk",
  protect,
  authorizeRole("ADMIN"),
  upload.single("file"),
  productController.bulkCreateProducts
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Deletes a specific product by its ID (Admin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       404:
 *         description: Product not found.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.delete(
  "/:id",
  protect,
  authorizeSellerOrAdmin,
  authorizeProductOwner,
  productController.deleteProduct
);

export default router;
