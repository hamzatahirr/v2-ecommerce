import prisma from "@/infra/database/database.config";
import { WITHDRAWAL_STATUS } from "@prisma/client";

export class WithdrawalRepository {
  async createWithdrawal(data: {
    walletId: string;
    sellerId: string;
    amount: number;
    method?: string;
    details?: any;
  }) {
    return await prisma.withdrawal.create({
      data: {
        ...data,
        status: WITHDRAWAL_STATUS.PENDING,
      },
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

  async findWithdrawalById(withdrawalId: string) {
    return await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
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

  async getSellerWithdrawals(sellerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { sellerId },
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
      prisma.withdrawal.count({
        where: { sellerId }
      })
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllWithdrawals(page = 1, limit = 20, status?: WITHDRAWAL_STATUS) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
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
      prisma.withdrawal.count({ where })
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateWithdrawalStatus(withdrawalId: string, status: WITHDRAWAL_STATUS, processedAt?: Date) {
    return await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        processedAt: processedAt || (status === WITHDRAWAL_STATUS.COMPLETED ? new Date() : null)
      },
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

  async getPendingWithdrawals() {
    return await prisma.withdrawal.findMany({
      where: { status: WITHDRAWAL_STATUS.PENDING },
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
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getSellerWithdrawalStats(sellerId: string) {
    const stats = await prisma.withdrawal.groupBy({
      by: ['status'],
      where: { sellerId },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const totalWithdrawn = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const pendingCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.PENDING)?._count.id || 0;
    const completedCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.COMPLETED)?._count.id || 0;
    const failedCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.FAILED)?._count.id || 0;

    return {
      totalWithdrawn,
      pendingCount,
      completedCount,
      failedCount,
      pendingAmount: stats.find(stat => stat.status === WITHDRAWAL_STATUS.PENDING)?._sum.amount || 0,
      completedAmount: stats.find(stat => stat.status === WITHDRAWAL_STATUS.COMPLETED)?._sum.amount || 0
    };
  }

  async getWithdrawalStats() {
    const stats = await prisma.withdrawal.groupBy({
      by: ['status'],
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    const totalWithdrawn = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const pendingCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.PENDING)?._count.id || 0;
    const completedCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.COMPLETED)?._count.id || 0;
    const failedCount = stats.find(stat => stat.status === WITHDRAWAL_STATUS.FAILED)?._count.id || 0;

    return {
      totalWithdrawn,
      pendingCount,
      completedCount,
      failedCount,
      pendingAmount: stats.find(stat => stat.status === WITHDRAWAL_STATUS.PENDING)?._sum.amount || 0,
      completedAmount: stats.find(stat => stat.status === WITHDRAWAL_STATUS.COMPLETED)?._sum.amount || 0
    };
  }

  async getSellerProfile(sellerId: string) {
    return await prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
      select: {
        payoutMethod: true,
        payoutAccountTitle: true,
        payoutAccountNumber: true,
        payoutBankName: true,
        payoutBankBranch: true,
        payoutVerified: true,
      }
    });
  }
}