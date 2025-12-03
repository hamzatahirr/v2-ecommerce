import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedProduction() {
  console.log("🌱 Production seeding (only if needed)...");

  try {
    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminExists) {
      console.log("👤 Creating admin user...");
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 12);
      
      await prisma.user.create({
        data: {
          email: "admin@buybuddy.com",
          password: hashedPassword,
          name: "Admin User",
          role: "ADMIN",
        },
      });
      console.log("✅ Admin user created");
    }

    // Check if categories exist
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log("📂 Creating basic categories...");
      const categories = [
        { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
        { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
        { name: "Footwear", slug: "footwear", description: "Shoes and sneakers" },
        { name: "Furniture", slug: "furniture", description: "Home and office furniture" },
      ];

      for (const category of categories) {
        await prisma.category.create({
          data: {
            ...category,
            images: [],
          },
        });
      }
      console.log("✅ Basic categories created");
    }

    // Add allowed domain
    const domainExists = await prisma.allowedDomain.findFirst({
      where: { domain: "buybuddy.com" }
    });

    if (!domainExists) {
      await prisma.allowedDomain.create({
        data: {
          domain: "buybuddy.com",
          isActive: true,
        },
      });
      console.log("✅ Allowed domain created");
    }

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
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });