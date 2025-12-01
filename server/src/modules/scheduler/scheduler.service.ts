import { makeWalletService } from "../wallet/wallet.factory";
import { makeWithdrawalService } from "../withdrawal/withdrawal.factory";
import { makeLogsService } from "../logs/logs.factory";

export class SchedulerService {
  private walletService = makeWalletService();
  private withdrawalService = makeWithdrawalService();
  private logsService = makeLogsService();

  async processHeldFunds() {
    try {
      const releasedTransactions = await this.walletService.processHeldFunds();
      
      this.logsService.info("Scheduled job: Processed held funds", {
        releasedCount: releasedTransactions.length,
        releasedTransactions: releasedTransactions.map(t => t.id)
      });

      return releasedTransactions;
    } catch (error) {
      this.logsService.error("Scheduled job: Failed to process held funds", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async processPendingWithdrawals() {
    try {
      const pendingWithdrawals = await this.withdrawalService.getPendingWithdrawals();
      
      this.logsService.info("Scheduled job: Processing pending withdrawals", {
        pendingCount: pendingWithdrawals.length
      });

      // In a real implementation, you might automatically process some withdrawals
      // For now, we'll just log them
      
      return pendingWithdrawals;
    } catch (error) {
      this.logsService.error("Scheduled job: Failed to process pending withdrawals", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async runAllScheduledJobs() {
    const results = {
      heldFundsProcessed: 0,
      pendingWithdrawalsProcessed: 0,
      errors: [] as string[]
    };

    try {
      const heldFundsResult = await this.processHeldFunds();
      results.heldFundsProcessed = heldFundsResult.length;
    } catch (error) {
      results.errors.push(`Held funds processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const withdrawalsResult = await this.processPendingWithdrawals();
      results.pendingWithdrawalsProcessed = withdrawalsResult.length;
    } catch (error) {
      results.errors.push(`Pending withdrawals processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.logsService.info("Scheduled jobs completed", results);

    return results;
  }
}