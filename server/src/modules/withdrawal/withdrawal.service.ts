import AppError from "@/shared/errors/AppError";
import { WithdrawalRepository } from "./withdrawal.repository";
import { WalletService } from "../wallet/wallet.service";
import { WITHDRAWAL_STATUS } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export class WithdrawalService {
  constructor(
    private withdrawalRepository: WithdrawalRepository,
    private walletService: WalletService
  ) {}

  async requestWithdrawal(sellerId: string, amount: number, method = "BANK_TRANSFER", details?: any) {
    // Validate amount
    if (amount <= 0) {
      throw new AppError(400, "Withdrawal amount must be greater than 0");
    }

    // Get seller's wallet
    const walletBalance = await this.walletService.getWalletBalance(sellerId);

    if (walletBalance.availableBalance < amount) {
      throw new AppError(400, `Insufficient available balance. Available: ${walletBalance.availableBalance}, Requested: ${amount}`);
    }

    // Validate seller payout details before allowing withdrawal
    const sellerProfile = await this.withdrawalRepository.getSellerProfile(sellerId);
    if (!sellerProfile) {
      throw new AppError(404, "Seller profile not found");
    }

    // Check if payout details are complete (removed payoutVerified check as field doesn't exist)
    if (!sellerProfile.payoutAccountTitle || !sellerProfile.payoutAccountNumber) {
      throw new AppError(400, "Please complete your payout details before requesting withdrawal");
    }

    // Get wallet to get walletId
    const wallet = await this.walletService.getSellerWallet(sellerId);

    // Use payout details from seller profile
    const payoutDetails = {
      accountHolder: sellerProfile.payoutAccountTitle,
      accountNumber: sellerProfile.payoutAccountNumber,
      bankName: sellerProfile.payoutBankName,
      bankBranch: sellerProfile.payoutBankBranch,
      payoutMethod: sellerProfile.payoutMethod,
    };

    // Create withdrawal request
    const withdrawal = await this.withdrawalRepository.createWithdrawal({
      walletId: wallet.id,
      sellerId,
      amount,
      method: sellerProfile.payoutMethod || method,
      details: payoutDetails
    });

    // Debit the wallet amount (this will be processed when withdrawal is approved)
    // For now, we'll just create the withdrawal request as PENDING
    // The actual debit will happen when admin approves it

    return withdrawal;
  }

  async getSellerWithdrawals(sellerId: string, page = 1, limit = 20) {
    return await this.withdrawalRepository.getSellerWithdrawals(sellerId, page, limit);
  }

  async getWithdrawalDetails(withdrawalId: string, sellerId?: string) {
    const withdrawal = await this.withdrawalRepository.findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    // If sellerId is provided, check authorization
    if (sellerId && withdrawal.sellerId !== sellerId) {
      throw new AppError(403, "You are not authorized to view this withdrawal");
    }

    return withdrawal;
  }

  async getAllWithdrawals(page = 1, limit = 20, status?: WITHDRAWAL_STATUS) {
    return await this.withdrawalRepository.getAllWithdrawals(page, limit, status);
  }

  async approveWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
      throw new AppError(400, "Withdrawal is not in pending status");
    }

    // Debit the wallet
    await this.walletService.debitWalletForWithdrawal(withdrawal.walletId, withdrawal.amount);

    // Update withdrawal status
    const updatedWithdrawal = await this.withdrawalRepository.updateWithdrawalStatus(
      withdrawalId,
      WITHDRAWAL_STATUS.COMPLETED,
      new Date()
    );

    return updatedWithdrawal;
  }

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    const withdrawal = await this.withdrawalRepository.findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
      throw new AppError(400, "Withdrawal is not in pending status");
    }

    // Update withdrawal status
    const updatedWithdrawal = await this.withdrawalRepository.updateWithdrawalStatus(
      withdrawalId,
      WITHDRAWAL_STATUS.FAILED
    );

    return updatedWithdrawal;
  }

  async processWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findWithdrawalById(withdrawalId);

    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WITHDRAWAL_STATUS.PENDING) {
      throw new AppError(400, "Withdrawal is not in pending status");
    }

    // Update to processing status
    const updatedWithdrawal = await this.withdrawalRepository.updateWithdrawalStatus(
      withdrawalId,
      WITHDRAWAL_STATUS.PROCESSING
    );

    // In a real implementation, you would integrate with JazzCash payout API here
    // For now, we'll simulate the payout process
    setTimeout(async () => {
      try {
        // Simulate payout processing delay (e.g., bank transfer time)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mark as completed (in real implementation, this would be done via webhook or API response)
        await this.withdrawalRepository.updateWithdrawalStatus(
          withdrawalId,
          WITHDRAWAL_STATUS.COMPLETED,
          new Date()
        );

        // Create a payout record using Prisma client
        const prisma = new PrismaClient();
        await prisma.sellerPayout.create({
          data: {
            sellerId: withdrawal.sellerId,
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            status: "COMPLETED",
            gatewayTxnId: `PAYOUT_${Date.now()}`,
            payoutMethod: withdrawal.method,
            payoutDetails: withdrawal.details as any,
            payoutDate: new Date(),
            processedBy: "SYSTEM", // In real app, this would be admin user ID
          }
        });

      } catch (error) {
        console.error('Payout processing failed:', error);
        // Mark as failed
        await this.withdrawalRepository.updateWithdrawalStatus(
          withdrawalId,
          WITHDRAWAL_STATUS.FAILED
        );
      }
    }, 100);

    return updatedWithdrawal;
  }

  async getSellerWithdrawalStats(sellerId: string) {
    return await this.withdrawalRepository.getSellerWithdrawalStats(sellerId);
  }

  async getWithdrawalStats() {
    return await this.withdrawalRepository.getWithdrawalStats();
  }

  async getPendingWithdrawals() {
    return await this.withdrawalRepository.getPendingWithdrawals();
  }

  // Dummy payment processing for testing
  async processDummyPayment(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findWithdrawalById(withdrawalId);
    
    if (!withdrawal) {
      throw new AppError(404, "Withdrawal not found");
    }

    if (withdrawal.status !== WITHDRAWAL_STATUS.PROCESSING) {
      throw new AppError(400, "Withdrawal must be in processing status");
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark as completed
    const updatedWithdrawal = await this.withdrawalRepository.updateWithdrawalStatus(
      withdrawalId,
      WITHDRAWAL_STATUS.COMPLETED,
      new Date()
    );

    return updatedWithdrawal;
  }
}