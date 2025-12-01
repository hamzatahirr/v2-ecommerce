import { WalletController } from "./wallet.controller";
import { makeWalletService } from "./wallet.factory";

export const makeWalletController = () => {
  const walletService = makeWalletService();
  return new WalletController(walletService);
};

export { WalletController };