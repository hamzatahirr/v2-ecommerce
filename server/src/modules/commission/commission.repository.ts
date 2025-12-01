import prisma from "@/infra/database/database.config";

export class CommissionRepository {
  async findCommissionByCategoryId(categoryId: string) {
    return await prisma.commission.findUnique({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }

  async createCommission(data: {
    categoryId: string;
    rate: number;
    description?: string;
  }) {
    return await prisma.commission.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }

  async updateCommission(categoryId: string, data: {
    rate?: number;
    description?: string;
  }) {
    return await prisma.commission.update({
      where: { categoryId },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }

  async deleteCommission(categoryId: string) {
    return await prisma.commission.delete({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }

  async getAllCommissions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.commission.count()
    ]);

    return {
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCommissionById(id: string) {
    return await prisma.commission.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
  }

  async getDefaultCommissionRate() {
    // Return default commission rate if no specific commission is set
    return parseFloat(process.env.DEFAULT_COMMISSION_RATE || "5.0");
  }

  async getCommissionRateForCategory(categoryId: string): Promise<number> {
    const commission = await this.findCommissionByCategoryId(categoryId);
    if (commission) {
      return commission.rate;
    }
    
    // Return default commission rate
    return await this.getDefaultCommissionRate();
  }

  async getCategoriesWithoutCommission() {
    const categories = await prisma.category.findMany({
      where: {
        commission: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
      }
    });

    return categories;
  }

  async getCategoriesWithCommission() {
    const commissions = await prisma.commission.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return commissions;
  }

  async bulkCreateCommissions(commissions: Array<{
    categoryId: string;
    rate: number;
    description?: string;
  }>) {
    return await prisma.$transaction(
      commissions.map(commission =>
        prisma.commission.create({
          data: commission,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        })
      )
    );
  }

  async getCommissionStats() {
    const [totalCommissions, avgRate, categoriesWithCommission, categoriesWithoutCommission] = await Promise.all([
      prisma.commission.count(),
      prisma.commission.aggregate({
        _avg: {
          rate: true
        }
      }),
      prisma.commission.count(),
      prisma.category.count({
        where: {
          commission: null
        }
      })
    ]);

    return {
      totalCommissions,
      averageRate: avgRate._avg.rate || 0,
      categoriesWithCommission,
      categoriesWithoutCommission,
      totalCategories: categoriesWithCommission + categoriesWithoutCommission
    };
  }
}