import AppError from "@/shared/errors/AppError";
import { WalletRepository } from "./wallet.repository";
import { WALLET_TRANSACTION_STATUS, WALLET_TRANSACTION_TYPE } from "@prisma/client";
import { CommissionService } from "../commission/commission.service";

export class WalletService {
  constructor(
    private walletRepository: WalletRepository,
    private commissionService: CommissionService
  ) {}

  async getSellerWallet(sellerId: string) {
    const wallet = await this.walletRepository.getOrCreateWallet(sellerId);
    if (!wallet) {
      throw new Error("Failed to create or retrieve wallet");
    }
    return wallet;
  }

  async creditWalletAfterOrderConfirmation(orderId: string, sellerId: string, orderAmount: number) {
    const wallet = await this.walletRepository.getOrCreateWallet(sellerId);
    if (!wallet) {
      throw new Error("Failed to create or retrieve wallet");
    }
    
    // Calculate commission for this order
    const commissionAmount = await this.commissionService.calculateOrderCommission(orderId);
    const netAmount = orderAmount - commissionAmount;
    
    // Hold period: 7 days from now
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + 7);
    
    // Create a HOLD transaction initially
    const transaction = await this.walletRepository.createWalletTransaction({
      walletId: wallet.id,
      orderId,
      amount: netAmount,
      type: WALLET_TRANSACTION_TYPE.HOLD,
      status: WALLET_TRANSACTION_STATUS.PENDING,
      description: `Order payment held for 7 days - Order ${orderId}`,
      metadata: {
        orderId,
        orderAmount,
        commissionAmount,
        netAmount,
        holdPeriod: '7 days'
      },
      holdUntil
    });

    // Update wallet balances
    const newBalance = wallet.balance + netAmount;
    const newPendingBalance = wallet.pendingBalance + netAmount;
    
    await this.walletRepository.updateWalletBalance(
      wallet.id,
      newBalance,
      wallet.availableBalance, // Available balance unchanged during hold
      newPendingBalance
    );

    return {
      wallet,
      transaction,
      commissionAmount,
      netAmount,
      holdUntil
    };
  }

  async getWalletTransactions(sellerId: string, page = 1, limit = 20) {
    const wallet = await this.walletRepository.getOrCreateWallet(sellerId);
    if (!wallet) {
      throw new Error("Failed to create or retrieve wallet");
    }
    return await this.walletRepository.getWalletTransactions(wallet.id, page, limit);
  }

  async getAllWallets(page = 1, limit = 20) {
    const result = await this.walletRepository.getAllWallets(page, limit);
    return result;
  }

  async processHeldFunds() {
    // Get all wallets with pending held funds that should be released
    const walletsResult = await this.walletRepository.getAllWallets();
    const releasedTransactions = [];
    
    for (const wallet of walletsResult.wallets) {
      const pendingTransactions = await this.walletRepository.getPendingHoldTransactions(wallet.id);
      
      for (const transaction of pendingTransactions) {
        // Release funds to available balance
        const newAvailableBalance = wallet.availableBalance + transaction.amount;
        const newPendingBalance = wallet.pendingBalance - transaction.amount;
        
        // Update wallet
        await this.walletRepository.updateWalletBalance(
          wallet.id,
          wallet.balance, // Total balance unchanged
          newAvailableBalance,
          newPendingBalance
        );
        
        // Update transaction status
        await this.walletRepository.updateTransactionStatus(
          transaction.id,
          WALLET_TRANSACTION_STATUS.COMPLETED
        );
        
        // Create a release transaction record
        await this.walletRepository.createWalletTransaction({
          walletId: wallet.id,
          orderId: transaction.orderId || undefined,
          amount: transaction.amount,
          type: WALLET_TRANSACTION_TYPE.RELEASE,
          status: WALLET_TRANSACTION_STATUS.COMPLETED,
          description: `Funds released from hold - Transaction ${transaction.id}`,
          metadata: {
            originalTransactionId: transaction.id,
            releasedAt: new Date()
          }
        });
        
        releasedTransactions.push(transaction);
      }
    }

    return releasedTransactions;
  }
  
  async getWalletBalance(sellerId: string) {
    const wallet = await this.walletRepository.getOrCreateWallet(sellerId);
    if (!wallet) {
      throw new Error("Failed to create or retrieve wallet");
    }
    return {
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      currency: wallet.currency
    };
  }

  async debitWalletForWithdrawal(walletId: string, amount: number) {
    const wallet = await this.walletRepository.findWalletById(walletId);
    if (!wallet) {
      throw new AppError(404, "Wallet not found");
    }

    if (wallet.availableBalance < amount) {
      throw new AppError(400, "Insufficient available balance");
    }

    // Create debit transaction
    const transaction = await this.walletRepository.createWalletTransaction({
      walletId,
      amount: -amount,
      type: WALLET_TRANSACTION_TYPE.DEBIT,
      status: WALLET_TRANSACTION_STATUS.COMPLETED,
      description: `Withdrawal of ${amount}`,
      metadata: {
        type: 'withdrawal',
        amount
      }
    });

    // Update wallet balances
    const newBalance = wallet.balance - amount;
    const newAvailableBalance = wallet.availableBalance - amount;
    
    await this.walletRepository.updateWalletBalance(
      walletId,
      newBalance,
      newAvailableBalance,
      wallet.pendingBalance
    );

    return transaction;
  }
}