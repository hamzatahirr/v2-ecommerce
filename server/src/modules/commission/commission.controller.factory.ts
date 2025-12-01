import { CommissionController } from "./commission.controller";
import { makeCommissionService } from "./commission.factory";

export const makeCommissionController = () => {
  const commissionService = makeCommissionService();
  return new CommissionController(commissionService);
};

export { CommissionController };