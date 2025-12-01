import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength, IsBoolean } from "class-validator";
import { Role } from "@/shared/types/userTypes";

export class RegisterDto {
  @IsNotEmpty({
    message: "Name is required",
  })
  @MinLength(3)
  name!: string;

  @IsEmail()
  @IsNotEmpty({
    message: "Email is required",
  })
  email!: string;

  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn([Role.USER, Role.ADMIN])
  role?: Role = Role.USER;

  @IsOptional()
  @IsBoolean()
  isSeller?: boolean = false;
}

export class SigninDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}

export class VerifyEmailDto {
  @IsNotEmpty()
  emailVerificationToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string;

  @MinLength(6)
  newPassword!: string;
}

export class SwitchProfileDto {
  @IsNotEmpty({ message: "Profile type is required" })
  @IsIn(["buyer", "seller"], { message: "Profile type must be either 'buyer' or 'seller'" })
  profileType!: "buyer" | "seller";
}
