import { STORAGE_KEYS } from '../constants';
import type { Logger, Loan, Transaction, WalletSetupState, WalletData } from '../types';

/**
 * Centralized localStorage service
 * Handles all storage operations with error handling and logging
 */
class StorageService {
  private logger: Logger | null;

  constructor(logger: Logger | null = null) {
    this.logger = logger;
  }

  private log(level: string, message: string, data?: any): void {
    if (this.logger) {
      const methodName = `log${level.charAt(0).toUpperCase() + level.slice(1)}` as keyof Logger;
      const logMethod = this.logger[methodName];
      if (logMethod && typeof logMethod === 'function') {
        (logMethod as (message: string, data?: any) => void)(message, data);
      }
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  /**
   * Generic save to localStorage
   */
  save(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.log('debug', `💾 Saved ${key} to localStorage`);
      return true;
    } catch (error) {
      this.log('error', `Failed to save ${key} to localStorage`, (error as Error).message);
      return false;
    }
  }

  /**
   * Generic load from localStorage
   */
  load<T = any>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as T;
        this.log('debug', `📖 Loaded ${key} from localStorage`);
        return parsed;
      }
      return null;
    } catch (error) {
      this.log('error', `Failed to load ${key} from localStorage`, (error as Error).message);
      return null;
    }
  }

  /**
   * Generic remove from localStorage
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      this.log('debug', `🗑️ Removed ${key} from localStorage`);
      return true;
    } catch (error) {
      this.log('error', `Failed to remove ${key} from localStorage`, (error as Error).message);
      return false;
    }
  }

  // Wallet-specific methods
  saveWalletSetup(walletSetup: WalletSetupState): boolean {
    return this.save(STORAGE_KEYS.WALLET_SETUP, walletSetup);
  }

  loadWalletSetup(): WalletSetupState | null {
    return this.load<WalletSetupState>(STORAGE_KEYS.WALLET_SETUP);
  }

  clearWalletSetup(): boolean {
    return this.remove(STORAGE_KEYS.WALLET_SETUP);
  }

  // Transaction-specific methods
  saveTransactions(transactions: Transaction[]): boolean {
    return this.save(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  loadTransactions(): Transaction[] | null {
    return this.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
  }

  clearTransactions(): boolean {
    return this.remove(STORAGE_KEYS.TRANSACTIONS);
  }

  // Loan state methods
  saveLoanState(loanState: Loan): boolean {
    return this.save(STORAGE_KEYS.LOAN_STATE, loanState);
  }

  loadLoanState(): Loan | null {
    return this.load<Loan>(STORAGE_KEYS.LOAN_STATE);
  }

  clearLoanState(): boolean {
    return this.remove(STORAGE_KEYS.LOAN_STATE);
  }

  // Voltage wallet methods
  saveVoltageWallet(wallet: WalletData): boolean {
    return this.save(STORAGE_KEYS.VOLTAGE_USER_WALLET, wallet);
  }

  loadVoltageWallet(): WalletData | null {
    return this.load<WalletData>(STORAGE_KEYS.VOLTAGE_USER_WALLET);
  }

  clearVoltageWallet(): boolean {
    return this.remove(STORAGE_KEYS.VOLTAGE_USER_WALLET);
  }

  saveVoltageUserId(userId: string): boolean {
    return this.save(STORAGE_KEYS.VOLTAGE_USER_ID, userId);
  }

  loadVoltageUserId(): string | null {
    return this.load<string>(STORAGE_KEYS.VOLTAGE_USER_ID);
  }

  clearVoltageUserId(): boolean {
    return this.remove(STORAGE_KEYS.VOLTAGE_USER_ID);
  }

  /**
   * Clear all application data
   */
  clearAll(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      this.log('warning', '🗑️ All application data cleared from localStorage');
      return true;
    } catch (error) {
      this.log('error', 'Failed to clear all data from localStorage', (error as Error).message);
      return false;
    }
  }

  /**
   * Get all stored data for debugging
   */
  getAll(): Record<string, any> {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.load(key);
    });
    return data;
  }
}

export default StorageService; 