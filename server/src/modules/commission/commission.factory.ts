import { CommissionService } from "./commission.service";
import { CommissionRepository } from "./commission.repository";

export const makeCommissionService = () => {
  const commissionRepository = new CommissionRepository();
  return new CommissionService(commissionRepository);
};

export { CommissionService, CommissionRepository };