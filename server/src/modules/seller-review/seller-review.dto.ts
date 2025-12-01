import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from "class-validator";

export class CreateSellerReviewDto {
  @IsNotEmpty({ message: "Seller ID is required" })
  @IsString({ message: "Seller ID must be a string" })
  @IsUUID("4", { message: "Invalid seller ID format" })
  sellerId!: string;

  @IsNotEmpty({ message: "Rating is required" })
  @IsInt({ message: "Rating must be an integer" })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating!: number;

  @IsOptional()
  @IsString({ message: "Comment must be a string" })
  comment?: string;

  @IsOptional()
  @IsString({ message: "Order ID must be a string" })
  @IsUUID("4", { message: "Invalid order ID format" })
  orderId?: string;
}

export class SellerIdDto {
  @IsNotEmpty({ message: "Seller ID is required" })
  @IsString({ message: "Seller ID must be a string" })
  @IsUUID("4", { message: "Invalid seller ID format" })
  sellerId!: string;
}

