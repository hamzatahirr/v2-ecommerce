import { Router } from "express";
import protect from "@/shared/middlewares/protect";
import { authorizeRole } from "@/shared/middlewares/authorizeRole";
import { makeSchedulerController } from "./scheduler.factory";

const router = Router();
const schedulerController = makeSchedulerController();

// All scheduler routes require admin role
router.use(protect);
router.use(authorizeRole("ADMIN"));

router.post("/process-held-funds", schedulerController.processHeldFunds);
router.post("/process-pending-withdrawals", schedulerController.processPendingWithdrawals);
router.post("/run-all-jobs", schedulerController.runAllScheduledJobs);

export { router as schedulerRoutes };