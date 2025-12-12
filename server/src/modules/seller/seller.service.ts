import AppError from "@/shared/errors/AppError";
import { SellerRepository } from "./seller.repository";
import { SellerApplicationData, SellerUpdateData, SellerStats } from "./seller.types";

export class SellerService {
  constructor(private sellerRepository: SellerRepository) {}

  async getSellerStats(userId: string): Promise<SellerStats> {
    const sellerId = await this.sellerRepository.findSellerProfileByUserId(userId);
    
    if (!sellerId) {
      throw new AppError(404, "Seller profile not found");
    }

    // Get seller's order statistics
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      this.sellerRepository.countOrdersBySellerId(userId),
      this.sellerRepository.countOrdersBySellerIdAndStatus(userId, 'PENDING'),
      this.sellerRepository.countOrdersBySellerIdAndStatus(userId, 'COMPLETED'),
      this.sellerRepository.getTotalRevenueBySellerId(userId),
      this.sellerRepository.getRevenueBySellerIdAndMonths(userId, 1), // Current month
      this.sellerRepository.getRevenueBySellerIdAndMonths(userId, 2), // Last month
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
    };
  }

  async applyToBecomeSeller(userId: string, data: SellerApplicationData) {
    // Check if user already has a seller profile
    const existingProfile = await this.sellerRepository.findSellerProfileByUserId(
      userId
    );

    if (existingProfile) {
      throw new AppError(
        400,
        "You already have a seller profile. Please update your existing profile instead."
      );
    }

    // Check if user is already a seller
    const user = await this.sellerRepository.findSellerByUserId(userId);
    if (user?.isSeller) {
      throw new AppError(400, "You are already a seller");
    }

    return await this.sellerRepository.createSellerProfile(userId, data);
  }

  async getSellerProfile(sellerId: string) {
    const profile = await this.sellerRepository.findSellerProfileById(sellerId);

    if (!profile) {
      throw new AppError(404, "Seller profile not found");
    }

    return profile;
  }

  async getSellerProfileByUserId(userId: string) {
    const profile = await this.sellerRepository.findSellerProfileByUserId(
      userId
    );

    if (!profile) {
      throw new AppError(404, "Seller profile not found");
    }

    return profile;
  }

  async getSellerOrders(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ) {
    // Get orders with pagination and filtering
    const orders = await this.sellerRepository.findOrdersBySellerId(
      userId,
      options
    );

    return orders;
  }

  async updateSellerProfile(userId: string, data: SellerUpdateData) {
    // Check if seller profile exists
    const existingProfile = await this.sellerRepository.findSellerProfileByUserId(
      userId
    );

    if (!existingProfile) {
      throw new AppError(
        404,
        "Seller profile not found. Please apply to become a seller first."
      );
    }

    // If payout details are being updated, remove payoutVerified field as it doesn't exist in schema
    const hasPayoutUpdate = data.payoutMethod || data.payoutAccountTitle ||
                          data.payoutAccountNumber || data.payoutBankName ||
                          data.payoutBankBranch;

    // Note: payoutVerified field removed from schema - verification handled differently

    return await this.sellerRepository.updateSellerProfile(userId, data);
  }

  async getSellerStatsByUserId(userId: string): Promise<SellerStats> {
    // Get seller profile first to verify it exists
    const profile = await this.sellerRepository.findSellerProfileByUserId(
      userId
    );
    if (!profile) {
      throw new AppError(404, "Seller profile not found");
    }

    return await this.sellerRepository.getSellerStats(userId);
  }

  async getSellerPayouts(userId: string) {
    const profile = await this.sellerRepository.findSellerProfileByUserId(
      userId
    );
    if (!profile) {
      throw new AppError(404, "Seller profile not found");
    }

    return await this.sellerRepository.getSellerPayouts(userId);
  }

  async getSellerOrder(userId: string, orderId: string) {
    const order = await this.sellerRepository.findSellerOrderById(userId, orderId);
    return order;
  }

  async updateSellerOrderStatus(userId: string, orderId: string, status: string) {
    const updatedOrder = await this.sellerRepository.updateSellerOrderStatus(userId, orderId, status);
    return updatedOrder;
  }

  async updateSellerOrderShipping(userId: string, orderId: string, shippingInfo: { trackingNumber?: string; shippingNotes?: string }) {
    const updatedOrder = await this.sellerRepository.updateSellerOrderShipping(userId, orderId, shippingInfo);
    return updatedOrder;
  }
}