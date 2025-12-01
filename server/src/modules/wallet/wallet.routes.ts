import { Router } from "express";
import protect from "@/shared/middlewares/protect";
import { authorizeRole } from "@/shared/middlewares/authorizeRole";
import { makeWalletController } from "./wallet.controller.factory";

const router = Router();
const walletController = makeWalletController();

// All wallet routes require authentication
router.use(protect);

// Seller routes
router.get("/my-wallet", walletController.getSellerWallet);
router.get("/my-wallet/balance", walletController.getWalletBalance);
router.get("/my-wallet/transactions", walletController.getWalletTransactions);

// Admin routes
router.get("/all", authorizeRole("ADMIN"), walletController.getAllWallets);

export { router as walletRoutes };