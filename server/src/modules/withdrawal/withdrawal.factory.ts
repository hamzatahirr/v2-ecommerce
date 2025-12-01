import { WithdrawalService } from "./withdrawal.service";
import { WithdrawalRepository } from "./withdrawal.repository";
import { makeWalletService } from "../wallet/wallet.factory";

export const makeWithdrawalService = () => {
  const withdrawalRepository = new WithdrawalRepository();
  const walletService = makeWalletService();
  return new WithdrawalService(withdrawalRepository, walletService);
};

export { WithdrawalService, WithdrawalRepository };