import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in reverse order of dependencies to respect foreign key constraints
  try {
    await prisma.chatMessage.deleteMany();
    await prisma.chat.deleteMany();
  } catch (error) {
    console.log("⚠️ Chat tables not found, skipping...");
  }
  // Try to delete each table individually with proper typing
  const deleteOperations = [
    () => prisma.report.deleteMany(),
    () => prisma.interaction.deleteMany(),
    () => prisma.cartEvent.deleteMany(),
    () => prisma.cartItem.deleteMany(),
    () => prisma.cart.deleteMany(),
    () => prisma.transaction.deleteMany(),
    () => prisma.shipment.deleteMany(),
    () => prisma.payment.deleteMany(),
    () => prisma.address.deleteMany(),
    () => prisma.orderItem.deleteMany(),
    () => prisma.order.deleteMany(),
    () => prisma.review.deleteMany(),
    () => prisma.restock.deleteMany(),
    () => prisma.stockMovement.deleteMany(),
    () => prisma.productVariantAttribute.deleteMany(),
    () => prisma.attributeValue.deleteMany(),
    () => prisma.categoryAttribute.deleteMany(),
    () => prisma.attribute.deleteMany(),
    () => prisma.productVariant.deleteMany(),
    () => prisma.product.deleteMany(),
    () => prisma.category.deleteMany(),
    () => prisma.allowedDomain.deleteMany(),
    () => prisma.section.deleteMany(),
    () => prisma.user.deleteMany(),
  ];

  for (const deleteOp of deleteOperations) {
    try {
      await deleteOp();
    } catch (error) {
      console.log(`⚠️ Table not found, skipping...`);
    }
  }

  console.log("✅ Cleanup completed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data first
  await cleanup();

  // 1. Create users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@buybuddypk.store" },
    update: {},
    create: {
      email: "admin@buybuddypk.store",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
  });

  // Create sample users with different verification statuses
  const verifiedUser = await prisma.user.upsert({
    where: { email: "user1@buybuddypk.store" },
    update: {},
    create: {
      email: "user1@buybuddypk.store",
      password: hashedPassword,
      name: "User 1",
      role: "USER",
      verificationStatus: "APPROVED",
      verificationSubmittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Submitted a week ago
      verificationReviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Approved 3 days ago
      verificationReviewedBy: admin.id,
    },
  });

  const pendingUser = await prisma.user.upsert({
    where: { email: "user2@buybuddypk.store" },
    update: {},
    create: {
      email: "user2@buybuddypk.store",
      password: hashedPassword,
      name: "Pending Student",
      role: "USER",
      verificationStatus: "PENDING",
      studentIdCard: "",
      feeChallan: "",
      verificationSubmittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
    },
  });

  const rejectedUser = await prisma.user.upsert({
    where: { email: "user3@buybuddypk.store" },
    update: {},
    create: {
      email: "user3@buybuddypk.store",
      password: hashedPassword,
      name: "Rejected",
      role: "USER",
      verificationStatus: "REJECTED",
      studentIdCard: "",
      feeChallan: "",
      rejectionReason: "Student ID card is not clearly visible. Please upload a higher quality image showing all details clearly.",
      verificationSubmittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Submitted 5 days ago
      verificationReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Rejected 1 day ago
      verificationReviewedBy: admin.id,
    },
  });

  const unverifiedUser = await prisma.user.upsert({
    where: { email: "user4@buybuddypk.store" },
    update: {},
    create: {
      email: "user4@buybuddypk.store",
      password: hashedPassword,
      name: "Unverified User",
      role: "USER",
      verificationStatus: "PENDING", 
    },
  });

  // Create multiple sellers for multi-vendor system
  const seller1 = await prisma.user.upsert({
    where: { email: "seller1@buybuddypk.store" },
    update: {},
    create: {
      email: "seller1@buybuddy.com",
      password: hashedPassword,
      name: "Tech Store Seller",
      role: "USER", 
      isSeller: true,
      sellerStatus: "APPROVED",
      verificationStatus: "APPROVED",
    },
  });

  

  // Create seller profiles
  const sellerProfile1 = await prisma.sellerProfile.upsert({
    where: { userId: seller1.id },
    update: {},
    create: {
      userId: seller1.id,
      storeName: "Tech Store",
      storeDescription: "Your trusted source for electronics and gadgets",
      phone: "+1234567890",
      address: "123 Tech Street, Silicon Valley, CA 94000",
      city: "Silicon Valley",
      state: "CA",
      country: "USA",
      zipCode: "94000",
      payoutVerified: false,
      totalSales: 15000.00,
      totalEarnings: 12000.00,
      averageRating: 4.5,
      reviewCount: 25,
      isVerified: true,
    },
  });

  

  // Create seller wallets
  const wallet1 = await prisma.wallet.upsert({
    where: { sellerId: seller1.id },
    update: {},
    create: {
      sellerId: seller1.id,
      balance: 2500.00,
      availableBalance: 2000.00,
      pendingBalance: 500.00,
    },
  });


  // Create seller subscriptions
  await prisma.sellerSubscription.upsert({
    where: { stripeSubscriptionId: "sub_techstore123" },
    update: {},
    create: {
      sellerId: seller1.id,
      planName: "Professional",
      amount: 29.99,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stripeSubscriptionId: "sub_techstore123",
      stripeCustomerId: "cus_techstore123",
    },
  });

  // 7. Create allowed domains for user registration
  const allowedDomains = [
    "buybuddypk.store",
  ];

  for (const domain of allowedDomains) {
    await prisma.allowedDomain.upsert({
      where: { domain },
      update: {},
      create: {
        domain,
        isActive: true,
      },
    });
  }

  // 2. Create categories
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      images: [],
    },
  });

  const clothingCategory = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      images: [],
    },
  });

  const footwearCategory = await prisma.category.upsert({
    where: { slug: "footwear" },
    update: {},
    create: {
      name: "Footwear",
      slug: "footwear",
      description: "Shoes and sneakers",
      images: [],
    },
  });

  const furnitureCategory = await prisma.category.upsert({
    where: { slug: "furniture" },
    update: {},
    create: {
      name: "Furniture",
      slug: "furniture",
      description: "Home and office furniture",
      images: [],
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Fashion accessories and jewelry",
      images: [],
    },
  });

  // Add more categories
  const sportsCategory = await prisma.category.upsert({
    where: { slug: "sports" },
    update: {},
    create: {
      name: "Sports & Outdoors",
      slug: "sports",
      description: "Sports equipment and outdoor gear",
      images: [],
    },
  });

  const beautyCategory = await prisma.category.upsert({
    where: { slug: "beauty" },
    update: {},
    create: {
      name: "Beauty & Personal Care",
      slug: "beauty",
      description: "Cosmetics and personal care products",
      images: [],
    },
  });

  const booksCategory = await prisma.category.upsert({
    where: { slug: "books" },
    update: {},
    create: {
      name: "Books & Media",
      slug: "books",
      description: "Books, movies, and music",
      images: [],
    },
  });

  const toysCategory = await prisma.category.upsert({
    where: { slug: "toys" },
    update: {},
    create: {
      name: "Toys & Games",
      slug: "toys",
      description: "Toys, games, and hobbies",
      images: [],
    },
  });

  const automotiveCategory = await prisma.category.upsert({
    where: { slug: "automotive" },
    update: {},
    create: {
      name: "Automotive",
      slug: "automotive",
      description: "Car parts and accessories",
      images: [],
    },
  });

  const healthCategory = await prisma.category.upsert({
    where: { slug: "health" },
    update: {},
    create: {
      name: "Health & Wellness",
      slug: "health",
      description: "Health supplements and wellness products",
      images: [],
    },
  });

  // 3. Create attributes
  const sizeAttribute = await prisma.attribute.upsert({
    where: { slug: "size" },
    update: {},
    create: {
      name: "Size",
      slug: "size",
    },
  });

  const colorAttribute = await prisma.attribute.upsert({
    where: { slug: "color" },
    update: {},
    create: {
      name: "Color",
      slug: "color",
    },
  });

  const materialAttribute = await prisma.attribute.upsert({
    where: { slug: "material" },
    update: {},
    create: {
      name: "Material",
      slug: "material",
    },
  });

  const storageAttribute = await prisma.attribute.upsert({
    where: { slug: "storage" },
    update: {},
    create: {
      name: "Storage",
      slug: "storage",
    },
  });

  const brandAttribute = await prisma.attribute.upsert({
    where: { slug: "brand" },
    update: {},
    create: {
      name: "Brand",
      slug: "brand",
    },
  });

  const genderAttribute = await prisma.attribute.upsert({
    where: { slug: "gender" },
    update: {},
    create: {
      name: "Gender",
      slug: "gender",
    },
  });

  const weightAttribute = await prisma.attribute.upsert({
    where: { slug: "weight" },
    update: {},
    create: {
      name: "Weight",
      slug: "weight",
    },
  });

  const screenSizeAttribute = await prisma.attribute.upsert({
    where: { slug: "screen-size" },
    update: {},
    create: {
      name: "Screen Size",
      slug: "screen-size",
    },
  });

  // 4. Create attribute values
  // Size values
  const sizeXS = await prisma.attributeValue.upsert({
    where: { slug: "xs" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XS",
      slug: "xs",
    },
  });

  const sizeS = await prisma.attributeValue.upsert({
    where: { slug: "s" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "S",
      slug: "s",
    },
  });

  const sizeM = await prisma.attributeValue.upsert({
    where: { slug: "m" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "M",
      slug: "m",
    },
  });

  const sizeL = await prisma.attributeValue.upsert({
    where: { slug: "l" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "L",
      slug: "l",
    },
  });

  const sizeXL = await prisma.attributeValue.upsert({
    where: { slug: "xl" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XL",
      slug: "xl",
    },
  });

  const sizeXXL = await prisma.attributeValue.upsert({
    where: { slug: "xxl" },
    update: {},
    create: {
      attributeId: sizeAttribute.id,
      value: "XXL",
      slug: "xxl",
    },
  });

  // Color values
  const colorRed = await prisma.attributeValue.upsert({
    where: { slug: "red" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Red",
      slug: "red",
    },
  });

  const colorBlue = await prisma.attributeValue.upsert({
    where: { slug: "blue" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Blue",
      slug: "blue",
    },
  });

  const colorBlack = await prisma.attributeValue.upsert({
    where: { slug: "black" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Black",
      slug: "black",
    },
  });

  const colorWhite = await prisma.attributeValue.upsert({
    where: { slug: "white" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "White",
      slug: "white",
    },
  });

  const colorGreen = await prisma.attributeValue.upsert({
    where: { slug: "green" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Green",
      slug: "green",
    },
  });

  const colorYellow = await prisma.attributeValue.upsert({
    where: { slug: "yellow" },
    update: {},
    create: {
      attributeId: colorAttribute.id,
      value: "Yellow",
      slug: "yellow",
    },
  });

  // Material values
  const materialCotton = await prisma.attributeValue.upsert({
    where: { slug: "cotton" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Cotton",
      slug: "cotton",
    },
  });

  const materialLeather = await prisma.attributeValue.upsert({
    where: { slug: "leather" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Leather",
      slug: "leather",
    },
  });

  const materialPolyester = await prisma.attributeValue.upsert({
    where: { slug: "polyester" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Polyester",
      slug: "polyester",
    },
  });

  const materialWood = await prisma.attributeValue.upsert({
    where: { slug: "wood" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Wood",
      slug: "wood",
    },
  });

  const materialMetal = await prisma.attributeValue.upsert({
    where: { slug: "metal" },
    update: {},
    create: {
      attributeId: materialAttribute.id,
      value: "Metal",
      slug: "metal",
    },
  });

  // Storage values
  const storage128GB = await prisma.attributeValue.upsert({
    where: { slug: "128gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "128GB",
      slug: "128gb",
    },
  });

  const storage256GB = await prisma.attributeValue.upsert({
    where: { slug: "256gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "256GB",
      slug: "256gb",
    },
  });

  const storage512GB = await prisma.attributeValue.upsert({
    where: { slug: "512gb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "512GB",
      slug: "512gb",
    },
  });

  const storage1TB = await prisma.attributeValue.upsert({
    where: { slug: "1tb" },
    update: {},
    create: {
      attributeId: storageAttribute.id,
      value: "1TB",
      slug: "1tb",
    },
  });

  // Brand values
  const brandApple = await prisma.attributeValue.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Apple",
      slug: "apple",
    },
  });

  const brandNike = await prisma.attributeValue.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Nike",
      slug: "nike",
    },
  });

  const brandAdidas = await prisma.attributeValue.upsert({
    where: { slug: "adidas" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Adidas",
      slug: "adidas",
    },
  });

  const brandSamsung = await prisma.attributeValue.upsert({
    where: { slug: "samsung" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Samsung",
      slug: "samsung",
    },
  });

  const brandIkea = await prisma.attributeValue.upsert({
    where: { slug: "ikea" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "IKEA",
      slug: "ikea",
    },
  });

  // Additional brand values
  const brandSony = await prisma.attributeValue.upsert({
    where: { slug: "sony" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Sony",
      slug: "sony",
    },
  });

  const brandLG = await prisma.attributeValue.upsert({
    where: { slug: "lg" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "LG",
      slug: "lg",
    },
  });

  const brandPuma = await prisma.attributeValue.upsert({
    where: { slug: "puma" },
    update: {},
    create: {
      attributeId: brandAttribute.id,
      value: "Puma",
      slug: "puma",
    },
  });

  // Gender values
  const genderMale = await prisma.attributeValue.upsert({
    where: { slug: "male" },
    update: {},
    create: {
      attributeId: genderAttribute.id,
      value: "Male",
      slug: "male",
    },
  });

  const genderFemale = await prisma.attributeValue.upsert({
    where: { slug: "female" },
    update: {},
    create: {
      attributeId: genderAttribute.id,
      value: "Female",
      slug: "female",
    },
  });

  const genderUnisex = await prisma.attributeValue.upsert({
    where: { slug: "unisex" },
    update: {},
    create: {
      attributeId: genderAttribute.id,
      value: "Unisex",
      slug: "unisex",
    },
  });

  // Weight values
  const weight1kg = await prisma.attributeValue.upsert({
    where: { slug: "1kg" },
    update: {},
    create: {
      attributeId: weightAttribute.id,
      value: "1kg",
      slug: "1kg",
    },
  });

  const weight5kg = await prisma.attributeValue.upsert({
    where: { slug: "5kg" },
    update: {},
    create: {
      attributeId: weightAttribute.id,
      value: "5kg",
      slug: "5kg",
    },
  });

  const weight10kg = await prisma.attributeValue.upsert({
    where: { slug: "10kg" },
    update: {},
    create: {
      attributeId: weightAttribute.id,
      value: "10kg",
      slug: "10kg",
    },
  });

  // Screen size values
  const screen24 = await prisma.attributeValue.upsert({
    where: { slug: "24-inch" },
    update: {},
    create: {
      attributeId: screenSizeAttribute.id,
      value: "24 inch",
      slug: "24-inch",
    },
  });

  const screen32 = await prisma.attributeValue.upsert({
    where: { slug: "32-inch" },
    update: {},
    create: {
      attributeId: screenSizeAttribute.id,
      value: "32 inch",
      slug: "32-inch",
    },
  });

  const screen55 = await prisma.attributeValue.upsert({
    where: { slug: "55-inch" },
    update: {},
    create: {
      attributeId: screenSizeAttribute.id,
      value: "55 inch",
      slug: "55-inch",
    },
  });

  // 5. Assign attributes to categories
  // Clothing attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: sizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: sizeAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: colorAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: clothingCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      attributeId: materialAttribute.id,
      isRequired: false,
    },
  });

  // Footwear attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: sizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: sizeAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: colorAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: footwearCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      attributeId: materialAttribute.id,
      isRequired: false,
    },
  });

  // Electronics attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: colorAttribute.id,
      isRequired: false,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: storageAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: storageAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // Furniture attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: materialAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: materialAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: colorAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: colorAttribute.id,
      isRequired: false,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: furnitureCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // Assign attributes to new categories
  // Sports attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: sportsCategory.id,
        attributeId: sizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: sportsCategory.id,
      attributeId: sizeAttribute.id,
      isRequired: true,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: sportsCategory.id,
        attributeId: weightAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: sportsCategory.id,
      attributeId: weightAttribute.id,
      isRequired: false,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: sportsCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: sportsCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // Beauty attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: beautyCategory.id,
        attributeId: brandAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: beautyCategory.id,
      attributeId: brandAttribute.id,
      isRequired: false,
    },
  });

  // Electronics additional attributes
  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_attributeId: {
        categoryId: electronicsCategory.id,
        attributeId: screenSizeAttribute.id,
      },
    },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      attributeId: screenSizeAttribute.id,
      isRequired: false,
    },
  });

  // Create commission rates for categories
  await prisma.commission.upsert({
    where: { categoryId: electronicsCategory.id },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      rate: 0.0,
      description: "Standard commission for electronics",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: clothingCategory.id },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      rate: 0.0,
      description: "Standard commission for clothing",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: footwearCategory.id },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      rate: 0.0,
      description: "Standard commission for footwear",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: furnitureCategory.id },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      rate: 0.0,
      description: "Standard commission for furniture",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: accessoriesCategory.id },
    update: {},
    create: {
      categoryId: accessoriesCategory.id,
      rate: 0.0,
      description: "Standard commission for accessories",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: sportsCategory.id },
    update: {},
    create: {
      categoryId: sportsCategory.id,
      rate: 0.5,
      description: "Standard commission for sports & outdoors",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: beautyCategory.id },
    update: {},
    create: {
      categoryId: beautyCategory.id,
      rate: 0.0,
      description: "Standard commission for beauty products",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: booksCategory.id },
    update: {},
    create: {
      categoryId: booksCategory.id,
      rate: 0.0,
      description: "Standard commission for books & media",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: toysCategory.id },
    update: {},
    create: {
      categoryId: toysCategory.id,
      rate: 0.5,
      description: "Standard commission for toys & games",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: automotiveCategory.id },
    update: {},
    create: {
      categoryId: automotiveCategory.id,
      rate: 0.5,
      description: "Standard commission for automotive",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: healthCategory.id },
    update: {},
    create: {
      categoryId: healthCategory.id,
      rate: 0.0,
      description: "Standard commission for health & wellness",
    },
  });



  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    return;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
