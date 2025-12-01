import prisma from "@/infra/database/database.config";
import { WALLET_TRANSACTION_STATUS, WALLET_TRANSACTION_TYPE } from "@prisma/client";

export class WalletRepository {
  async findWalletBySellerId(sellerId: string) {
    return await prisma.wallet.findUnique({
      where: { sellerId },
      include: {
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
  }

  async findWalletById(walletId: string) {
    return await prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async createWallet(sellerId: string) {
    return await prisma.wallet.create({
      data: {
        sellerId,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
      }
    });
  }

  async getOrCreateWallet(sellerId: string) {
    let wallet = await this.findWalletBySellerId(sellerId);
    if (!wallet) {
      await this.createWallet(sellerId);
      // Fetch the newly created wallet with relations
      wallet = await this.findWalletBySellerId(sellerId);
    }
    return wallet;
  }

  async updateWalletBalance(walletId: string, balance: number, availableBalance: number, pendingBalance: number) {
    return await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance,
        availableBalance,
        pendingBalance,
      }
    });
  }

  async createWalletTransaction(data: {
    walletId: string;
    orderId?: string;
    amount: number;
    type: WALLET_TRANSACTION_TYPE;
    status: WALLET_TRANSACTION_STATUS;
    description?: string;
    metadata?: any;
    holdUntil?: Date;
  }) {
    return await prisma.walletTransaction.create({
      data,
      include: {
        wallet: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });
  }

  async getWalletTransactions(walletId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          wallet: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        }
      }),
      prisma.walletTransaction.count({
        where: { walletId }
      })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPendingHoldTransactions(walletId: string) {
    return await prisma.walletTransaction.findMany({
      where: {
        walletId,
        status: WALLET_TRANSACTION_STATUS.PENDING,
        holdUntil: {
          lte: new Date()
        }
      }
    });
  }

  async updateTransactionStatus(transactionId: string, status: WALLET_TRANSACTION_STATUS) {
    return await prisma.walletTransaction.update({
      where: { id: transactionId },
      data: { status }
    });
  }

  async getAllWallets(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              walletTransactions: true,
              withdrawals: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wallet.count()
    ]);

    return {
      wallets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}