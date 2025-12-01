import AppError from "@/shared/errors/AppError";
import { AllowedDomainRepository } from "./allowed-domains.repository";

export class AllowedDomainService {
  constructor(private allowedDomainRepository: AllowedDomainRepository) {}

  async createDomain(domain: string) {
    // Validate domain format
    if (!this.isValidDomain(domain)) {
      throw new AppError(400, "Invalid domain format");
    }

    // Check if domain already exists
    const existingDomain = await this.allowedDomainRepository.findDomainByDomain(domain);
    if (existingDomain) {
      throw new AppError(400, "Domain already exists");
    }

    return await this.allowedDomainRepository.createDomain(domain);
  }

  async getAllDomains(page = 1, limit = 20) {
    return await this.allowedDomainRepository.findAllDomains(page, limit);
  }

  async getActiveDomains() {
    return await this.allowedDomainRepository.findActiveDomains();
  }

  async getDomainById(id: string) {
    const domain = await this.allowedDomainRepository.findDomainById(id);
    if (!domain) {
      throw new AppError(404, "Domain not found");
    }
    return domain;
  }

  async updateDomain(id: string, data: { domain?: string; isActive?: boolean }) {
    // Validate domain format if provided
    if (data.domain && !this.isValidDomain(data.domain)) {
      throw new AppError(400, "Invalid domain format");
    }

    // Check if domain already exists (if updating domain)
    if (data.domain) {
      const existingDomain = await this.allowedDomainRepository.findDomainByDomain(data.domain);
      if (existingDomain && existingDomain.id !== id) {
        throw new AppError(400, "Domain already exists");
      }
    }

    const domain = await this.allowedDomainRepository.findDomainById(id);
    if (!domain) {
      throw new AppError(404, "Domain not found");
    }

    return await this.allowedDomainRepository.updateDomain(id, data);
  }

  async deleteDomain(id: string) {
    const domain = await this.allowedDomainRepository.findDomainById(id);
    if (!domain) {
      throw new AppError(404, "Domain not found");
    }

    return await this.allowedDomainRepository.deleteDomain(id);
  }

  async toggleDomainStatus(id: string) {
    return await this.allowedDomainRepository.toggleDomainStatus(id);
  }

  async validateUserEmail(email: string): Promise<{ isValid: boolean; domain?: string }> {
    const domain = this.extractDomainFromEmail(email);
    
    if (!domain) {
      return { isValid: false };
    }

    const isAllowed = await this.allowedDomainRepository.isDomainAllowed(domain);
    
    return {
      isValid: isAllowed,
      domain
    };
  }

  async bulkCreateDomains(domains: string[]) {
    // Validate all domains
    const invalidDomains = domains.filter(domain => !this.isValidDomain(domain));
    if (invalidDomains.length > 0) {
      throw new AppError(400, `Invalid domains: ${invalidDomains.join(', ')}`);
    }

    // Check for duplicates
    const existingDomains = await Promise.all(
      domains.map(domain => this.allowedDomainRepository.findDomainByDomain(domain))
    );
    
    const duplicates = domains.filter((domain, index) => 
      existingDomains[index] !== null
    );
    
    if (duplicates.length > 0) {
      throw new AppError(400, `Domains already exist: ${duplicates.join(', ')}`);
    }

    return await this.allowedDomainRepository.bulkCreateDomains(domains);
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }

  private extractDomainFromEmail(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
  }
}