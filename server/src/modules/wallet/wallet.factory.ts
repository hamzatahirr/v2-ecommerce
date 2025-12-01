import { WalletService } from "./wallet.service";
import { WalletRepository } from "./wallet.repository";
import { CommissionService } from "../commission/commission.service";
import { makeCommissionService } from "../commission/commission.factory";

export const makeWalletService = () => {
  const walletRepository = new WalletRepository();
  const commissionService = makeCommissionService();
  return new WalletService(walletRepository, commissionService);
};

export { WalletService, WalletRepository };