import AppError from "@/shared/errors/AppError";
import { AdminRepository } from "./admin.repository";
import { SellerListFilters, SellerListResponse } from "./admin.types";
import { SELLER_STATUS } from "@prisma/client";

export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async getPendingSellers(page: number = 1, limit: number = 10): Promise<SellerListResponse> {
    return await this.adminRepository.findPendingSellers(page, limit);
  }

  async getAllSellers(filters: SellerListFilters): Promise<SellerListResponse> {
    return await this.adminRepository.findAllSellers(filters);
  }

  async approveSeller(sellerId: string) {
    const seller = await this.adminRepository.findSellerById(sellerId);

    if (!seller) {
      throw new AppError(404, "Seller not found");
    }

    if (!seller.isSeller) {
      throw new AppError(400, "User is not a seller");
    }

    if (seller.sellerStatus === SELLER_STATUS.APPROVED) {
      throw new AppError(400, "Seller is already approved");
    }

    return await this.adminRepository.approveSeller(sellerId);
  }

  async rejectSeller(sellerId: string) {
    const seller = await this.adminRepository.findSellerById(sellerId);

    if (!seller) {
      throw new AppError(404, "Seller not found");
    }

    if (!seller.isSeller) {
      throw new AppError(400, "User is not a seller");
    }

    if (seller.sellerStatus === SELLER_STATUS.REJECTED) {
      throw new AppError(400, "Seller is already rejected");
    }

    return await this.adminRepository.rejectSeller(sellerId);
  }

  async suspendSeller(sellerId: string) {
    const seller = await this.adminRepository.findSellerById(sellerId);

    if (!seller) {
      throw new AppError(404, "Seller not found");
    }

    if (!seller.isSeller) {
      throw new AppError(400, "User is not a seller");
    }

    if (seller.sellerStatus === SELLER_STATUS.SUSPENDED) {
      throw new AppError(400, "Seller is already suspended");
    }

    return await this.adminRepository.suspendSeller(sellerId);
  }
}

