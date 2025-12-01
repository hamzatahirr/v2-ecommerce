import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";
import { SELLER_STATUS } from "@prisma/client";

export class SellerIdDto {
  @IsNotEmpty({ message: "Seller ID is required" })
  @IsString({ message: "Seller ID must be a string" })
  id!: string;
}

export class SellerListQueryDto {
  @IsOptional()
  @IsEnum(SELLER_STATUS, { message: "Invalid seller status" })
  status?: SELLER_STATUS;

  @IsOptional()
  @IsString({ message: "Search must be a string" })
  search?: string;

  @IsOptional()
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number;

  @IsOptional()
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  limit?: number;
}

