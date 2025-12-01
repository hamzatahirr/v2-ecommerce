import { AllowedDomainService } from "./allowed-domains.service";
import { AllowedDomainRepository } from "./allowed-domains.repository";

export const makeAllowedDomainService = () => {
  const allowedDomainRepository = new AllowedDomainRepository();
  return new AllowedDomainService(allowedDomainRepository);
};

export { AllowedDomainService, AllowedDomainRepository };