import { AllowedDomainController } from "./allowed-domains.controller";
import { makeAllowedDomainService } from "./allowed-domains.factory";

export const makeAllowedDomainController = () => {
  const allowedDomainService = makeAllowedDomainService();
  return new AllowedDomainController(allowedDomainService);
};

export { AllowedDomainController };