import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { AllowedDomainService } from "./allowed-domains.service";
import { makeLogsService } from "../logs/logs.factory";
import { validateZodSchema } from "@/shared/utils/validateZodSchema";
import { createDomainSchema, updateDomainSchema, bulkCreateDomainsSchema } from "./allowed-domains.dto";

export class AllowedDomainController {
  private logsService = makeLogsService();
  private allowedDomainService;

  constructor(allowedDomainService: AllowedDomainService) {
    this.allowedDomainService = allowedDomainService;
  }

  createDomain = asyncHandler(async (req: Request, res: Response) => {
    const validationResult = await validateZodSchema(createDomainSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }

    const { domain } = validationResult.validData!;
    const result = await this.allowedDomainService.createDomain(domain);
    
    sendResponse(res, 201, {
      data: result,
      message: "Domain created successfully"
    });

    this.logsService.info("Admin created allowed domain", {
      adminId: req.user?.id,
      domain,
      domainId: result.id
    });
  });

  getAllDomains = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.allowedDomainService.getAllDomains(page, limit);
    
    sendResponse(res, 200, {
      data: result,
      message: "Domains retrieved successfully"
    });
  });

  getActiveDomains = asyncHandler(async (req: Request, res: Response) => {
    const domains = await this.allowedDomainService.getActiveDomains();
    
    sendResponse(res, 200, {
      data: domains,
      message: "Active domains retrieved successfully"
    });
  });

  getDomainById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const domain = await this.allowedDomainService.getDomainById(id);
    
    sendResponse(res, 200, {
      data: domain,
      message: "Domain retrieved successfully"
    });
  });

  updateDomain = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validationResult = await validateZodSchema(updateDomainSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }

    const updateData = validationResult.validData!;
    const result = await this.allowedDomainService.updateDomain(id, updateData);
    
    sendResponse(res, 200, {
      data: result,
      message: "Domain updated successfully"
    });

    this.logsService.info("Admin updated allowed domain", {
      adminId: req.user?.id,
      domainId: id,
      updateData
    });
  });

  deleteDomain = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.allowedDomainService.deleteDomain(id);
    
    sendResponse(res, 200, {
      data: result,
      message: "Domain deleted successfully"
    });

    this.logsService.info("Admin deleted allowed domain", {
      adminId: req.user?.id,
      domainId: id,
      deletedDomain: result.domain
    });
  });

  toggleDomainStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.allowedDomainService.toggleDomainStatus(id);
    
    sendResponse(res, 200, {
      data: result,
      message: `Domain ${result.isActive ? 'activated' : 'deactivated'} successfully`
    });

    this.logsService.info("Admin toggled domain status", {
      adminId: req.user?.id,
      domainId: id,
      newStatus: result.isActive
    });
  });

  bulkCreateDomains = asyncHandler(async (req: Request, res: Response) => {
    const validationResult = await validateZodSchema(bulkCreateDomainsSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }

    const { domains } = validationResult.validData!;
    const result = await this.allowedDomainService.bulkCreateDomains(domains);
    
    sendResponse(res, 201, {
      data: result,
      message: "Domains created successfully"
    });

    this.logsService.info("Admin bulk created allowed domains", {
      adminId: req.user?.id,
      count: domains.length,
      createdCount: result.length
    });
  });

  validateUserEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const result = await this.allowedDomainService.validateUserEmail(email);
    
    sendResponse(res, 200, {
      data: result,
      message: "Email validation completed"
    });
  });
}