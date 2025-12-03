import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in reverse order of dependencies to respect foreign key constraints
  await prisma.chatMessage.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.report.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.cartEvent.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.address.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.restock.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariantAttribute.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.allowedDomain.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleanup completed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data first
  await cleanup();

  // 1. Create users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@buybuddy.com" },
    update: {},
    create: {
      email: "admin@buybuddy.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create multiple sellers for multi-vendor system
  const seller1 = await prisma.user.upsert({
    where: { email: "seller1@buybuddy.com" },
    update: {},
    create: {
      email: "seller1@buybuddy.com",
      password: hashedPassword,
      name: "Tech Store Seller",
      role: "USER",
      isSeller: true,
      sellerStatus: "APPROVED",
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@buybuddy.com" },
    update: {},
    create: {
      email: "seller2@buybuddy.com",
      password: hashedPassword,
      name: "Fashion Hub Seller",
      role: "USER",
      isSeller: true,
      sellerStatus: "APPROVED",
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: "seller3@buybuddy.com" },
    update: {},
    create: {
      email: "seller3@buybuddy.com",
      password: hashedPassword,
      name: "Home Goods Seller",
      role: "USER",
      isSeller: true,
      sellerStatus: "APPROVED",
    },
  });

  const seller4 = await prisma.user.upsert({
    where: { email: "seller4@buybuddy.com" },
    update: {},
    create: {
      email: "seller4@buybuddy.com",
      password: hashedPassword,
      name: "Sports Plus Seller",
      role: "USER",
      isSeller: true,
      sellerStatus: "PENDING_APPROVAL",
    },
  });

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: "user1@buybuddy.com" },
    update: {},
    create: {
      email: "user1@buybuddy.com",
      password: hashedPassword,
      name: "John Doe",
      role: "USER",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@buybuddy.com" },
    update: {},
    create: {
      email: "user2@buybuddy.com",
      password: hashedPassword,
      name: "Jane Smith",
      role: "USER",
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
      totalSales: 15000.00,
      totalEarnings: 12000.00,
      averageRating: 4.5,
      reviewCount: 25,
      isVerified: true,
    },
  });

  const sellerProfile2 = await prisma.sellerProfile.upsert({
    where: { userId: seller2.id },
    update: {},
    create: {
      userId: seller2.id,
      storeName: "Fashion Hub",
      storeDescription: "Trendy fashion for everyone",
      phone: "+1234567891",
      address: "456 Fashion Ave, New York, NY 10001",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001",
      totalSales: 8500.00,
      totalEarnings: 6800.00,
      averageRating: 4.2,
      reviewCount: 18,
      isVerified: true,
    },
  });

  const sellerProfile3 = await prisma.sellerProfile.upsert({
    where: { userId: seller3.id },
    update: {},
    create: {
      userId: seller3.id,
      storeName: "Home Goods",
      storeDescription: "Quality furniture and home decor",
      phone: "+1234567892",
      address: "789 Home Blvd, Austin, TX 73301",
      city: "Austin",
      state: "TX",
      country: "USA",
      zipCode: "73301",
      totalSales: 12000.00,
      totalEarnings: 9600.00,
      averageRating: 4.7,
      reviewCount: 32,
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

  const wallet2 = await prisma.wallet.upsert({
    where: { sellerId: seller2.id },
    update: {},
    create: {
      sellerId: seller2.id,
      balance: 1800.00,
      availableBalance: 1500.00,
      pendingBalance: 300.00,
    },
  });

  const wallet3 = await prisma.wallet.upsert({
    where: { sellerId: seller3.id },
    update: {},
    create: {
      sellerId: seller3.id,
      balance: 3200.00,
      availableBalance: 2800.00,
      pendingBalance: 400.00,
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

  await prisma.sellerSubscription.upsert({
    where: { stripeSubscriptionId: "sub_fashionhub456" },
    update: {},
    create: {
      sellerId: seller2.id,
      planName: "Basic",
      amount: 9.99,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stripeSubscriptionId: "sub_fashionhub456",
      stripeCustomerId: "cus_fashionhub456",
    },
  });

  // 7. Create allowed domains for user registration
  const allowedDomains = [
    "buybuddy.com",
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

  // 6. Create 20+ products with variants for multi-vendor system
  const products = [
    // Electronics
    // Electronics - Seller 1 (Tech Store)
    {
      name: "iPhone 16 Pro",
      slug: "iphone-16-pro",
      description: "Latest iPhone with advanced features",
      categoryId: electronicsCategory.id,
      sellerId: seller1.id,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "IPH16-PRO-128-BLACK",
          price: 999.99,
          stock: 25,
          barcode: "1234567890001",
          warehouseLocation: "WH-1A",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage128GB.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandApple.id },
          ],
        },
        {
          sku: "IPH16-PRO-256-BLUE",
          price: 1099.99,
          stock: 20,
          barcode: "1234567890002",
          warehouseLocation: "WH-1B",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage256GB.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: brandAttribute.id, valueId: brandApple.id },
          ],
        },
      ],
    },
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      description: "Premium Android smartphone",
      categoryId: electronicsCategory.id,
      sellerId: seller1.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "SAMS-S24-256-GREEN",
          price: 899.99,
          stock: 30,
          barcode: "1234567890003",
          warehouseLocation: "WH-2A",
          attributes: [
            { attributeId: storageAttribute.id, valueId: storage256GB.id },
            { attributeId: colorAttribute.id, valueId: colorGreen.id },
            { attributeId: brandAttribute.id, valueId: brandSamsung.id },
          ],
        },
      ],
    },

    // More Electronics
    {
      name: "Sony PlayStation 5",
      slug: "sony-playstation-5",
      description: "Latest gaming console",
      categoryId: electronicsCategory.id,
      sellerId: seller1.id,
      isNew: false,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      variants: [
        {
          sku: "PS5-STD-1",
          price: 499.99,
          stock: 15,
          barcode: "1234567890018",
          warehouseLocation: "WH-11A",
          attributes: [
            { attributeId: brandAttribute.id, valueId: brandSony.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
          ],
        },
        {
          sku: "PS5-DIG-1",
          price: 399.99,
          stock: 12,
          barcode: "1234567890019",
          warehouseLocation: "WH-11B",
          attributes: [
            { attributeId: brandAttribute.id, valueId: brandSony.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
        },
      ],
    },
    {
      name: "LG 55 inch OLED TV",
      slug: "lg-55-oled-tv",
      description: "Premium OLED television",
      categoryId: electronicsCategory.id,
      sellerId: seller1.id,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "LG-OLED-55-1",
          price: 1499.99,
          stock: 8,
          barcode: "1234567890020",
          warehouseLocation: "WH-12A",
          attributes: [
            { attributeId: brandAttribute.id, valueId: brandLG.id },
            { attributeId: screenSizeAttribute.id, valueId: screen55.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
        },
      ],
    },

    // Clothing - Seller 2 (Fashion Hub)
    {
      name: "Cotton T-Shirt",
      slug: "cotton-t-shirt",
      description: "Comfortable cotton t-shirt",
      categoryId: clothingCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "TSH-COT-RED-S",
          price: 19.99,
          stock: 50,
          barcode: "1234567890004",
          warehouseLocation: "WH-3A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeS.id },
            { attributeId: colorAttribute.id, valueId: colorRed.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
        },
        {
          sku: "TSH-COT-BLUE-M",
          price: 19.99,
          stock: 45,
          barcode: "1234567890005",
          warehouseLocation: "WH-3B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
        },
        {
          sku: "TSH-COT-BLACK-L",
          price: 19.99,
          stock: 40,
          barcode: "1234567890006",
          warehouseLocation: "WH-3C",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
        },
      ],
    },
    {
      name: "Denim Jeans",
      slug: "denim-jeans",
      description: "Classic denim jeans",
      categoryId: clothingCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      variants: [
        {
          sku: "JNS-DEN-BLUE-32",
          price: 59.99,
          stock: 35,
          barcode: "1234567890007",
          warehouseLocation: "WH-4A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
        },
        {
          sku: "JNS-DEN-BLACK-34",
          price: 59.99,
          stock: 30,
          barcode: "1234567890008",
          warehouseLocation: "WH-4B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
          ],
        },
      ],
    },

    // More Clothing
    {
      name: "Winter Jacket",
      slug: "winter-jacket",
      description: "Warm winter jacket",
      categoryId: clothingCategory.id,
      sellerId: seller2.id,
      isNew: true,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "JKT-WIN-BLK-M",
          price: 89.99,
          stock: 20,
          barcode: "1234567890021",
          warehouseLocation: "WH-13A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: genderAttribute.id, valueId: genderUnisex.id },
          ],
        },
        {
          sku: "JKT-WIN-BLK-L",
          price: 89.99,
          stock: 18,
          barcode: "1234567890022",
          warehouseLocation: "WH-13B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: genderAttribute.id, valueId: genderUnisex.id },
          ],
        },
      ],
    },
    {
      name: "Summer Dress",
      slug: "summer-dress",
      description: "Light summer dress",
      categoryId: clothingCategory.id,
      sellerId: seller2.id,
      isNew: true,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "DRS-SUM-RED-S",
          price: 49.99,
          stock: 25,
          barcode: "1234567890023",
          warehouseLocation: "WH-14A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeS.id },
            { attributeId: colorAttribute.id, valueId: colorRed.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
            { attributeId: genderAttribute.id, valueId: genderFemale.id },
          ],
        },
        {
          sku: "DRS-SUM-BLU-M",
          price: 49.99,
          stock: 22,
          barcode: "1234567890024",
          warehouseLocation: "WH-14B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeM.id },
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: materialAttribute.id, valueId: materialCotton.id },
            { attributeId: genderAttribute.id, valueId: genderFemale.id },
          ],
        },
      ],
    },

    // Footwear - Seller 2
    {
      name: "Nike Air Max",
      slug: "nike-air-max",
      description: "Comfortable running shoes",
      categoryId: footwearCategory.id,
      sellerId: seller2.id,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "NKE-AM-WHT-42",
          price: 129.99,
          stock: 25,
          barcode: "1234567890009",
          warehouseLocation: "WH-5A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
            {
              attributeId: materialAttribute.id,
              valueId: materialPolyester.id,
            },
            { attributeId: brandAttribute.id, valueId: brandNike.id },
          ],
        },
        {
          sku: "NKE-AM-BLK-44",
          price: 129.99,
          stock: 20,
          barcode: "1234567890010",
          warehouseLocation: "WH-5B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeXL.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            {
              attributeId: materialAttribute.id,
              valueId: materialPolyester.id,
            },
            { attributeId: brandAttribute.id, valueId: brandNike.id },
          ],
        },
      ],
    },
    {
      name: "Adidas Ultraboost",
      slug: "adidas-ultraboost",
      description: "Premium running shoes",
      categoryId: footwearCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "ADI-UB-RED-43",
          price: 179.99,
          stock: 15,
          barcode: "1234567890011",
          warehouseLocation: "WH-6A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorRed.id },
            {
              attributeId: materialAttribute.id,
              valueId: materialPolyester.id,
            },
            { attributeId: brandAttribute.id, valueId: brandAdidas.id },
          ],
        },
      ],
    },

    // More Footwear
    {
      name: "Puma Running Shoes",
      slug: "puma-running-shoes",
      description: "Lightweight running shoes",
      categoryId: footwearCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "PUM-RUN-WHT-42",
          price: 79.99,
          stock: 30,
          barcode: "1234567890025",
          warehouseLocation: "WH-15A",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeL.id },
            { attributeId: colorAttribute.id, valueId: colorWhite.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: brandAttribute.id, valueId: brandPuma.id },
            { attributeId: genderAttribute.id, valueId: genderUnisex.id },
          ],
        },
        {
          sku: "PUM-RUN-BLK-44",
          price: 79.99,
          stock: 25,
          barcode: "1234567890026",
          warehouseLocation: "WH-15B",
          attributes: [
            { attributeId: sizeAttribute.id, valueId: sizeXL.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: brandAttribute.id, valueId: brandPuma.id },
            { attributeId: genderAttribute.id, valueId: genderUnisex.id },
          ],
        },
      ],
    },

    // Furniture - Seller 3 (Home Goods)
    {
      name: "Wooden Chair",
      slug: "wooden-chair",
      description: "Elegant wooden chair",
      categoryId: furnitureCategory.id,
      sellerId: seller3.id,
      isNew: false,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "CHR-WOD-BRN-1",
          price: 149.99,
          stock: 10,
          barcode: "1234567890012",
          warehouseLocation: "WH-7A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
        },
      ],
    },
    {
      name: "Metal Desk",
      slug: "metal-desk",
      description: "Modern metal desk",
      categoryId: furnitureCategory.id,
      sellerId: seller3.id,
      isNew: false,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      variants: [
        {
          sku: "DSK-MTL-SLV-1",
          price: 299.99,
          stock: 8,
          barcode: "1234567890013",
          warehouseLocation: "WH-8A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
        },
      ],
    },

    // More Furniture
    {
      name: "Office Sofa",
      slug: "office-sofa",
      description: "Comfortable office sofa",
      categoryId: furnitureCategory.id,
      sellerId: seller3.id,
      isNew: true,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "SOF-OFF-GRY-3",
          price: 599.99,
          stock: 5,
          barcode: "1234567890027",
          warehouseLocation: "WH-16A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
        },
      ],
    },
    {
      name: "Bookshelf",
      slug: "bookshelf",
      description: "Wooden bookshelf",
      categoryId: furnitureCategory.id,
      sellerId: seller3.id,
      isNew: false,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "BSH-WOD-BRN-5",
          price: 199.99,
          stock: 12,
          barcode: "1234567890028",
          warehouseLocation: "WH-17A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialWood.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: brandAttribute.id, valueId: brandIkea.id },
          ],
        },
      ],
    },

    // Accessories - Seller 2
    {
      name: "Leather Wallet",
      slug: "leather-wallet",
      description: "Premium leather wallet",
      categoryId: accessoriesCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "WLT-LTH-BLK-1",
          price: 49.99,
          stock: 20,
          barcode: "1234567890014",
          warehouseLocation: "WH-9A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
        },
        {
          sku: "WLT-LTH-BRN-1",
          price: 49.99,
          stock: 18,
          barcode: "1234567890015",
          warehouseLocation: "WH-9B",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialLeather.id },
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
          ],
        },
      ],
    },
    {
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Stylish sunglasses",
      categoryId: accessoriesCategory.id,
      sellerId: seller2.id,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "SGL-BLK-1",
          price: 89.99,
          stock: 12,
          barcode: "1234567890016",
          warehouseLocation: "WH-10A",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlack.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
        },
        {
          sku: "SGL-YLW-1",
          price: 89.99,
          stock: 10,
          barcode: "1234567890017",
          warehouseLocation: "WH-10B",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorYellow.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
        },
      ],
    },

    // Sports & Outdoors - Seller 4 (Sports Plus)
    {
      name: "Yoga Mat",
      slug: "yoga-mat",
      description: "Non-slip yoga mat",
      categoryId: sportsCategory.id,
      sellerId: seller4.id,
      isNew: false,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "YOG-MAT-GRN-1",
          price: 29.99,
          stock: 40,
          barcode: "1234567890029",
          warehouseLocation: "WH-18A",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorGreen.id },
            { attributeId: weightAttribute.id, valueId: weight1kg.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
          ],
        },
        {
          sku: "YOG-MAT-BLU-1",
          price: 29.99,
          stock: 35,
          barcode: "1234567890030",
          warehouseLocation: "WH-18B",
          attributes: [
            { attributeId: colorAttribute.id, valueId: colorBlue.id },
            { attributeId: weightAttribute.id, valueId: weight1kg.id },
            { attributeId: materialAttribute.id, valueId: materialPolyester.id },
          ],
        },
      ],
    },
    {
      name: "Dumbbells Set",
      slug: "dumbbells-set",
      description: "Adjustable dumbbells set",
      categoryId: sportsCategory.id,
      sellerId: seller4.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: true,
      variants: [
        {
          sku: "DMB-SET-5KG-1",
          price: 89.99,
          stock: 15,
          barcode: "1234567890031",
          warehouseLocation: "WH-19A",
          attributes: [
            { attributeId: weightAttribute.id, valueId: weight5kg.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
        },
        {
          sku: "DMB-SET-10KG-1",
          price: 149.99,
          stock: 10,
          barcode: "1234567890032",
          warehouseLocation: "WH-19B",
          attributes: [
            { attributeId: weightAttribute.id, valueId: weight10kg.id },
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
        },
      ],
    },

    // Beauty & Personal Care - Seller 2
    {
      name: "Face Cream",
      slug: "face-cream",
      description: "Moisturizing face cream",
      categoryId: beautyCategory.id,
      sellerId: seller2.id,
      isNew: true,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "FCR-MOI-50ML-1",
          price: 24.99,
          stock: 30,
          barcode: "1234567890033",
          warehouseLocation: "WH-20A",
          attributes: [
            { attributeId: brandAttribute.id, valueId: brandNike.id },
          ],
        },
      ],
    },
    {
      name: "Perfume",
      slug: "perfume",
      description: "Luxury perfume",
      categoryId: beautyCategory.id,
      sellerId: seller2.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "PRF-LUX-100ML-1",
          price: 89.99,
          stock: 20,
          barcode: "1234567890034",
          warehouseLocation: "WH-20B",
          attributes: [
            { attributeId: brandAttribute.id, valueId: brandNike.id },
          ],
        },
      ],
    },

    // Books & Media - Seller 1
    {
      name: "Programming Book",
      slug: "programming-book",
      description: "Learn programming from scratch",
      categoryId: booksCategory.id,
      sellerId: seller1.id,
      isNew: false,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      variants: [
        {
          sku: "BK-PROG-1",
          price: 39.99,
          stock: 25,
          barcode: "1234567890035",
          warehouseLocation: "WH-21A",
          attributes: [],
        },
      ],
    },

    // Toys & Games - Seller 3
    {
      name: "Board Game",
      slug: "board-game",
      description: "Family board game",
      categoryId: toysCategory.id,
      sellerId: seller3.id,
      isNew: true,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      variants: [
        {
          sku: "BDG-FAM-1",
          price: 34.99,
          stock: 18,
          barcode: "1234567890036",
          warehouseLocation: "WH-22A",
          attributes: [],
        },
      ],
    },

    // Automotive - Seller 1
    {
      name: "Car Phone Holder",
      slug: "car-phone-holder",
      description: "Universal car phone holder",
      categoryId: automotiveCategory.id,
      sellerId: seller1.id,
      isNew: false,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      variants: [
        {
          sku: "CPH-UNI-1",
          price: 19.99,
          stock: 50,
          barcode: "1234567890037",
          warehouseLocation: "WH-23A",
          attributes: [
            { attributeId: materialAttribute.id, valueId: materialMetal.id },
          ],
        },
      ],
    },

    // Health & Wellness - Seller 4
    {
      name: "Vitamin C Supplement",
      slug: "vitamin-c-supplement",
      description: "Immune support supplement",
      categoryId: healthCategory.id,
      sellerId: seller4.id,
      isNew: false,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      variants: [
        {
          sku: "VIT-C-100TAB-1",
          price: 14.99,
          stock: 60,
          barcode: "1234567890038",
          warehouseLocation: "WH-24A",
          attributes: [],
        },
      ],
    },
  ];

  // Create products and variants
  const createdProducts: any[] = [];
  const createdVariants: any[] = [];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        categoryId: productData.categoryId,
        sellerId: productData.sellerId,
        isNew: productData.isNew,
        isFeatured: productData.isFeatured,
        isTrending: productData.isTrending,
        isBestSeller: productData.isBestSeller,
      },
    });

    createdProducts.push(product);

    for (const variantData of productData.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantData.sku,
          price: variantData.price,
          stock: variantData.stock,
          lowStockThreshold: 10,
          barcode: variantData.barcode,
          warehouseLocation: variantData.warehouseLocation,
          images: [],
        },
      });

      // Create variant attributes
      for (const attr of variantData.attributes) {
        await prisma.productVariantAttribute.create({
          data: {
            variantId: variant.id,
            attributeId: attr.attributeId,
            valueId: attr.valueId,
          },
        });
      }

      createdVariants.push(variant);
    }
  }

  // Create commission rates for categories
  await prisma.commission.upsert({
    where: { categoryId: electronicsCategory.id },
    update: {},
    create: {
      categoryId: electronicsCategory.id,
      rate: 5.0,
      description: "Standard commission for electronics",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: clothingCategory.id },
    update: {},
    create: {
      categoryId: clothingCategory.id,
      rate: 8.0,
      description: "Standard commission for clothing",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: footwearCategory.id },
    update: {},
    create: {
      categoryId: footwearCategory.id,
      rate: 7.0,
      description: "Standard commission for footwear",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: furnitureCategory.id },
    update: {},
    create: {
      categoryId: furnitureCategory.id,
      rate: 10.0,
      description: "Standard commission for furniture",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: accessoriesCategory.id },
    update: {},
    create: {
      categoryId: accessoriesCategory.id,
      rate: 6.0,
      description: "Standard commission for accessories",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: sportsCategory.id },
    update: {},
    create: {
      categoryId: sportsCategory.id,
      rate: 7.5,
      description: "Standard commission for sports & outdoors",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: beautyCategory.id },
    update: {},
    create: {
      categoryId: beautyCategory.id,
      rate: 9.0,
      description: "Standard commission for beauty products",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: booksCategory.id },
    update: {},
    create: {
      categoryId: booksCategory.id,
      rate: 4.0,
      description: "Standard commission for books & media",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: toysCategory.id },
    update: {},
    create: {
      categoryId: toysCategory.id,
      rate: 6.5,
      description: "Standard commission for toys & games",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: automotiveCategory.id },
    update: {},
    create: {
      categoryId: automotiveCategory.id,
      rate: 8.5,
      description: "Standard commission for automotive",
    },
  });

  await prisma.commission.upsert({
    where: { categoryId: healthCategory.id },
    update: {},
    create: {
      categoryId: healthCategory.id,
      rate: 7.0,
      description: "Standard commission for health & wellness",
    },
  });

  // 8. Create homepage sections for better UI
  await prisma.section.upsert({
    where: { id: 1 },
    update: {},
    create: {
      type: "HERO",
      title: "Welcome to BuyBuddy",
      description: "Your trusted marketplace for quality products",
      images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600"],
      link: "/shop",
      ctaText: "Shop Now",
      isVisible: true,
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
    },
  });

  await prisma.section.upsert({
    where: { id: 2 },
    update: {},
    create: {
      type: "PROMOTIONAL",
      title: "Flash Sale",
      description: "Up to 50% off on selected items",
      images: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600"],
      link: "/shop?sale=true",
      ctaText: "View Deals",
      isVisible: true,
      primaryColor: "#EF4444",
      secondaryColor: "#F59E0B",
    },
  });

  await prisma.section.upsert({
    where: { id: 3 },
    update: {},
    create: {
      type: "BENEFITS",
      title: "Why Choose Us",
      description: "Fast delivery, secure payments, and quality products",
      icons: "truck,shield,star",
      isVisible: true,
      primaryColor: "#6366F1",
      secondaryColor: "#8B5CF6",
    },
  });

  await prisma.section.upsert({
    where: { id: 4 },
    update: {},
    create: {
      type: "NEW_ARRIVALS",
      title: "New Arrivals",
      description: "Check out our latest products",
      link: "/shop?new=true",
      ctaText: "Explore New",
      isVisible: true,
      primaryColor: "#10B981",
      secondaryColor: "#059669",
    },
  });

  // 9. Create sample reviews for products
  const sampleReviews = [
    {
      productId: createdProducts[0]?.id, // iPhone 16 Pro
      userId: user1.id,
      rating: 5,
      comment: "Amazing phone! The camera quality is outstanding."
    },
    {
      productId: createdProducts[4]?.id, // Cotton T-Shirt
      userId: user2.id,
      rating: 4,
      comment: "Very comfortable and good quality fabric."
    },
    {
      productId: createdProducts[10]?.id, // Nike Air Max
      userId: user1.id,
      rating: 5,
      comment: "Perfect fit and very comfortable for running."
    },
    {
      productId: createdProducts[14]?.id, // Wooden Chair
      userId: user2.id,
      rating: 4,
      comment: "Good quality wood, easy to assemble."
    }
  ];

  for (const review of sampleReviews) {
    if (review.productId) {
      await prisma.review.create({
        data: {
          userId: review.userId,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Created:");
  console.log(`- Users: Admin, 4 Sellers, 2 Regular Users`);
  console.log(`- Seller Profiles: Tech Store, Fashion Hub, Home Goods, Sports Plus`);
  console.log(`- Categories: 12 categories (Electronics, Clothing, Footwear, Furniture, Accessories, Sports, Beauty, Books, Toys, Automotive, Health)`);
  console.log(`- Attributes: Size, Color, Material, Storage, Brand, Gender, Weight, Screen Size`);
  console.log(`- Products: ${createdProducts.length}+ products with variants`);
  console.log(`- Variants: ${createdVariants.length}+ variants with attributes`);
  console.log(`- Seller Wallets: 3 wallets with balances`);
  console.log(`- Seller Subscriptions: 2 active subscriptions`);
  console.log(`- Commission Rates: Set for all categories`);
  console.log(`- Allowed Domains: ${allowedDomains.length} domains for user registration`);
  console.log(`- Homepage Sections: 4 sections (Hero, Promotional, Benefits, New Arrivals)`);
  console.log(`- Sample Reviews: Added for popular products`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    return;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
