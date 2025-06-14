/**
 * Development utility for testing wallet storage functionality
 * This file provides helper functions for inspecting and manipulating 
 * wallet localStorage during development
 * 
 * ⚠️ This is for development use only!
 */

// Only run in development environment - check if we're in browser and not production
if (typeof window !== 'undefined') {
  
  // Expose wallet storage utilities to global scope for console access
  window.walletStorageTest = {
    
    /**
     * Display all wallet-related localStorage entries
     */
    showStoredWallets: () => {
      console.group('🔍 Stored Wallet Data');
      
      // Check for wallet setup data
      const walletSetup = localStorage.getItem('loan_ltv_wallet_setup');
      if (walletSetup) {
        console.log('📝 Wallet Setup Config:', JSON.parse(walletSetup));
      } else {
        console.log('📝 No wallet setup config found');
      }
      
      // Check for transactions
      const transactions = localStorage.getItem('loan_ltv_transactions');
      if (transactions) {
        const txs = JSON.parse(transactions);
        console.log(`📊 Transaction History (${txs.length} transactions):`, txs);
      } else {
        console.log('📊 No transaction history found');
      }
      
      // Check for loan state
      const loanState = localStorage.getItem('loan_ltv_loan_state');
      if (loanState) {
        console.log('🏦 Loan State:', JSON.parse(loanState));
      } else {
        console.log('🏦 No loan state found');
      }
      
      // Check for LNbits user wallet
      const lnbitsWallet = localStorage.getItem('lnbits_user_wallet');
      if (lnbitsWallet) {
        console.log('💰 LNbits User Wallet:', JSON.parse(lnbitsWallet));
      } else {
        console.log('💰 No LNbits user wallet found');
      }
      
      // Check for LNbits user ID
      const lnbitsUserId = localStorage.getItem('lnbits_user_id');
      if (lnbitsUserId) {
        console.log('👤 LNbits User ID:', lnbitsUserId);
      } else {
        console.log('👤 No LNbits user ID found');
      }
      
      console.groupEnd();
    },
    
    /**
     * Clear all wallet-related localStorage entries
     */
    clearAllWalletData: () => {
      console.log('🗑️ Clearing all wallet and transaction data...');
      
      localStorage.removeItem('loan_ltv_wallet_setup');
      localStorage.removeItem('loan_ltv_transactions');
      localStorage.removeItem('loan_ltv_loan_state');
      localStorage.removeItem('lnbits_user_wallet');
      localStorage.removeItem('lnbits_user_id');
      
      console.log('✅ All wallet and transaction data cleared. Refresh the page to see changes.');
    },
    
    /**
     * Simulate a saved self-custodial NWC wallet for testing
     */
    simulateNWCWallet: () => {
      const mockNWCSetup = {
        walletSetup: true,
        walletType: 'self-custodial',
        selfCustodialType: 'nwc',
        walletConfig: {
          type: 'self-custodial',
          method: 'nwc',
          connectionString: 'nostr+walletconnect://mock.connection.string'
        },
        nwcString: 'nostr+walletconnect://mock.connection.string',
        lnurlwString: ''
      };
      
      localStorage.setItem('loan_ltv_wallet_setup', JSON.stringify(mockNWCSetup));
      console.log('🔗 Mock NWC wallet setup saved. Refresh the page to test restoration.');
    },
    
    /**
     * Simulate a saved self-custodial LNURLW wallet for testing
     */
    simulateLNURLWWallet: () => {
      const mockLNURLWSetup = {
        walletSetup: true,
        walletType: 'self-custodial',
        selfCustodialType: 'lnurlw',
        walletConfig: {
          type: 'self-custodial',
          method: 'lnurlw',
          withdrawUrl: 'lnurlw://mock.withdraw.url'
        },
        nwcString: '',
        lnurlwString: 'lnurlw://mock.withdraw.url'
      };
      
      localStorage.setItem('loan_ltv_wallet_setup', JSON.stringify(mockLNURLWSetup));
      console.log('💸 Mock LNURLW wallet setup saved. Refresh the page to test restoration.');
    },
    
    /**
     * Simulate transaction history with various transaction types
     */
    simulateTransactionHistory: () => {
      const mockTransactions = [
        {
          id: "tx-001",
          type: "initial_deposit",
          amountSats: 150000000, // 1.5 BTC
          currency: "BTC",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed"
        },
        {
          id: "tx-002",
          type: "lightning_topup",
          amountSats: 150000, // 150k sats
          currency: "BTC",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed",
          paymentHash: "mock_payment_hash_001"
        },
        {
          id: "tx-003",
          type: "auto_liquidation",
          amountSats: -149993, // Negative for liquidation
          currency: "BTC",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed",
          paymentHash: "mock_payment_hash_002",
          targetAddress: "austin@vlt.ge",
          ltvAtLiquidation: 87.2
        }
      ];
      
      localStorage.setItem('loan_ltv_transactions', JSON.stringify(mockTransactions));
      console.log('📊 Mock transaction history saved. Refresh the page to see transactions.');
    },

    /**
     * Display help for available testing functions
     */
    help: () => {
      console.group('🛠️ Wallet Storage Test Utilities');
      console.log('Available commands:');
      console.log('• walletStorageTest.showStoredWallets() - Display all stored wallet and transaction data');
      console.log('• walletStorageTest.clearAllWalletData() - Clear all wallet and transaction localStorage');
      console.log('• walletStorageTest.simulateNWCWallet() - Create mock NWC wallet setup');
      console.log('• walletStorageTest.simulateLNURLWWallet() - Create mock LNURLW wallet setup');
      console.log('• walletStorageTest.simulateTransactionHistory() - Create mock transaction history');
      console.log('• walletStorageTest.help() - Show this help message');
      console.groupEnd();
    }
  };
  
  // Show help on load
  console.log('🛠️ Wallet storage test utilities loaded. Type walletStorageTest.help() for available commands.');
  
} else {
  // In production, create empty object to prevent errors
  window.walletStorageTest = {};
} 