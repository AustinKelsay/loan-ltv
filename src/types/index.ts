// TypeScript type declarations for the application

export interface Logger {
  logInfo?: (message: string, data?: any) => void;
  logSuccess?: (message: string, data?: any) => void;
  logError?: (message: string, data?: any) => void;
  logWarning?: (message: string, data?: any) => void;
  logWallet?: (message: string, data?: any) => void;
  logDebug?: (message: string, data?: any) => void;
  logPayment?: (message: string, data?: any) => void;
  logLiquidation?: (message: string, data?: any) => void;
}

export interface WalletData {
  id: string;
  name: string;
  organization_id: string;
  environment_id: string;
  network: string;
  created_at: string;
  balance?: number;
  limit?: number;
  balanceSats?: number;
}

// Loan and Transaction Types
export interface LoanCollateral {
  amountSats: number;
  currency: string;
}

export interface Loan {
  loanId: string;
  userId: string;
  principal: number;
  currency: string;
  collateral: LoanCollateral;
  liquidationThreshold: number;
  warningThreshold: number;
  interestRate: number;
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'initial_deposit' | 'lightning_topup' | 'auto_liquidation';
  amountSats: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  paymentHash?: string;
  targetAddress?: string;
  ltvAtLiquidation?: number;
}

// Mock API Response Types
export interface MockInvoiceResponse {
  invoice: string;
  amountSats: number;
  expiry: number;
  paymentHash: string;
  createdAt: string;
}

export interface MockPaymentConfirmation {
  success: boolean;
  paymentHash: string;
  preimage: string;
  settledAt: string;
}

// Loan Calculation Types
export interface LoanMetrics {
  totalCollateralSats: number;
  totalCollateralValueUSD: number;
  mainCollateralValueUSD: number;
  lightningCollateralValueUSD: number;
  lightningWalletSats: number;
  ltv: number;
  ltvStatus: 'healthy' | 'warning' | 'critical' | 'liquidated';
  gameStatus: 'safe' | 'lightning_zone' | 'loan_liquidated';
  lightningLiquidationThreshold: number;
  loanLiquidationThreshold: number;
  requiredTopupSats: number;
}

// Price Feed Types
export interface PriceFeedData {
  price: number;
  priceChange: number;
  setPrice: (price: number) => void;
}

// Wallet Setup Types
export interface WalletConfig {
  type: 'custodial' | 'self-custodial';
  method?: 'nwc' | 'lnurlw';
  connectionString?: string;
  withdrawUrl?: string;
  wallet?: WalletData;
}

export interface WalletSetupState {
  walletSetup: boolean;
  walletType: 'custodial' | 'self-custodial' | null;
  selfCustodialType: 'nwc' | 'lnurlw' | null;
  walletConfig: WalletConfig | null;
  nwcString: string;
  lnurlwString: string;
}

// Storage Keys Interface
export interface StorageKeys {
  WALLET_SETUP: string;
  WALLET_CONFIG: string;
  TRANSACTIONS: string;
  LOAN_STATE: string;
  VOLTAGE_USER_WALLET: string;
  VOLTAGE_USER_ID: string;
}

// Allow any for backward compatibility during migration
export type ApiRequestOptions = any;
export type VoltageApiResponse = any;

// Utility types
export type AnyFunction = (...args: any[]) => any;
export type AnyObject = Record<string, any>; 