import prisma from "@/infra/database/database.config";

export class AllowedDomainRepository {
  async createDomain(domain: string) {
    return await prisma.allowedDomain.create({
      data: {
        domain,
        isActive: true
      }
    });
  }

  async findAllDomains(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [domains, total] = await Promise.all([
      prisma.allowedDomain.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.allowedDomain.count()
    ]);

    return {
      domains,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findActiveDomains() {
    return await prisma.allowedDomain.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findDomainById(id: string) {
    return await prisma.allowedDomain.findUnique({
      where: { id }
    });
  }

  async findDomainByDomain(domain: string) {
    return await prisma.allowedDomain.findUnique({
      where: { domain }
    });
  }

  async updateDomain(id: string, data: { domain?: string; isActive?: boolean }) {
    return await prisma.allowedDomain.update({
      where: { id },
      data
    });
  }

  async deleteDomain(id: string) {
    return await prisma.allowedDomain.delete({
      where: { id }
    });
  }

  async toggleDomainStatus(id: string) {
    const domain = await prisma.allowedDomain.findUnique({
      where: { id }
    });

    if (!domain) {
      throw new Error("Domain not found");
    }

    return await prisma.allowedDomain.update({
      where: { id },
      data: { isActive: !domain.isActive }
    });
  }

  async isDomainAllowed(domain: string): Promise<boolean> {
    const allowedDomain = await prisma.allowedDomain.findFirst({
      where: {
        domain,
        isActive: true
      }
    });

    return !!allowedDomain;
  }

  async bulkCreateDomains(domains: string[]) {
    return await prisma.$transaction(
      domains.map(domain =>
        prisma.allowedDomain.create({
          data: {
            domain,
            isActive: true
          }
        })
      )
    );
  }
}