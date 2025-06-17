import { btcToSats } from '../utils/bitcoinUnits';
import { API_CONFIG } from '../constants';
import type { Loan, Transaction, MockInvoiceResponse, MockPaymentConfirmation } from '../types';

/**
 * Mock API for loan operations
 * In production, these would be real API calls to your backend
 * All amounts are handled in satoshis
 */
export const mockAPI = {
  /**
   * Fetches loan details for a given loan ID
   */
  getLoanDetails: async (loanId?: string): Promise<Loan> => {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY.LOAN_DETAILS));
    
    return {
      loanId: loanId || "LOAN-001",
      userId: "user123",
      principal: 50000, // $50,000 USD
      currency: "USDC",
      collateral: {
        amountSats: btcToSats(1.5), // 1.5 BTC in sats (150,000,000 sats)
        currency: "BTC"
      },
      liquidationThreshold: 85, // 85% LTV triggers liquidation
      warningThreshold: 70, // 70% LTV shows warning
      interestRate: 8.5,
      status: "active",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    };
  },
  
  /**
   * Fetches transaction history for a loan
   * Returns only the initial Bitcoin deposit by default
   */
  getTransactionHistory: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY.TRANSACTION_HISTORY));
    
    return [
      {
        id: "tx-001",
        type: "initial_deposit",
        amountSats: btcToSats(1.5), // 1.5 BTC initial deposit
        currency: "BTC",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      }
    ];
  },
  
  /**
   * Generates a mock Lightning invoice (used for self-custodial wallets in demo)
   */
  generateLightningInvoice: async (loanId: string, amountSats: number): Promise<MockInvoiceResponse> => {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY.INVOICE_GENERATION));
    
    const invoice = `lnbc${amountSats}n1pv${Math.random().toString(36).substring(7)}...`;
    
    return {
      invoice,
      amountSats,
      expiry: 3600,
      paymentHash: `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
  },
  
  /**
   * Confirms a mock payment (used for self-custodial demo)
   */
  confirmPayment: async (loanId: string, paymentHash: string): Promise<MockPaymentConfirmation> => {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY.PAYMENT_CONFIRMATION));
    
    return {
      success: true,
      paymentHash,
      preimage: `preimage_${Math.random().toString(36).substring(7)}`,
      settledAt: new Date().toISOString()
    };
  },
  
  /**
   * Gets current BTC price (mock)
   */
  getCurrentBTCPrice: async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY.PRICE_FETCH));
    return 300000;
  }
}; 