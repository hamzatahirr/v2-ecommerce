import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { WithdrawalService } from "./withdrawal.service";
import { makeWithdrawalService } from "./withdrawal.factory";
import { makeLogsService } from "../logs/logs.factory";
import { validateZodSchema } from "@/shared/utils/validateZodSchema";
import { createWithdrawalSchema, updateWithdrawalStatusSchema } from "./withdrawal.dto";

export class WithdrawalController {
  private logsService = makeLogsService();
  private withdrawalService;

  constructor(withdrawalService: any) {
    this.withdrawalService = withdrawalService;
  }

  requestWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const validationResult = await validateZodSchema(createWithdrawalSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { amount, method = "BANK_TRANSFER", details } = validationResult.validData!;

    const withdrawal = await this.withdrawalService.requestWithdrawal(
      sellerId,
      amount,
      method,
      details
    );
    
    sendResponse(res, 201, {
      data: withdrawal,
      message: "Withdrawal request submitted successfully"
    });

    this.logsService.info("Seller requested withdrawal", {
      sellerId,
      amount,
      method,
      withdrawalId: withdrawal.id
    });
  });

  getSellerWithdrawals = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.withdrawalService.getSellerWithdrawals(sellerId, page, limit);
    
    sendResponse(res, 200, {
      data: result,
      message: "Seller withdrawals retrieved successfully"
    });
  });

  getWithdrawalDetails = asyncHandler(async (req: Request, res: Response) => {
    const { withdrawalId } = req.params;
    const sellerId = req.user?.id;

    const withdrawal = await this.withdrawalService.getWithdrawalDetails(withdrawalId, sellerId);
    
    sendResponse(res, 200, {
      data: withdrawal,
      message: "Withdrawal details retrieved successfully"
    });
  });

  getSellerWithdrawalStats = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const stats = await this.withdrawalService.getSellerWithdrawalStats(sellerId);
    
    sendResponse(res, 200, {
      data: stats,
      message: "Seller withdrawal statistics retrieved successfully"
    });
  });

  // Admin only endpoints
  getAllWithdrawals = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as any;

    const result = await this.withdrawalService.getAllWithdrawals(page, limit, status);
    
    sendResponse(res, 200, {
      data: result,
      message: "All withdrawals retrieved successfully"
    });

    this.logsService.info("Admin retrieved all withdrawals", {
      adminId: req.user?.id,
      page,
      limit,
      status
    });
  });

  approveWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    const { withdrawalId } = req.params;

    const withdrawal = await this.withdrawalService.approveWithdrawal(withdrawalId);
    
    sendResponse(res, 200, {
      data: withdrawal,
      message: "Withdrawal approved successfully"
    });

    this.logsService.info("Admin approved withdrawal", {
      adminId: req.user?.id,
      withdrawalId,
      amount: withdrawal.amount
    });
  });

  rejectWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    const { withdrawalId } = req.params;
    const validationResult = await validateZodSchema(updateWithdrawalStatusSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { reason } = validationResult.validData!;

    const withdrawal = await this.withdrawalService.rejectWithdrawal(withdrawalId, reason);
    
    sendResponse(res, 200, {
      data: withdrawal,
      message: "Withdrawal rejected successfully"
    });

    this.logsService.info("Admin rejected withdrawal", {
      adminId: req.user?.id,
      withdrawalId,
      amount: withdrawal.amount,
      reason
    });
  });

  processWithdrawal = asyncHandler(async (req: Request, res: Response) => {
    const { withdrawalId } = req.params;

    const withdrawal = await this.withdrawalService.processWithdrawal(withdrawalId);
    
    sendResponse(res, 200, {
      data: withdrawal,
      message: "Withdrawal moved to processing status"
    });

    this.logsService.info("Admin processed withdrawal", {
      adminId: req.user?.id,
      withdrawalId,
      amount: withdrawal.amount
    });
  });

  processDummyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { withdrawalId } = req.params;

    const withdrawal = await this.withdrawalService.processDummyPayment(withdrawalId);
    
    sendResponse(res, 200, {
      data: withdrawal,
      message: "Dummy payment processed successfully"
    });

    this.logsService.info("Admin processed dummy payment for withdrawal", {
      adminId: req.user?.id,
      withdrawalId,
      amount: withdrawal.amount
    });
  });

  getWithdrawalStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.withdrawalService.getWithdrawalStats();
    
    sendResponse(res, 200, {
      data: stats,
      message: "Withdrawal statistics retrieved successfully"
    });
  });
}