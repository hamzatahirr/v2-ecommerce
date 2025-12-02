/**
 * JAZZCASH PAYMENT GATEWAY INTEGRATION
 * ====================================
 *
 * This file handles JazzCash payment gateway integration for the ecommerce platform.
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - JAZZCASH_API_KEY: Your JazzCash API key
 * - JAZZCASH_SECRET: Your JazzCash secret
 * - JAZZCASH_MERCHANT_ID: Your JazzCash merchant ID
 * - JAZZCASH_RETURN_URL: Return URL for successful payments
 * - JAZZCASH_CANCEL_URL: Return URL for cancelled payments
 * - JAZZCASH_TEST_MODE: Set to 'true' for sandbox testing
 * - PAYMENT_BYPASS: Set to 'true' to show payment options but skip actual processing
 */

import crypto from 'crypto';
import axios from 'axios';

interface JazzCashPaymentRequest {
  pp_MerchantID: string;
  pp_Password: string;
  pp_TxnType: string;
  pp_TxnRefNo: string;
  pp_Amount: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_Language: string;
  pp_Version: string;
  pp_ReturnURL: string;
  pp_SecureHash: string;
}

interface JazzCashPaymentResponse {
  pp_ResponseCode: string;
  pp_ResponseMessage: string;
  pp_TxnRefNo: string;
  pp_BillReference?: string;
  pp_SecureHash?: string;
}

class JazzCashService {
  private apiKey: string;
  private secret: string;
  private merchantId: string;
  private returnUrl: string;
  private cancelUrl: string;
  private testMode: boolean;
  private bypassMode: boolean;

  constructor() {
    this.apiKey = process.env.JAZZCASH_API_KEY || '';
    this.secret = process.env.JAZZCASH_SECRET || '';
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID || '';
    this.returnUrl = process.env.JAZZCASH_RETURN_URL || '';
    this.cancelUrl = process.env.JAZZCASH_CANCEL_URL || '';
    this.testMode = process.env.JAZZCASH_TEST_MODE === 'true';
    this.bypassMode = process.env.PAYMENT_BYPASS === 'true';

    if (!this.bypassMode && !this.testMode && (!this.apiKey || !this.secret || !this.merchantId)) {
      throw new Error('JazzCash configuration incomplete. Please check environment variables.');
    }

    if (this.bypassMode) {
      console.log('⚠️  [JAZZCASH] PAYMENT BYPASS MODE ENABLED - Payments will be mocked');
    } else if (this.testMode) {
      console.log('⚠️  [JAZZCASH] TEST MODE ENABLED - Using sandbox environment');
    } else {
      console.log('✅ [JAZZCASH] PRODUCTION MODE ENABLED');
    }
  }

  /**
   * Generate secure hash for JazzCash request
   */
  private generateSecureHash(data: Record<string, string>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    // Create hash string
    let hashString = '';
    for (const key of sortedKeys) {
      if (data[key] && key !== 'pp_SecureHash') {
        hashString += data[key];
      }
    }

    // Add secret at the end
    hashString += this.secret;

    // Generate SHA256 hash
    return crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
  }

  /**
   * Verify secure hash from JazzCash response
   */
  private verifySecureHash(data: Record<string, string>, receivedHash: string): boolean {
    const calculatedHash = this.generateSecureHash(data);
    return calculatedHash === receivedHash;
  }

  /**
   * Create payment request for JazzCash
   */
  async createPaymentRequest(orderData: {
    txnRefNo: string;
    amount: number;
    currency: string;
    billReference: string;
    description: string;
    customerInfo?: {
      email?: string;
      phone?: string;
      name?: string;
    };
  }): Promise<{ paymentUrl: string; requestData: JazzCashPaymentRequest } | { mockResponse: any }> {

    if (this.bypassMode) {
      // PAYMENT BYPASS MODE: Return mock data
      console.log('[JAZZCASH BYPASS] Creating mock payment request');

      return {
        mockResponse: {
          pp_TxnRefNo: orderData.txnRefNo,
          pp_ResponseCode: '000',
          pp_ResponseMessage: 'Payment Successful (BYPASS MODE)',
          status: 'completed',
          amount: orderData.amount,
          currency: orderData.currency
        }
      };
    }

    const txnDateTime = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');

    const requestData: JazzCashPaymentRequest = {
      pp_MerchantID: this.merchantId,
      pp_Password: this.apiKey,
      pp_TxnType: 'MWALLET',
      pp_TxnRefNo: orderData.txnRefNo,
      pp_Amount: Math.round(orderData.amount * 100).toString(), // Amount in paisas
      pp_TxnCurrency: orderData.currency,
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: orderData.billReference,
      pp_Description: orderData.description,
      pp_Language: 'EN',
      pp_Version: '1.1',
      pp_ReturnURL: this.returnUrl,
      pp_SecureHash: '' // Will be calculated
    };

    // Generate secure hash
    requestData.pp_SecureHash = this.generateSecureHash(requestData);

    // Determine payment URL based on environment
    const baseUrl = this.testMode
      ? 'https://sandbox.jazzcash.com.pk'
      : 'https://api.jazzcash.com.pk';

    const paymentUrl = `${baseUrl}/ApplicationAPI/Pay.aspx`;

    return {
      paymentUrl,
      requestData
    };
  }

