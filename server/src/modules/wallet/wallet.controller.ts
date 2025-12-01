import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { WalletService } from "./wallet.service";
import { makeWalletService } from "./wallet.factory";
import { makeLogsService } from "../logs/logs.factory";

export class WalletController {
  private logsService = makeLogsService();
  private walletService;

  constructor(walletService: any) {
    this.walletService = walletService;
  }

  getSellerWallet = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const wallet = await this.walletService.getSellerWallet(sellerId);
    
    sendResponse(res, 200, {
      data: wallet,
      message: "Wallet retrieved successfully"
    });
  });

  getWalletBalance = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const balance = await this.walletService.getWalletBalance(sellerId);
    
    sendResponse(res, 200, {
      data: balance,
      message: "Wallet balance retrieved successfully"
    });
  });

  getWalletTransactions = asyncHandler(async (req: Request, res: Response) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.walletService.getWalletTransactions(sellerId, page, limit);
    
    sendResponse(res, 200, {
      data: result,
      message: "Wallet transactions retrieved successfully"
    });
  });

  // Admin only endpoints
  getAllWallets = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.walletService.getAllWallets(page, limit);
    
    sendResponse(res, 200, {
      data: result,
      message: "All wallets retrieved successfully"
    });

    this.logsService.info("Admin retrieved all wallets", {
      adminId: req.user?.id,
      page,
      limit
    });
  });
}