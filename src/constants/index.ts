// Application Constants

import type { StorageKeys } from '../types';

// Liquidation Thresholds
export const LIQUIDATION_THRESHOLDS = {
  LIGHTNING_LIQUIDATION: 80, // 80% LTV triggers Lightning wallet liquidation
  LOAN_LIQUIDATION: 90,      // 90% LTV triggers full loan liquidation
  WARNING: 65,               // 65% LTV shows warning
} as const;

// Bitcoin Price Configuration
export const PRICE_CONFIG = {
  INITIAL_PRICE: 100000,     // $100k starting price
  MIN_PRICE: 20000,          // $20k minimum
  MAX_PRICE: 140000,         // $140k maximum
  UPDATE_INTERVAL: 10000,    // 10 seconds
  MAX_VOLATILITY: 6000,      // ±$3k price swings
} as const;

// Default Amounts (in satoshis)
export const DEFAULT_AMOUNTS = {
  LOAN_PRINCIPAL: 30000,        // $30k USD
  COLLATERAL_BTC: 1.5,          // 1.5 BTC
  TOPUP_AMOUNT: 500000,         // 500k sats default topup
  VOLTAGE_RESERVE: 7,           // Minimum sats to keep in Voltage wallet
} as const;

// Storage Keys
export const STORAGE_KEYS: StorageKeys = {
  WALLET_SETUP: 'loan_ltv_wallet_setup',
  WALLET_CONFIG: 'loan_ltv_wallet_config',
  TRANSACTIONS: 'loan_ltv_transactions',
  LOAN_STATE: 'loan_ltv_loan_state',
  VOLTAGE_USER_WALLET: 'voltage_user_wallet',
  VOLTAGE_USER_ID: 'voltage_user_id',
};

// API Configuration
export const API_CONFIG = {
  VOLTAGE_BASE_URL: '/api/voltage',
  MOCK_DELAY: {
    LOAN_DETAILS: 300,
    TRANSACTION_HISTORY: 200,
    INVOICE_GENERATION: 500,
    PAYMENT_CONFIRMATION: 1000,
    PRICE_FETCH: 100,
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  POLLING_INTERVAL: 3000,       // 3 seconds for payment polling
  MAX_POLL_ATTEMPTS: 100,       // Maximum polling attempts
  INVOICE_EXPIRY: 3600,         // 1 hour invoice expiry
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  INITIAL_DEPOSIT: 'initial_deposit',
  LIGHTNING_TOPUP: 'lightning_topup',
  AUTO_LIQUIDATION: 'auto_liquidation',
} as const;

// Wallet Types
export const WALLET_TYPES = {
  SELF_CUSTODIAL: 'self-custodial',
  CUSTODIAL: 'custodial',
} as const;

// Self-Custodial Methods
export const SELF_CUSTODIAL_METHODS = {
  NWC: 'nwc',
  LNURLW: 'lnurlw',
} as const;

// Type exports for use in other files
export type LiquidationThreshold = typeof LIQUIDATION_THRESHOLDS[keyof typeof LIQUIDATION_THRESHOLDS];
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type WalletType = typeof WALLET_TYPES[keyof typeof WALLET_TYPES];
export type SelfCustodialMethod = typeof SELF_CUSTODIAL_METHODS[keyof typeof SELF_CUSTODIAL_METHODS]; 