import { Prisma } from "@prisma/client";
import prisma from "@/infra/database/database.config";

export class AttributeRepository {
  async createAttribute(data: { name: string; slug: string }) {
    return prisma.attribute.create({ data });
  }

  async createAttributeValue(data: {
    attributeId: string;
    value: string;
    slug: string;
  }) {
    return prisma.attributeValue.create({ data });
  }

  async assignAttributeToCategory(data: {
    categoryId: string;
    attributeId: string;
    isRequired: boolean;
  }) {
    return prisma.categoryAttribute.create({ data });
  }

  async assignAttributeToProduct(data: {
    productId: string;
    attributeId: string;
    valueId?: string;
  }) {
    // For now, we'll assign to the first variant of the product
    // In a real implementation, you might want to let users choose which variant
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { variants: true }
    });

    if (!product || product.variants.length === 0) {
      throw new Error("Product or product variants not found");
    }

    // Assign to the first variant (this could be enhanced to let user choose variant)
    const variantId = product.variants[0].id;

    return prisma.productVariantAttribute.create({
      data: {
        variantId,
        attributeId: data.attributeId,
        valueId: data.valueId!,
      },
    });
  }

  async findManyAttributes(params: {
    where?: Prisma.AttributeWhereInput;
    orderBy?: Prisma.AttributeOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    const {
      where,
      orderBy = { createdAt: "desc" },
      skip = 0,
      take = 10,
    } = params;
    return prisma.attribute.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { 
        values: true, 
        categories: { include: { category: true } } 
      },
    });
  }

  async findAttributesByCategory(categoryId: string) {
    return prisma.attribute.findMany({
      where: {
        categories: {
          some: {
            categoryId: categoryId,
          },
        },
      },
      include: {
        values: true,
        categories: {
          where: {
            categoryId: categoryId,
          },
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findAttributeById(id: string) {
    return prisma.attribute.findUnique({
      where: { id },
      include: { values: true },
    });
  }

  async findAttributeValueById(id: string) {
    return prisma.attributeValue.findUnique({
      where: { id },
      include: { attribute: true },
    });
  }

  async deleteAttribute(id: string) {
    return prisma.attribute.delete({ where: { id } });
  }

  async deleteAttributeValue(id: string) {
    return prisma.attributeValue.delete({ where: { id } });
  }
}
