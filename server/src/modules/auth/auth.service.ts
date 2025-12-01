import crypto from "crypto";
import AppError from "@/shared/errors/AppError";
import sendEmail from "@/shared/utils/sendEmail";
import passwordResetTemplate from "@/shared/templates/passwordReset";
import { tokenUtils, passwordUtils } from "@/shared/utils/authUtils";
import {
  AuthResponse,
  RegisterUserParams,
  SignInParams
} from "./auth.types";
import { SELLER_STATUS } from "@prisma/client";
import logger from "@/infra/winston/logger";
import { AuthRepository } from "./auth.repository";
import BadRequestError from "@/shared/errors/BadRequestError";
import NotFoundError from "@/shared/errors/NotFoundError";
import { SellerRepository } from "../seller/seller.repository";
import { Role } from "@/shared/types/userTypes";
import { ROLE } from "@prisma/client";
import jwt from "jsonwebtoken";
import { makeAllowedDomainService } from "../allowed-domains/allowed-domains.factory";

export class AuthService {
  private sellerRepository: SellerRepository;
  private allowedDomainService;

  constructor(private authRepository: AuthRepository) {
    this.sellerRepository = new SellerRepository();
    this.allowedDomainService = makeAllowedDomainService();
  }

  async registerUser({
    name,
    email,
    password,
    role = Role.USER,
    isSeller = false,
  }: RegisterUserParams): Promise<AuthResponse> {
    // Validate email domain against allowed domains
    const domainValidation = await this.allowedDomainService.validateUserEmail(email);
    if (!domainValidation.isValid) {
      throw new AppError(
        400,
        `Email domain ${domainValidation.domain || ''} is not allowed for registration.`
      );
    }

    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(
        400,
        "This email is already registered, please log in instead."
      );
    }

    password = await passwordUtils.hashPassword(password);

    const newUser = await this.authRepository.createUser({
      email,
      name,
      password,
      role: ROLE.USER,
      isSeller: false,
    });

    const accessToken = tokenUtils.generateAccessToken(newUser.id);
    const refreshToken = tokenUtils.generateRefreshToken(newUser.id);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as Role,
        avatar: null,
        isSeller: false,
      },
      accessToken,
      refreshToken,
    };
  }

  async signin({ email, password }: SignInParams): Promise<{
    user: {
      id: string;
      role: ROLE;
      name: string;
      email: string;
      avatar: string | null;
      isSeller?: boolean;
      sellerStatus?: SELLER_STATUS | null;
    };
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.authRepository.findUserByEmailWithPassword(email);

    if (!user) {
      throw new BadRequestError("User not found.");
    }

    if (!user.password) {
      throw new AppError(400, "Password is incorrect.");
    }
    const isPasswordValid = await passwordUtils.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new AppError(400, "Email or password is incorrect.");
    }

    const accessToken = tokenUtils.generateAccessToken(user.id);
    const refreshToken = tokenUtils.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isSeller: user.isSeller,
        sellerStatus: user.sellerStatus,
      },
    };
  }

  async signout(): Promise<{ message: string }> {
    return { message: "User logged out successfully" };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundError("Email");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await this.authRepository.updateUserPasswordReset(email, {
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const resetUrl = `${process.env.CLIENT_URL}/password-reset/${resetToken}`;
    const htmlTemplate = passwordResetTemplate(resetUrl);

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: htmlTemplate,
      text: "Reset your password",
    });

    return { message: "Password reset email sent successfully" };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.authRepository.findUserByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    await this.authRepository.updateUserPassword(user.id, newPassword);

    return { message: "Password reset successful. You can now log in." };
  }

  async refreshToken(oldRefreshToken: string): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
      isSeller: boolean;
      sellerStatus: string | null;
    };
    newAccessToken: string;
    newRefreshToken: string;
  }> {
    if (await tokenUtils.isTokenBlacklisted(oldRefreshToken)) {
      throw new NotFoundError("Refresh token");
    }

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; absExp: number };

    const absoluteExpiration = decoded.absExp;
    const now = Math.floor(Date.now() / 1000);
    if (now > absoluteExpiration) {
      throw new AppError(401, "Session expired. Please log in again.");
    }

    const user = await this.authRepository.findUserById(decoded.id);
    console.log("refreshed user: ", user);

    if (!user) {
      throw new NotFoundError("User");
    }

    const newAccessToken = tokenUtils.generateAccessToken(user.id);
    const newRefreshToken = tokenUtils.generateRefreshToken(
      user.id,
      absoluteExpiration
    );

    const oldTokenTTL = absoluteExpiration - now;
    if (oldTokenTTL > 0) {
      await tokenUtils.blacklistToken(oldRefreshToken, oldTokenTTL);
    } else {
      logger.warn("Refresh token is already expired. No need to blacklist.");
    }

    return { user, newAccessToken, newRefreshToken };
  }

  async switchProfile(
    userId: string,
    profileType: "buyer" | "seller"
  ): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      role: ROLE;
      avatar: string | null;
      isSeller: boolean;
      sellerStatus: SELLER_STATUS | null;
    };
    currentProfile: "buyer" | "seller";
  }> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // If switching to seller, verify user is a seller
    if (profileType === "seller") {
      if (!user.isSeller) {
        throw new AppError(
          400,
          "You are not a seller. Please apply to become a seller first."
        );
      }

      const sellerProfile =
        await this.sellerRepository.findSellerProfileByUserId(userId);
      if (!sellerProfile) {
        throw new AppError(
          400,
          "Seller profile not found. Please complete your seller application."
        );
      }

      if (user.sellerStatus !== SELLER_STATUS.APPROVED) {
        throw new AppError(
          400,
          `Your seller account is ${user.sellerStatus}. You cannot switch to seller profile.`
        );
      }
    }

    // Return user data with current profile type
    // Note: The actual profile switching is handled on the frontend
    // This endpoint just validates and returns the current state
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isSeller: user.isSeller || false,
        sellerStatus: user.sellerStatus,
      },
      currentProfile: profileType,
    };
  }
}
