import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { SchedulerService } from "../scheduler/scheduler.service";
import { makeLogsService } from "../logs/logs.factory";

export class SchedulerController {
  private logsService = makeLogsService();
  private schedulerService = new SchedulerService();

  processHeldFunds = asyncHandler(async (req: Request, res: Response) => {
    const results = await this.schedulerService.processHeldFunds();
    
    sendResponse(res, 200, {
      data: {
        processedCount: results.length,
        transactions: results
      },
      message: "Held funds processed successfully"
    });

    this.logsService.info("Manual trigger: Processed held funds", {
      processedCount: results.length,
      triggeredBy: req.user?.id || 'anonymous'
    });
  });

  processPendingWithdrawals = asyncHandler(async (req: Request, res: Response) => {
    const results = await this.schedulerService.processPendingWithdrawals();
    
    sendResponse(res, 200, {
      data: {
        pendingCount: results.length,
        withdrawals: results
      },
      message: "Pending withdrawals processed successfully"
    });

    this.logsService.info("Manual trigger: Processed pending withdrawals", {
      pendingCount: results.length,
      triggeredBy: req.user?.id || 'anonymous'
    });
  });

  runAllScheduledJobs = asyncHandler(async (req: Request, res: Response) => {
    const results = await this.schedulerService.runAllScheduledJobs();
    
    sendResponse(res, 200, {
      data: results,
      message: "All scheduled jobs completed"
    });

    this.logsService.info("Manual trigger: All scheduled jobs completed", {
      results,
      triggeredBy: req.user?.id || 'anonymous'
    });
  });
}