import AppError from "@/shared/errors/AppError";
import { WithdrawalRepository } from "./withdrawal.repository";
import { WalletService } from "../wallet/wallet.service";
import { WITHDRAWAL_STATUS } from "@prisma/client";

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

    // Get wallet to get walletId
    const wallet = await this.walletService.getSellerWallet(sellerId);

    // Create withdrawal request
    const withdrawal = await this.withdrawalRepository.createWithdrawal({
      walletId: wallet.id,
      sellerId,
      amount,
      method,
      details: details || {
        accountHolder: "Default Account Holder",
        accountNumber: "****1234",
        bankName: "Test Bank"
      }
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