import { WithdrawalController } from "./withdrawal.controller";
import { makeWithdrawalService } from "./withdrawal.factory";

export const makeWithdrawalController = () => {
  const withdrawalService = makeWithdrawalService();
  return new WithdrawalController(withdrawalService);
};

export { WithdrawalController };