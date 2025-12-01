import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { CommissionService } from "./commission.service";
import { makeCommissionService } from "./commission.factory";
import { makeLogsService } from "../logs/logs.factory";
import { validateZodSchema } from "@/shared/utils/validateZodSchema";
import { 
  createCommissionSchema, 
  updateCommissionSchema, 
  bulkCreateCommissionsSchema, 
  setDefaultCommissionRateSchema 
} from "./commission.dto";

export class CommissionController {
  private logsService = makeLogsService();
  private commissionService;

  constructor(commissionService: any) {
    this.commissionService = commissionService;
  }

  createCommission = asyncHandler(async (req: Request, res: Response) => {
    const validationResult = await validateZodSchema(createCommissionSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { categoryId, rate, description } = validationResult.validData!;

    const commission = await this.commissionService.createCommission(
      categoryId,
      rate,
      description
    );
    
    sendResponse(res, 201, {
      data: commission,
      message: "Commission created successfully"
    });

    this.logsService.info("Admin created commission", {
      adminId: req.user?.id,
      categoryId,
      rate,
      commissionId: commission.id
    });
  });

  updateCommission = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const validationResult = await validateZodSchema(updateCommissionSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { rate, description } = validationResult.validData!;

    const commission = await this.commissionService.updateCommission(
      categoryId,
      rate,
      description
    );
    
    sendResponse(res, 200, {
      data: commission,
      message: "Commission updated successfully"
    });

    this.logsService.info("Admin updated commission", {
      adminId: req.user?.id,
      categoryId,
      rate,
      description,
      commissionId: commission.id
    });
  });

  deleteCommission = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const commission = await this.commissionService.deleteCommission(categoryId);
    
    sendResponse(res, 200, {
      data: commission,
      message: "Commission deleted successfully"
    });

    this.logsService.info("Admin deleted commission", {
      adminId: req.user?.id,
      categoryId,
      commissionId: commission.id
    });
  });

  getAllCommissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await this.commissionService.getAllCommissions(page, limit);
    
    sendResponse(res, 200, {
      data: result,
      message: "Commissions retrieved successfully"
    });
  });

  getCommissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const commission = await this.commissionService.getCommissionById(id);
    
    sendResponse(res, 200, {
      data: commission,
      message: "Commission retrieved successfully"
    });
  });

  getCommissionByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const commission = await this.commissionService.getCommissionByCategory(categoryId);
    
    sendResponse(res, 200, {
      data: commission,
      message: "Commission retrieved successfully"
    });
  });

  getCategoriesWithoutCommission = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.commissionService.getCategoriesWithoutCommission();
    
    sendResponse(res, 200, {
      data: categories,
      message: "Categories without commission retrieved successfully"
    });
  });

  getCategoriesWithCommission = asyncHandler(async (req: Request, res: Response) => {
    const commissions = await this.commissionService.getCategoriesWithCommission();
    
    sendResponse(res, 200, {
      data: commissions,
      message: "Categories with commission retrieved successfully"
    });
  });

  bulkCreateCommissions = asyncHandler(async (req: Request, res: Response) => {
    const validationResult = await validateZodSchema(bulkCreateCommissionsSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { commissions } = validationResult.validData!;

    const result = await this.commissionService.bulkCreateCommissions(commissions);
    
    sendResponse(res, 201, {
      data: result,
      message: "Bulk commissions created successfully"
    });

    this.logsService.info("Admin created bulk commissions", {
      adminId: req.user?.id,
      count: commissions.length,
      createdCount: result.length
    });
  });

  getCommissionStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.commissionService.getCommissionStats();
    
    sendResponse(res, 200, {
      data: stats,
      message: "Commission statistics retrieved successfully"
    });
  });

  getDefaultCommissionRate = asyncHandler(async (req: Request, res: Response) => {
    const rate = await this.commissionService.getDefaultCommissionRate();
    
    sendResponse(res, 200, {
      data: { rate },
      message: "Default commission rate retrieved successfully"
    });
  });

  setDefaultCommissionRate = asyncHandler(async (req: Request, res: Response) => {
    const validationResult = await validateZodSchema(setDefaultCommissionRateSchema, req.body);
    if (!validationResult.valid) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: validationResult.errors 
      });
      return;
    }
    const { rate } = validationResult.validData!;

    const result = await this.commissionService.setDefaultCommissionRate(rate);
    
    sendResponse(res, 200, {
      data: result,
      message: "Default commission rate updated successfully"
    });

    this.logsService.info("Admin updated default commission rate", {
      adminId: req.user?.id,
      rate
    });
  });

  calculateOrderCommission = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const commission = await this.commissionService.calculateOrderCommission(orderId);
    
    sendResponse(res, 200, {
      data: { orderId, commission },
      message: "Order commission calculated successfully"
    });
  });

  calculateProductCommission = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;

    const commission = await this.commissionService.calculateProductCommission(productId);
    
    sendResponse(res, 200, {
      data: { productId, commission },
      message: "Product commission calculated successfully"
    });
  });
}