import { USER_VERIFICATION_STATUS } from "@prisma/client";

export interface UserVerificationData {
  verificationStatus?: USER_VERIFICATION_STATUS;
  studentIdCard?: string;
  feeChallan?: string;
  rejectionReason?: string;
  verificationSubmittedAt?: Date;
  verificationReviewedAt?: Date;
  verificationReviewedBy?: string;
}

export interface SubmitVerificationRequestDto {
  studentIdCard?: string;
  feeChallan?: string;
}

export interface ReviewVerificationRequestDto {
  userId: string;
  status: USER_VERIFICATION_STATUS;
  rejectionReason?: string;
}

export interface UserVerificationResponse {
  id: string;
  verificationStatus: USER_VERIFICATION_STATUS;
  studentIdCard?: string;
  feeChallan?: string;
  rejectionReason?: string;
  verificationSubmittedAt?: Date;
  verificationReviewedAt?: Date;
  verificationReviewedBy?: string;
}
