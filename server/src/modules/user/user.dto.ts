import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from "class-validator";
import { USER_VERIFICATION_STATUS } from "@prisma/client";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsString()
  password?: string;

  @IsOptional()
  @IsIn(["USER", "ADMIN"], { message: "Role must be either 'USER' or 'ADMIN'" })
  role?: string;
}

export class UserIdDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsString({ message: "ID must be a string" })
  id!: string;
}

export class UserEmailDto {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email!: string;
}

export class SubmitVerificationDto {
  @IsOptional()
  @IsString({ message: "Student ID card URL must be a string" })
  @IsUrl({}, { message: "Student ID card must be a valid URL" })
  studentIdCard?: string;

  @IsOptional()
  @IsString({ message: "Fee challan URL must be a string" })
  @IsUrl({}, { message: "Fee challan must be a valid URL" })
  feeChallan?: string;
}

export class ReviewVerificationDto {
  @IsNotEmpty({ message: "User ID is required" })
  @IsString({ message: "User ID must be a string" })
  userId!: string;

  @IsNotEmpty({ message: "Status is required" })
  @IsIn(["PENDING", "APPROVED", "REJECTED"], {
    message: "Status must be PENDING, APPROVED, or REJECTED",
  })
  status!: USER_VERIFICATION_STATUS;

  @IsOptional()
  @IsString({ message: "Rejection reason must be a string" })
  rejectionReason?: string;
}
