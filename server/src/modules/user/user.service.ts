import AppError from "@/shared/errors/AppError";
import { UserRepository } from "./user.repository";
import { VerificationService } from "./verification.service";
import { USER_VERIFICATION_STATUS } from "@prisma/client";
import prisma from "@/infra/database/database.config";
import cloudinaryService from "@/infra/cloudinary/cloudinary.service";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private verificationService: VerificationService
  ) {}

  async getAllUsers() {
    return await this.userRepository.findAllUsers();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async getMe(id: string | undefined) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async updateMe(
    id: string,
    data: Partial<{
      name?: string;
      email?: string;
      avatar?: string;
    }>
  ) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return await this.userRepository.updateUser(id, data);
  }

  async deleteUser(id: string, currentUserId: string) {
    // Prevent self-deletion
    if (id === currentUserId) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Prevent deletion of last ADMIN
    if (user.role === "ADMIN") {
      const adminCount = await this.userRepository.countUsersByRole(
        "ADMIN"
      );
      if (adminCount <= 1) {
        throw new AppError(400, "Cannot delete the last Admin");
      }
    }

    // If user is a seller, delete all their products and associated images first
    if (user.isSeller) {
      const products = await prisma.product.findMany({
        where: { sellerId: id },
        include: { variants: true }
      });

      // Collect all image URLs from all products
      const imageUrls: string[] = [];
      products.forEach(product => {
        product.variants.forEach(variant => {
          variant.images.forEach(image => {
            if (cloudinaryService.isCloudinaryUrl(image)) {
              imageUrls.push(image);
            }
          });
        });
      });

      // Delete all products (cascade will handle variants)
      await prisma.product.deleteMany({ where: { sellerId: id } });

      // Delete images from Cloudinary
      if (imageUrls.length > 0) {
        const result = await cloudinaryService.deleteImages(imageUrls);
        console.log(`Deleted ${result.success} images from Cloudinary for seller ${id}, ${result.failed} failed`);
      }
    }

    await this.userRepository.deleteUser(id);
  }

  async submitVerificationDocuments(
    userId: string,
    data: {
      studentIdCard?: string | Buffer;
      feeChallan?: string | Buffer;
      studentIdCardFileName?: string;
      feeChallanFileName?: string;
    }
  ) {
    // Validate that at least one document is provided
    if (!data.studentIdCard && !data.feeChallan) {
      throw new AppError(400, "At least one document (student ID card or fee challan) must be provided");
    }

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const uploadData: { studentIdCard?: string; feeChallan?: string } = {};

    // Handle student ID card upload
    if (data.studentIdCard) {
      if (Buffer.isBuffer(data.studentIdCard)) {
        // Upload file to Cloudinary
        const uploadResult = await this.verificationService.uploadDocument(
          data.studentIdCard,
          data.studentIdCardFileName || 'student_id_card.jpg',
          userId,
          'studentIdCard'
        );
        uploadData.studentIdCard = uploadResult.secure_url;
      } else {
        // Direct URL provided
        this.verificationService.validateDocumentUrls([data.studentIdCard]);
        uploadData.studentIdCard = data.studentIdCard;
      }
    }

    // Handle fee challan upload
    if (data.feeChallan) {
      if (Buffer.isBuffer(data.feeChallan)) {
        // Upload file to Cloudinary
        const uploadResult = await this.verificationService.uploadDocument(
          data.feeChallan,
          data.feeChallanFileName || 'fee_challan.jpg',
          userId,
          'feeChallan'
        );
        uploadData.feeChallan = uploadResult.secure_url;
      } else {
        // Direct URL provided
        this.verificationService.validateDocumentUrls([data.feeChallan]);
        uploadData.feeChallan = data.feeChallan;
      }
    }

    return await this.userRepository.submitVerificationDocuments(userId, uploadData);
  }

  async reviewVerification(
    userId: string,
    adminId: string,
    status: USER_VERIFICATION_STATUS,
    rejectionReason?: string
  ) {
    // Validate admin permissions
    const admin = await this.userRepository.findUserById(adminId);
    if (!admin || admin.role !== "ADMIN") {
      throw new AppError(403, "Only admins can review verifications");
    }

    // Validate rejection reason for rejected status
    if (status === USER_VERIFICATION_STATUS.REJECTED && !rejectionReason) {
      throw new AppError(400, "Rejection reason is required when rejecting verification");
    }

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    return await this.userRepository.reviewVerification(userId, adminId, status, rejectionReason);
  }

  async getUsersByVerificationStatus(status: USER_VERIFICATION_STATUS) {
    return await this.userRepository.getUsersByVerificationStatus(status);
  }

  async getUserVerificationDetails(userId: string) {
    const user = await this.userRepository.getUserVerificationDetails(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

}
