import { useState, useEffect, useCallback } from 'react';

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
      
      // Reset to fresh start state (no loan)
      setLoan(null);
      setTransactions([]);
      
      log('warning', '🗑️ All transaction and loan data cleared, fresh start');
    } catch (error) {
      log('error', 'Failed to clear data', error.message);
    }
  };

  /**
   * Creates a new loan and adds it to transaction history
   * Uses constants for consistency and validates inputs
   */
  const createLoan = useCallback((collateralSats, loanPrincipal = 30000) => {
    // Input validation
    if (!collateralSats || collateralSats < 1000000) { // Minimum 0.01 BTC
      throw new Error('Collateral must be at least 1,000,000 sats (0.01 BTC)');
    }
    if (!loanPrincipal || loanPrincipal < 1000) { // Minimum $1,000
      throw new Error('Loan principal must be at least $1,000');
    }

    const loanId = `LOAN-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const newLoan = {
      loanId,
      userId: "user123",
      principal: loanPrincipal, // USD
      currency: "USDC",
      collateral: {
        amountSats: collateralSats,
        currency: "BTC"
      },
      liquidationThreshold: 80, // 80% LTV triggers Lightning liquidation
      warningThreshold: 65, // 65% LTV shows warning
      interestRate: 8.5,
      status: "active",
      createdAt: timestamp
    };
    
    // Create loan creation transaction
    const loanCreationTx = {
      id: `tx-loan-${Date.now() + 1}`, // Ensure unique ID
      type: "loan_created",
      amountSats: collateralSats,
      currency: "BTC",
      timestamp: timestamp,
      status: "completed",
      loanId: loanId,
      principal: loanPrincipal
    };
    
    // Set loan first, then add transaction to ensure proper order
    setLoan(newLoan);
    
    // Add transaction after loan is set (React will batch these updates)
    addTransaction(loanCreationTx);
    
    log('success', `✅ New loan created: ${loanId}`, `Collateral: ${collateralSats} sats, Principal: $${loanPrincipal}`);
    
    return newLoan;
  }, [addTransaction]);

  /**
   * Clears the current loan (used after liquidation)
   */
  const clearLoan = useCallback(() => {
    setLoan(null);
    localStorage.removeItem(STORAGE_KEYS.LOAN_STATE);
    log('info', '🗑️ Current loan cleared');
  }, []);

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
      } else if (savedTransactions) {
        // Have transactions but no loan (after liquidation)
        setTransactions(savedTransactions);
        setLoan(null);
        log('info', '📝 Transactions restored, no active loan');
      } else {
        // Fresh start - no data at all
        setTransactions([]);
        setLoan(null);
        log('info', '📝 Fresh start - no existing data found');
      }
      
      setIsInitialized(true);
      log('success', '✅ Transaction storage initialization complete');
    };

    initializeData();
  }, []); // Run only on mount

  // Auto-save when data changes (only if not already saved in the action)
  useEffect(() => {
    if (isInitialized && transactions.length > 0) {
      // Only save if this isn't from a direct action (which already saves)
      const timeoutId = setTimeout(() => {
        saveTransactions(transactions);
      }, 100); // Small delay to avoid duplicate saves
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, isInitialized, saveTransactions]);

  useEffect(() => {
    if (isInitialized && loan) {
      // Only save if this isn't from a direct action (which already saves)
      const timeoutId = setTimeout(() => {
        saveLoan(loan);
      }, 100); // Small delay to avoid duplicate saves
      return () => clearTimeout(timeoutId);
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
    createLoan,
    clearLoan,
    setTransactions,
    setLoan,
    
    // Utilities
    clearAllData
  };
}; 