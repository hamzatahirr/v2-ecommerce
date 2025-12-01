import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from "class-validator";

export class ApplySellerDto {
  @IsNotEmpty({ message: "Store name is required" })
  @IsString({ message: "Store name must be a string" })
  @MinLength(3, { message: "Store name must be at least 3 characters long" })
  @MaxLength(100, { message: "Store name must not exceed 100 characters" })
  storeName!: string;

  @IsOptional()
  @IsString({ message: "Store description must be a string" })
  @MaxLength(500, {
    message: "Store description must not exceed 500 characters",
  })
  storeDescription?: string;

  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  phone?: string;

  @IsOptional()
  @IsString({ message: "Address must be a string" })
  address?: string;

  @IsOptional()
  @IsString({ message: "City must be a string" })
  city?: string;

  @IsOptional()
  @IsString({ message: "State must be a string" })
  state?: string;

  @IsOptional()
  @IsString({ message: "Country must be a string" })
  country?: string;

  @IsOptional()
  @IsString({ message: "Zip code must be a string" })
  zipCode?: string;
}

export class UpdateSellerProfileDto {
  @IsOptional()
  @IsString({ message: "Store name must be a string" })
  @MinLength(3, { message: "Store name must be at least 3 characters long" })
  @MaxLength(100, { message: "Store name must not exceed 100 characters" })
  storeName?: string;

  @IsOptional()
  @IsString({ message: "Store description must be a string" })
  @MaxLength(500, {
    message: "Store description must not exceed 500 characters",
  })
  storeDescription?: string;

  @IsOptional()
  @IsString({ message: "Store logo must be a string" })
  storeLogo?: string;

  @IsOptional()
  @IsString({ message: "Store banner must be a string" })
  storeBanner?: string;

  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  phone?: string;

  @IsOptional()
  @IsString({ message: "Address must be a string" })
  address?: string;

  @IsOptional()
  @IsString({ message: "City must be a string" })
  city?: string;

  @IsOptional()
  @IsString({ message: "State must be a string" })
  state?: string;

  @IsOptional()
  @IsString({ message: "Country must be a string" })
  country?: string;

  @IsOptional()
  @IsString({ message: "Zip code must be a string" })
  zipCode?: string;
}

export class SellerIdDto {
  @IsNotEmpty({ message: "Seller ID is required" })
  @IsString({ message: "Seller ID must be a string" })
  id!: string;
}

