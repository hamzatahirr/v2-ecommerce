import { Request, Response } from "express";
import { UserService } from "./user.service";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { makeLogsService } from "../logs/logs.factory";
import AppError from "@/shared/errors/AppError";
import { SubmitVerificationDto, ReviewVerificationDto } from "./user.dto";
import { validateDto } from "@/shared/utils/validateDto";

export class UserController {
  private logsService = makeLogsService();
  constructor(private userService: UserService) {}

  getAllUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await this.userService.getAllUsers();
      sendResponse(res, 200, {
        data: { users },
        message: "Users fetched successfully",
      });
    }
  );

  getUserById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      sendResponse(res, 200, {
        data: { user },
        message: "User fetched successfully",
      });
    }
  );

  getUserByEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);
      sendResponse(res, 200, {
        data: { user },
        message: "User fetched successfully",
      });
    }
  );

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.user?.id;
    console.log("id: ", id);
    const user = await this.userService.getMe(id);
    console.log("user: ", user);
    sendResponse(res, 200, {
      data: { user },
      message: "User fetched successfully",
    });
  });

  updateMe = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updatedData = req.body;
      const user = await this.userService.updateMe(id, updatedData);
      sendResponse(res, 200, {
        data: { user },
        message: "User updated successfully",
      });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("User updated", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        throw new AppError(401, "User not authenticated");
      }

      await this.userService.deleteUser(id, currentUserId);
      sendResponse(res, 204, { message: "User deleted successfully" });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("User deleted", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  submitVerification = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "User not authenticated");
      }

      // Handle both JSON and multipart/form-data requests
      let submissionData: any = {};

      if (req.files) {
        // Handle file uploads
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files.studentIdCard && files.studentIdCard[0]) {
          submissionData.studentIdCard = files.studentIdCard[0].buffer;
          submissionData.studentIdCardFileName = files.studentIdCard[0].originalname;
        }

        if (files.feeChallan && files.feeChallan[0]) {
          submissionData.feeChallan = files.feeChallan[0].buffer;
          submissionData.feeChallanFileName = files.feeChallan[0].originalname;
        }

        // Also check for URLs in body
        if (req.body.studentIdCard) {
          submissionData.studentIdCard = req.body.studentIdCard;
        }
        if (req.body.feeChallan) {
          submissionData.feeChallan = req.body.feeChallan;
        }
      } else {
        // Handle JSON request with URLs
        const validatedData = await validateDto(SubmitVerificationDto, req.body);
        submissionData = validatedData;
      }

      // Validate that at least one document is provided
      if (!submissionData.studentIdCard && !submissionData.feeChallan) {
        throw new AppError(400, "At least one document (student ID card or fee challan) must be provided");
      }

      const result = await this.userService.submitVerificationDocuments(
        userId,
        submissionData
      );

      sendResponse(res, 200, {
        data: { verification: result },
        message: "Verification documents submitted successfully",
      });

      this.logsService.info("Verification documents submitted", {
        userId: req.user?.id,
        sessionId: req.session.id,
      });
    }
  );

  reviewVerification = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const adminId = req.user?.id;
      if (!adminId) {
        throw new AppError(401, "Admin not authenticated");
      }

      // const validatedData = await validateDto(ReviewVerificationDto, req.body);
      const validatedData = req.body;

      const result = await this.userService.reviewVerification(
        validatedData.userId,
        adminId,
        validatedData.status,
        validatedData.rejectionReason
      );

      sendResponse(res, 200, {
        data: { user: result },
        message: "User verification reviewed successfully",
      });

      this.logsService.info("User verification reviewed", {
        adminId: req.user?.id,
        userId: validatedData.userId,
        status: validatedData.status,
        sessionId: req.session.id,
      });
    }
  );

  getUsersByVerificationStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { status } = req.params;

      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        throw new AppError(400, "Invalid verification status");
      }

      const users = await this.userService.getUsersByVerificationStatus(
        status as any
      );

      sendResponse(res, 200, {
        data: { users },
        message: "Users fetched successfully",
      });
    }
  );

  getUserVerificationDetails = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const user = await this.userService.getUserVerificationDetails(id);

      sendResponse(res, 200, {
        data: { user },
        message: "User verification details fetched successfully",
      });
    }
  );

}
