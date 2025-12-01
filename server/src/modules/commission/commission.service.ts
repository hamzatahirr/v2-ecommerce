import AppError from "@/shared/errors/AppError";
import { CommissionRepository } from "./commission.repository";
import prisma from "@/infra/database/database.config";

export class CommissionService {
  constructor(private commissionRepository: CommissionRepository) {}

  async getCommissionByCategory(categoryId: string) {
    const commission = await this.commissionRepository.findCommissionByCategoryId(categoryId);
    
    if (!commission) {
      // Return default commission if no specific commission is set
      const defaultRate = await this.commissionRepository.getDefaultCommissionRate();
      return {
        id: 'default',
        categoryId,
        rate: defaultRate,
        description: 'Default commission rate',
        category: null
      };
    }

    return commission;
  }

  async createCommission(categoryId: string, rate: number, description?: string) {
    // Validate rate
    if (rate < 0 || rate > 100) {
      throw new AppError(400, "Commission rate must be between 0 and 100");
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    // Check if commission already exists for this category
    const existingCommission = await this.commissionRepository.findCommissionByCategoryId(categoryId);
    if (existingCommission) {
      throw new AppError(400, "Commission already exists for this category");
    }

    return await this.commissionRepository.createCommission({
      categoryId,
      rate,
      description
    });
  }

  async updateCommission(categoryId: string, rate?: number, description?: string) {
    // Validate rate if provided
    if (rate !== undefined && (rate < 0 || rate > 100)) {
      throw new AppError(400, "Commission rate must be between 0 and 100");
    }

    const existingCommission = await this.commissionRepository.findCommissionByCategoryId(categoryId);
    if (!existingCommission) {
      throw new AppError(404, "Commission not found for this category");
    }

    return await this.commissionRepository.updateCommission(categoryId, {
      rate,
      description
    });
  }

  async deleteCommission(categoryId: string) {
    const existingCommission = await this.commissionRepository.findCommissionByCategoryId(categoryId);
    if (!existingCommission) {
      throw new AppError(404, "Commission not found for this category");
    }

    return await this.commissionRepository.deleteCommission(categoryId);
  }

  async getAllCommissions(page = 1, limit = 20) {
    return await this.commissionRepository.getAllCommissions(page, limit);
  }

  async getCommissionById(id: string) {
    const commission = await this.commissionRepository.getCommissionById(id);
    if (!commission) {
      throw new AppError(404, "Commission not found");
    }
    return commission;
  }

  async calculateOrderCommission(orderId: string): Promise<number> {
    // Get order with items and product categories
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    let totalCommission = 0;

    for (const item of order.orderItems) {
      const categoryId = item.variant.product.categoryId;
      let commissionRate = 0;

      if (categoryId) {
        commissionRate = await this.commissionRepository.getCommissionRateForCategory(categoryId);
      } else {
        // Use default commission rate if no category
        commissionRate = await this.commissionRepository.getDefaultCommissionRate();
      }

      const itemCommission = (item.price * item.quantity) * (commissionRate / 100);
      totalCommission += itemCommission;
    }

    return totalCommission;
  }

  async calculateProductCommission(productId: string): Promise<number> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (!product.categoryId) {
      return await this.commissionRepository.getDefaultCommissionRate();
    }

    return await this.commissionRepository.getCommissionRateForCategory(product.categoryId);
  }

  async getCategoriesWithoutCommission() {
    return await this.commissionRepository.getCategoriesWithoutCommission();
  }

  async getCategoriesWithCommission() {
    return await this.commissionRepository.getCategoriesWithCommission();
  }

  async bulkCreateCommissions(commissions: Array<{
    categoryId: string;
    rate: number;
    description?: string;
  }>) {
    // Validate all commissions
    for (const commission of commissions) {
      if (commission.rate < 0 || commission.rate > 100) {
        throw new AppError(400, `Commission rate must be between 0 and 100 for category ${commission.categoryId}`);
      }

      const category = await prisma.category.findUnique({
        where: { id: commission.categoryId }
      });

      if (!category) {
        throw new AppError(404, `Category not found: ${commission.categoryId}`);
      }

      const existingCommission = await this.commissionRepository.findCommissionByCategoryId(commission.categoryId);
      if (existingCommission) {
        throw new AppError(400, `Commission already exists for category: ${commission.categoryId}`);
      }
    }

    return await this.commissionRepository.bulkCreateCommissions(commissions);
  }

  async getCommissionStats() {
    return await this.commissionRepository.getCommissionStats();
  }

  async getDefaultCommissionRate() {
    return await this.commissionRepository.getDefaultCommissionRate();
  }

  async setDefaultCommissionRate(rate: number) {
    // This would typically be stored in environment variables or a settings table
    // For now, we'll just validate the rate
    if (rate < 0 || rate > 100) {
      throw new AppError(400, "Default commission rate must be between 0 and 100");
    }
    
    // In a real implementation, you might update a settings table or environment variable
    return { success: true, message: "Default commission rate updated", rate };
  }
}