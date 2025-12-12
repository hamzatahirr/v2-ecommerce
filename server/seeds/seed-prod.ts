import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function seedProduction() {
  console.log("🌱 Production seeding (only if needed)...");

  try {
    // --- 1. ADMIN USER ---
    const adminExists = await prisma.user.findFirst({
      where: { email: "admin@buybuddy.com" }
    });

    if (!adminExists) {
      console.log("👤 Creating admin user...");
      const hashedPassword = await bcryptjs.hash("qwx2r.txcyPLq?", 12);
      
      await prisma.user.create({
        data: {
          email: "admin@buybuddy.com",
          password: hashedPassword,
          name: "Admin User",
          role: "ADMIN",
          // New field from model updates
          verificationStatus: "APPROVED", 
        },
      });
      console.log("✅ Admin user created");
    } else {
      console.log("👤 Admin user already exists");
    }

    // --- 2. BASE CATEGORIES (Including all new ones) ---
    const categoriesToSeed = [
        { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
        { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
        { name: "Footwear", slug: "footwear", description: "Shoes and sneakers" },
        { name: "Furniture", slug: "furniture", description: "Home and office furniture" },
        // New Categories from DEV
        { name: "Accessories", slug: "accessories", description: "Fashion accessories and jewelry" },
        { name: "Sports & Outdoors", slug: "sports", description: "Sports equipment and outdoor gear" },
        { name: "Beauty & Personal Care", slug: "beauty", description: "Cosmetics and personal care products" },
        { name: "Books & Media", slug: "books", description: "Books, movies, and music" },
        { name: "Toys & Games", slug: "toys", description: "Toys, games, and hobbies" },
        { name: "Automotive", slug: "automotive", description: "Car parts and accessories" },
        { name: "Health & Wellness", slug: "health", description: "Health supplements and wellness products" },
    ];

    console.log("📂 Upserting categories...");
    const categoryMap = new Map();
    for (const category of categoriesToSeed) {
      const result = await prisma.category.upsert({
        where: { slug: category.slug },
        update: { ...category },
        create: {
          ...category,
          images: [], // New 'images' field
        },
      });
      categoryMap.set(category.slug, result);
    }
    console.log("✅ Categories upserted");
    
    // --- 3. ALLOWED DOMAINS ---
    const allowedDomains = ["buybuddypk.store", "gmail.com"];
    console.log("🌐 Upserting allowed domains...");

    for (const domain of allowedDomains) {
      await prisma.allowedDomain.upsert({
        where: { domain },
        update: { isActive: true },
        create: {
          domain,
          isActive: true,
        },
      });
    }
    console.log("✅ Allowed domains upserted");

    // --- 4. ATTRIBUTES ---
    const attributesToSeed = [
        { name: "Size", slug: "size" },
        { name: "Color", slug: "color" },
        { name: "Material", slug: "material" },
        { name: "Storage", slug: "storage" },
        { name: "Brand", slug: "brand" },
        { name: "Gender", slug: "gender" },
        { name: "Weight", slug: "weight" },
        { name: "Screen Size", slug: "screen-size" },
    ];

    console.log("📏 Upserting attributes...");
    const attributeMap = new Map();
    for (const attr of attributesToSeed) {
        const result = await prisma.attribute.upsert({
            where: { slug: attr.slug },
            update: { ...attr },
            create: { ...attr },
        });
        attributeMap.set(attr.slug, result);
    }
    console.log("✅ Attributes upserted");

    // --- 5. ATTRIBUTE VALUES ---
    // This is a large block, kept as is from dev for completeness.
    console.log("🔢 Upserting attribute values...");
    const attrValuesToSeed = [
        // Size values
        { attrSlug: "size", value: "XS", slug: "xs" },
        { attrSlug: "size", value: "S", slug: "s" },
        { attrSlug: "size", value: "M", slug: "m" },
        { attrSlug: "size", value: "L", slug: "l" },
        { attrSlug: "size", value: "XL", slug: "xl" },
        { attrSlug: "size", value: "XXL", slug: "xxl" },
        // Color values
        { attrSlug: "color", value: "Red", slug: "red" },
        { attrSlug: "color", value: "Blue", slug: "blue" },
        { attrSlug: "color", value: "Black", slug: "black" },
        { attrSlug: "color", value: "White", slug: "white" },
        { attrSlug: "color", value: "Green", slug: "green" },
        { attrSlug: "color", value: "Yellow", slug: "yellow" },
        // Material values
        { attrSlug: "material", value: "Cotton", slug: "cotton" },
        { attrSlug: "material", value: "Leather", slug: "leather" },
        { attrSlug: "material", value: "Polyester", slug: "polyester" },
        { attrSlug: "material", value: "Wood", slug: "wood" },
        { attrSlug: "material", value: "Metal", slug: "metal" },
        // Storage values
        { attrSlug: "storage", value: "128GB", slug: "128gb" },
        { attrSlug: "storage", value: "256GB", slug: "256gb" },
        { attrSlug: "storage", value: "512GB", slug: "512gb" },
        { attrSlug: "storage", value: "1TB", slug: "1tb" },
        // Brand values
        { attrSlug: "brand", value: "Apple", slug: "apple" },
        { attrSlug: "brand", value: "Nike", slug: "nike" },
        { attrSlug: "brand", value: "Adidas", slug: "adidas" },
        { attrSlug: "brand", value: "Samsung", slug: "samsung" },
        { attrSlug: "brand", value: "IKEA", slug: "ikea" },
        { attrSlug: "brand", value: "Sony", slug: "sony" },
        { attrSlug: "brand", value: "LG", slug: "lg" },
        { attrSlug: "brand", value: "Puma", slug: "puma" },
        // Gender values
        { attrSlug: "gender", value: "Male", slug: "male" },
        { attrSlug: "gender", value: "Female", slug: "female" },
        { attrSlug: "gender", value: "Unisex", slug: "unisex" },
        // Weight values
        { attrSlug: "weight", value: "1kg", slug: "1kg" },
        { attrSlug: "weight", value: "5kg", slug: "5kg" },
        { attrSlug: "weight", value: "10kg", slug: "10kg" },
        // Screen size values
        { attrSlug: "screen-size", value: "24 inch", slug: "24-inch" },
        { attrSlug: "screen-size", value: "32 inch", slug: "32-inch" },
        { attrSlug: "screen-size", value: "55 inch", slug: "55-inch" },
    ];

    for (const val of attrValuesToSeed) {
      const attribute = attributeMap.get(val.attrSlug);
      if (attribute) {
        await prisma.attributeValue.upsert({
          where: { slug: val.slug },
          update: { 
            value: val.value,
            attributeId: attribute.id,
          },
          create: {
            attributeId: attribute.id,
            value: val.value,
            slug: val.slug,
          },
        });
      }
    }
    console.log("✅ Attribute values upserted");

    // --- 6. CATEGORY-ATTRIBUTE ASSIGNMENTS ---
    console.log("🔗 Assigning attributes to categories...");

    // Helper function for assigning an attribute to a category
    const assignAttribute = async (categorySlug: string, attributeSlug: string, isRequired: boolean) => {
      const category = categoryMap.get(categorySlug);
      const attribute = attributeMap.get(attributeSlug);
      
      if (category && attribute) {
        await prisma.categoryAttribute.upsert({
          where: {
            categoryId_attributeId: {
              categoryId: category.id,
              attributeId: attribute.id,
            },
          },
          update: { isRequired },
          create: {
            categoryId: category.id,
            attributeId: attribute.id,
            isRequired,
          },
        });
      }
    };

    // Assignments based on DEV file
    await assignAttribute("clothing", "size", true);
    await assignAttribute("clothing", "color", true);
    await assignAttribute("clothing", "material", false);

    await assignAttribute("footwear", "size", true);
    await assignAttribute("footwear", "color", true);
    await assignAttribute("footwear", "material", false);

    await assignAttribute("electronics", "color", false);
    await assignAttribute("electronics", "storage", true);
    await assignAttribute("electronics", "brand", false);
    await assignAttribute("electronics", "screen-size", false); // Additional electronics attribute

    await assignAttribute("furniture", "material", true);
    await assignAttribute("furniture", "color", false);
    await assignAttribute("furniture", "brand", false);

    await assignAttribute("sports", "size", true);
    await assignAttribute("sports", "weight", false);
    await assignAttribute("sports", "brand", false);

    await assignAttribute("beauty", "brand", false);

    console.log("✅ Category-attribute assignments completed");

    // --- 7. COMMISSION RATES (Using 0.0 default rate for most) ---
    console.log("💰 Upserting commission rates...");
    
    const commissionsToSeed = [
        { slug: "electronics", rate: 0.0, description: "Standard commission for electronics" },
        { slug: "clothing", rate: 0.0, description: "Standard commission for clothing" },
        { slug: "footwear", rate: 0.0, description: "Standard commission for footwear" },
        { slug: "furniture", rate: 0.0, description: "Standard commission for furniture" },
        { slug: "accessories", rate: 0.0, description: "Standard commission for accessories" },
        { slug: "sports", rate: 0.5, description: "Standard commission for sports & outdoors" },
        { slug: "beauty", rate: 0.0, description: "Standard commission for beauty products" },
        { slug: "books", rate: 0.0, description: "Standard commission for books & media" },
        { slug: "toys", rate: 0.5, description: "Standard commission for toys & games" },
        { slug: "automotive", rate: 0.5, description: "Standard commission for automotive" },
        { slug: "health", rate: 0.0, description: "Standard commission for health & wellness" },
    ];
    
    for (const comm of commissionsToSeed) {
        const category = categoryMap.get(comm.slug);
        if (category) {
            await prisma.commission.upsert({
                where: { categoryId: category.id },
                update: { rate: comm.rate, description: comm.description },
                create: {
                    categoryId: category.id,
                    rate: comm.rate,
                    description: comm.description,
                },
            });
        }
    }
    console.log("✅ Commission rates upserted");

    console.log("🎉 Production seeding completed successfully!");

  } catch (error) {
    console.error("❌ Error in production seeding:", error);
    throw error;
  }
}

async function main() {
  await seedProduction();
}

main()
  .catch((e) => {
    console.error(e);
    return;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });