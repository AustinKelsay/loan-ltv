import { useState, useEffect, useCallback } from 'react';
import { btcToSats } from '../utils/bitcoinUnits';

// Local storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'loan_ltv_transactions',
  LOAN_STATE: 'loan_ltv_loan_state'
};

/**
 * Custom hook for managing transaction and loan state persistence
 * Handles saving/loading transactions and loan state to/from localStorage
 */
export const useTransactionStorage = (logger = null) => {
  const [transactions, setTransactions] = useState([]);
  const [loan, setLoan] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const log = (level, message, data) => {
    if (logger) {
      logger[`log${level.charAt(0).toUpperCase() + level.slice(1)}`]?.(message, data);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  };

  /**
   * Default initial loan state
   * Optimized for ~$100k BTC price: 1.5 BTC × $100k = $150k collateral, $30k loan = 20% LTV
   */
  const getDefaultLoan = () => ({
    loanId: "LOAN-001",
    userId: "user123",
    principal: 30000, // $30,000 USD
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
  });

  /**
   * Default initial transaction (initial Bitcoin deposit)
   */
  const getDefaultTransaction = () => ({
    id: "tx-001",
    type: "initial_deposit",
    amountSats: btcToSats(1.5), // 1.5 BTC initial deposit
    currency: "BTC",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed"
  });

  /**
   * Saves transactions to localStorage
   */
  const saveTransactions = useCallback((txs) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
      log('debug', '💾 Transactions saved to localStorage', `${txs.length} transactions`);
    } catch (error) {
      log('error', 'Failed to save transactions to localStorage', error.message);
    }
  }, []);

  /**
   * Saves loan state to localStorage
   */
  const saveLoan = useCallback((loanState) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOAN_STATE, JSON.stringify(loanState));
      log('debug', '💾 Loan state saved to localStorage');
    } catch (error) {
      log('error', 'Failed to save loan state to localStorage', error.message);
    }
  }, []);

  /**
   * Loads transactions from localStorage
   */
  const loadTransactions = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        log('info', '📖 Transactions restored from localStorage', `${parsed.length} transactions`);
        return parsed;
      }
      return null;
    } catch (error) {
      log('error', 'Failed to load transactions from localStorage', error.message);
      return null;
    }
  };

  /**
   * Loads loan state from localStorage
   */
  const loadLoan = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOAN_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        log('info', '📖 Loan state restored from localStorage');
        return parsed;
      }
      return null;
    } catch (error) {
      log('error', 'Failed to load loan state from localStorage', error.message);
      return null;
    }
  };

  /**
   * Adds a new transaction and saves to localStorage
   */
  const addTransaction = useCallback((newTransaction) => {
    log('debug', `🐛 addTransaction called with: ${newTransaction.type}`);
    
    setTransactions(prevTransactions => {
      log('debug', `🐛 setTransactions updating from ${prevTransactions.length} to ${prevTransactions.length + 1}`);
      const updatedTransactions = [newTransaction, ...prevTransactions];
      
      // Save to localStorage immediately within the state update
      try {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
        log('debug', '💾 Transactions saved to localStorage immediately', `${updatedTransactions.length} transactions`);
      } catch (error) {
        log('error', 'Failed to save transactions to localStorage', error.message);
      }
      
      log('success', `✅ Transaction added: ${newTransaction.type}`, `Amount: ${newTransaction.amountSats} sats`);
      return updatedTransactions;
    });
  }, []);

  /**
   * Updates loan state and saves to localStorage
   */
  const updateLoan = useCallback((loanUpdate) => {
    const updatedLoan = typeof loanUpdate === 'function' ? loanUpdate(loan) : loanUpdate;
    setLoan(updatedLoan);
    saveLoan(updatedLoan);
    log('success', `✅ Loan state updated`);
    return updatedLoan;
  }, [loan, saveLoan]);

  /**
   * Clears all stored data (for reset/testing)
   */
  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.LOAN_STATE);
      
      // Reset to defaults
      const defaultLoan = getDefaultLoan();
      const defaultTransaction = getDefaultTransaction();
      
      setLoan(defaultLoan);
      setTransactions([defaultTransaction]);
      
      // Save defaults
      saveLoan(defaultLoan);
      saveTransactions([defaultTransaction]);
      
      log('warning', '🗑️ All transaction and loan data cleared, reset to defaults');
    } catch (error) {
      log('error', 'Failed to clear data', error.message);
    }
  };

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    const initializeData = () => {
      log('info', '🚀 Initializing transaction storage...');
      
      // Load existing data
      const savedTransactions = loadTransactions();
      const savedLoan = loadLoan();
      
      if (savedTransactions && savedLoan) {
        // Restore existing data
        setTransactions(savedTransactions);
        setLoan(savedLoan);
        log('success', '✅ Existing transaction and loan data restored');
      } else {
        // Set up defaults
        const defaultLoan = getDefaultLoan();
        const defaultTransaction = getDefaultTransaction();
        
        setLoan(defaultLoan);
        setTransactions([defaultTransaction]);
        
        // Save defaults
        saveLoan(defaultLoan);
        saveTransactions([defaultTransaction]);
        
        log('info', '📝 No existing data found, initialized with defaults');
      }
      
      setIsInitialized(true);
      log('success', '✅ Transaction storage initialization complete');
    };

    initializeData();
  }, []); // Run only on mount

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized && transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions, isInitialized, saveTransactions]);

  useEffect(() => {
    if (isInitialized && loan) {
      saveLoan(loan);
    }
  }, [loan, isInitialized, saveLoan]);

  return {
    // State
    transactions,
    loan,
    isInitialized,
    
    // Actions
    addTransaction,
    updateLoan,
    setTransactions,
    setLoan,
    
    // Utilities
    clearAllData
  };
}; 