  /**
   * Process JazzCash callback/response
   */
  async processPaymentCallback(callbackData: Record<string, string>): Promise<{
    isValid: boolean;
    status: 'completed' | 'failed' | 'pending';
    txnRefNo: string;
    amount: number;
    responseCode: string;
    responseMessage: string;
  }> {

    if (this.bypassMode) {
      // PAYMENT BYPASS MODE: Always return success
      console.log('[JAZZCASH BYPASS] Processing mock payment callback');

      return {
        isValid: true,
        status: 'completed',
        txnRefNo: callbackData.pp_TxnRefNo || '',
        amount: parseFloat(callbackData.pp_Amount || '0') / 100,
        responseCode: '000',
        responseMessage: 'Payment Successful (BYPASS MODE)'
      };
    }

    // Verify secure hash
    const receivedHash = callbackData.pp_SecureHash;
    const isValid = receivedHash && this.verifySecureHash(callbackData, receivedHash);

    if (!isValid && !this.testMode) {
      return {
        isValid: false,
        status: 'failed',
        txnRefNo: callbackData.pp_TxnRefNo || '',
        amount: 0,
        responseCode: '999',
        responseMessage: 'Invalid secure hash'
      };
    }

    // Parse response
    const responseCode = callbackData.pp_ResponseCode || '';
    const txnRefNo = callbackData.pp_TxnRefNo || '';
    const amount = parseFloat(callbackData.pp_Amount || '0') / 100; // Convert from paisas

    let status: 'completed' | 'failed' | 'pending' = 'pending';
    let responseMessage = callbackData.pp_ResponseMessage || 'Unknown response';

    // JazzCash response codes
    // 000 = Success
    // 101 = Transaction declined
    // 102 = Insufficient funds
    // 103 = Invalid merchant
    // 104 = Invalid amount
    // 105 = Invalid transaction reference
    // 106 = Transaction already processed
    // 107 = Transaction timeout

    switch (responseCode) {
      case '000':
        status = 'completed';
        responseMessage = responseMessage || 'Payment successful';
        break;
      case '101':
      case '102':
      case '103':
      case '104':
      case '105':
        status = 'failed';
        responseMessage = responseMessage || 'Payment failed';
        break;
      case '106':
        status = 'completed'; // Already processed, treat as success
        responseMessage = responseMessage || 'Transaction already processed';
        break;
      case '107':
        status = 'failed';
        responseMessage = responseMessage || 'Transaction timeout';
        break;
      default:
        status = 'pending';
        responseMessage = responseMessage || 'Payment status unknown';
    }

    return {
      isValid: true,
      status,
      txnRefNo,
      amount,
      responseCode,
      responseMessage
    };
  }

  /**
   * Check payment status (for reconciliation)
   */
  async checkPaymentStatus(txnRefNo: string): Promise<{
    status: 'completed' | 'failed' | 'pending';
    amount?: number;
    responseCode?: string;
    responseMessage?: string;
  }> {

    if (this.bypassMode) {
      // PAYMENT BYPASS MODE: Return success
      return {
        status: 'completed',
        amount: 0,
        responseCode: '000',
        responseMessage: 'Payment verified (BYPASS MODE)'
      };
    }

    try {
      // In a real implementation, you would call JazzCash's inquiry API
      // For now, return pending status
      return {
        status: 'pending',
        responseMessage: 'Status check not implemented'
      };
    } catch (error) {
      console.error('JazzCash status check failed:', error);
      return {
        status: 'pending',
        responseMessage: 'Unable to check payment status'
      };
    }
  }

  /**
   * Process payout to seller (if supported by JazzCash)
   */
  async processPayout(payoutData: {
    amount: number;
    currency: string;
    recipientAccount: string;
    recipientName: string;
    description: string;
  }): Promise<{
    success: boolean;
    payoutId?: string;
    error?: string;
  }> {

    if (this.bypassMode) {
      // PAYMENT BYPASS MODE: Mock successful payout
      console.log('[JAZZCASH BYPASS] Processing mock payout');

      return {
        success: true,
        payoutId: `payout_mock_${Date.now()}`,
      };
    }

    // JazzCash may not support direct payouts to sellers
    // This would need to be implemented based on their payout API
    // For now, return not implemented
    return {
      success: false,
      error: 'Payout functionality not implemented for JazzCash'
    };
  }
}

// Export singleton instance
const jazzCashService = new JazzCashService();
export default jazzCashService;
