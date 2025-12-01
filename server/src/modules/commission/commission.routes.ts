import { Router } from "express";
import protect from "@/shared/middlewares/protect";
import { authorizeRole } from "@/shared/middlewares/authorizeRole";
import { makeCommissionController } from "./commission.controller.factory";

const router = Router();
const commissionController = makeCommissionController();

// All commission routes require authentication and admin role
router.use(protect);
router.use(authorizeRole("ADMIN"));

// Commission CRUD
router.post("/", commissionController.createCommission);
router.get("/", commissionController.getAllCommissions);
router.get("/stats", commissionController.getCommissionStats);
router.get("/default-rate", commissionController.getDefaultCommissionRate);
router.put("/default-rate", commissionController.setDefaultCommissionRate);
router.get("/categories/without", commissionController.getCategoriesWithoutCommission);
router.get("/categories/with", commissionController.getCategoriesWithCommission);
router.post("/bulk", commissionController.bulkCreateCommissions);

// Commission by ID
router.get("/id/:id", commissionController.getCommissionById);

// Commission by Category
router.get("/category/:categoryId", commissionController.getCommissionByCategory);
router.put("/category/:categoryId", commissionController.updateCommission);
router.delete("/category/:categoryId", commissionController.deleteCommission);

// Commission calculation
router.get("/calculate/order/:orderId", commissionController.calculateOrderCommission);
router.get("/calculate/product/:productId", commissionController.calculateProductCommission);

export { router as commissionRoutes };