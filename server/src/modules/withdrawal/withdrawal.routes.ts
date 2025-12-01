import { Router } from "express";
import protect from "@/shared/middlewares/protect";
import { authorizeRole } from "@/shared/middlewares/authorizeRole";
import { makeWithdrawalController } from "./withdrawal.controller.factory";

const router = Router();
const withdrawalController = makeWithdrawalController();

// All withdrawal routes require authentication
router.use(protect);

// Seller routes
router.post("/request", withdrawalController.requestWithdrawal);
router.get("/my-withdrawals", withdrawalController.getSellerWithdrawals);
router.get("/my-withdrawals/stats", withdrawalController.getSellerWithdrawalStats);
router.get("/:withdrawalId", withdrawalController.getWithdrawalDetails);

// Admin routes
router.get("/all", authorizeRole("ADMIN"), withdrawalController.getAllWithdrawals);
router.get("/stats/all", authorizeRole("ADMIN"), withdrawalController.getWithdrawalStats);
router.put("/:withdrawalId/approve", authorizeRole("ADMIN"), withdrawalController.approveWithdrawal);
router.put("/:withdrawalId/reject", authorizeRole("ADMIN"), withdrawalController.rejectWithdrawal);
router.put("/:withdrawalId/process", authorizeRole("ADMIN"), withdrawalController.processWithdrawal);
router.post("/:withdrawalId/process-dummy-payment", authorizeRole("ADMIN"), withdrawalController.processDummyPayment);

export { router as withdrawalRoutes };