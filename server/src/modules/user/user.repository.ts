import prisma from "@/infra/database/database.config";
import { ROLE, SELLER_STATUS, USER_VERIFICATION_STATUS } from "@prisma/client";
import { passwordUtils } from "@/shared/utils/authUtils";
import { UserVerificationData } from "./user.types";

export class UserRepository {
  async findAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isSeller: true,
        sellerStatus: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserById(id: string | undefined) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isSeller: true,
        sellerStatus: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async updateUser(
    id: string,
    data: Partial<{
      name?: string;
      email?: string;
      password?: string;
      avatar?: string;
      role?: ROLE;
      isSeller?: boolean;
      sellerStatus?: SELLER_STATUS;
      emailVerified?: boolean;
      emailVerificationToken?: string | null;
      emailVerificationTokenExpiresAt?: Date | null;
      resetPasswordToken?: string | null;
      resetPasswordTokenExpiresAt?: Date | null;
    }>
  ) {
    return await prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({ where: { id } });
  }

  async countUsersByRole(role: string) {
    return await prisma.user.count({
      where: { role: role as any },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    // Hash the password before storing
    const hashedPassword = await passwordUtils.hashPassword(data.password);

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isSeller: true,
        sellerStatus: true,
        verificationStatus: true,
      },
    });
  }

  async submitVerificationDocuments(
    userId: string,
    data: { studentIdCard?: string; feeChallan?: string }
  ) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        verificationStatus: USER_VERIFICATION_STATUS.PENDING,
        verificationSubmittedAt: new Date(),
        rejectionReason: null, // Clear any previous rejection reason
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        studentIdCard: true,
        feeChallan: true,
        verificationSubmittedAt: true,
      },
    });
  }

  async reviewVerification(
    userId: string,
    adminId: string,
    status: USER_VERIFICATION_STATUS,
    rejectionReason?: string
  ) {
    const updateData: any = {
      verificationStatus: status,
      verificationReviewedAt: new Date(),
      verificationReviewedBy: adminId,
    };

    if (status === USER_VERIFICATION_STATUS.REJECTED && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === USER_VERIFICATION_STATUS.APPROVED) {
      updateData.rejectionReason = null; // Clear rejection reason on approval
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        studentIdCard: true,
        feeChallan: true,
        rejectionReason: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationReviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUsersByVerificationStatus(status: USER_VERIFICATION_STATUS) {
    return await prisma.user.findMany({
      where: { verificationStatus: status },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        verificationStatus: true,
        studentIdCard: true,
        feeChallan: true,
        rejectionReason: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationReviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        verificationSubmittedAt: 'desc',
      },
    });
  }

  async getUserVerificationDetails(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        studentIdCard: true,
        feeChallan: true,
        rejectionReason: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationReviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
