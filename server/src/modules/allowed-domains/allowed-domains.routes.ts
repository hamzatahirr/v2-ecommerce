import { Router } from "express";
import protect from "@/shared/middlewares/protect";
import { authorizeRole } from "@/shared/middlewares/authorizeRole";
import { makeAllowedDomainController } from "./allowed-domains.controller.factory";

const router = Router();
const allowedDomainController = makeAllowedDomainController();

// All allowed domain routes require authentication and admin role
router.use(protect);
router.use(authorizeRole("ADMIN"));

// Domain CRUD
router.post("/", allowedDomainController.createDomain);
router.get("/", allowedDomainController.getAllDomains);
router.get("/active", allowedDomainController.getActiveDomains);
router.get("/:id", allowedDomainController.getDomainById);
router.put("/:id", allowedDomainController.updateDomain);
router.delete("/:id", allowedDomainController.deleteDomain);
router.put("/:id/toggle", allowedDomainController.toggleDomainStatus);
router.post("/bulk", allowedDomainController.bulkCreateDomains);

// Email validation
router.post("/validate-email", allowedDomainController.validateUserEmail);

export { router as allowedDomainsRoutes };