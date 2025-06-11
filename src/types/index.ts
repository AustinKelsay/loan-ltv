// TypeScript type declarations for the application

export interface Logger {
  logInfo?: (message: string, data?: any) => void;
  logSuccess?: (message: string, data?: any) => void;
  logError?: (message: string, data?: any) => void;
  logWarning?: (message: string, data?: any) => void;
  logWallet?: (message: string, data?: any) => void;
  logDebug?: (message: string, data?: any) => void;
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
}

// Allow any for now to avoid complex typing during migration
export type ApiRequestOptions = any;
export type VoltageApiResponse = any;

// Utility types for migration
export type AnyFunction = (...args: any[]) => any;
export type AnyObject = Record<string, any>; 