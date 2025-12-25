import { Router } from "express";
import { makeUserController } from "./user.factory";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import authorizeRoleHierarchy from "@/shared/middlewares/authorizeRoleHierarchy";
import { validateDto } from "@/shared/middlewares/validateDto";
import { UpdateUserDto, UserEmailDto, UserIdDto, SubmitVerificationDto, ReviewVerificationDto } from "./user.dto";
import multer from "multer";

const router = Router();
const userController = makeUserController();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: Retrieves the profile of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user's profile.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.get("/me", protect, userController.getMe);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users (Admin or SuperAdmin only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all users.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a user by their ID (Admin or SuperAdmin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       404:
 *         description: User not found.
 */
router.get(
  "/:id",
  protect,
  authorizeRole("ADMIN"),
  validateDto(UserIdDto),
  userController.getUserById
);

/**
 * @swagger
 * /users/email/{email}:
 *   get:
 *     summary: Get a user by email
 *     description: Retrieves a user by their email (Admin or SuperAdmin only).
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user to retrieve.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       404:
 *         description: User not found.
 */
router.get(
  "/email/:email",
  protect,
  authorizeRole("ADMIN"),
  validateDto(UserEmailDto),
  userController.getUserByEmail
);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Updates the profile of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.put(
  "/me",
  protect,
  authorizeRole("USER", "ADMIN"),
  validateDto(UpdateUserDto),
  userController.updateMe
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by their ID (Admin or SuperAdmin only).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       404:
 *         description: User not found.
 */
router.delete(
  "/:id",
  protect,
  authorizeRole("ADMIN"),
  authorizeRoleHierarchy("USER"),
  userController.deleteUser
);

/**
 * @swagger
 * /users/verification/submit:
 *   post:
 *     summary: Submit verification documents
 *     description: Allows a user to submit their student ID card and/or fee challan for verification.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitVerificationDto'
 *     responses:
 *       200:
 *         description: Verification documents submitted successfully.
 *       400:
 *         description: Invalid input data or no documents provided.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.post(
  "/verification/submit",
  protect,
  upload.fields([
    { name: 'studentIdCard', maxCount: 1 },
    { name: 'feeChallan', maxCount: 1 }
  ]),
  userController.submitVerification
);

/**
 * @swagger
 * /users/verification/review:
 *   post:
 *     summary: Review user verification
 *     description: Allows an admin to approve or reject a user's verification request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewVerificationDto'
 *     responses:
 *       200:
 *         description: User verification reviewed successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have admin role.
 */
router.post(
  "/verification/review",
  protect,
  authorizeRole("ADMIN"),
  validateDto(ReviewVerificationDto),
  userController.reviewVerification
);

/**
 * @swagger
 * /users/verification/status/{status}:
 *   get:
 *     summary: Get users by verification status
 *     description: Retrieves users filtered by their verification status (Admin only).
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: The verification status to filter by.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 *       400:
 *         description: Invalid verification status.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have admin role.
 */
router.get(
  "/verification/status/:status",
  protect,
  authorizeRole("ADMIN"),
  userController.getUsersByVerificationStatus
);

/**
 * @swagger
 * /users/{id}/verification:
 *   get:
 *     summary: Get user verification details
 *     description: Retrieves verification details for a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User verification details fetched successfully.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       404:
 *         description: User not found.
 */
router.get(
  "/:id/verification",
  protect,
  userController.getUserVerificationDetails
);

export default router;
