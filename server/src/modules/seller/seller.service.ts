import AppError from "@/shared/errors/AppError";
import { SellerRepository } from "./seller.repository";
import { SellerApplicationData, SellerUpdateData, SellerStats } from "./seller.types";

export class SellerService {
  constructor(private sellerRepository: SellerRepository) {}

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
}

