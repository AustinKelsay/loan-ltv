/**
 * Simple development utility for testing wallet storage
 * ⚠️ Development use only!
 */

// Only run in development environment
if (typeof window !== 'undefined') {
  
  // Simple utilities exposed to global scope
  window.walletStorageTest = {
    
    /**
     * Display all stored data
     */
    showStoredWallets: () => {
      console.group('🔍 Stored Data');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('loan_ltv_') || key.startsWith('voltage_')) {
          try {
            console.log(`${key}:`, JSON.parse(localStorage.getItem(key)));
          } catch {
            console.log(`${key}:`, localStorage.getItem(key));
          }
        }
      });
      console.groupEnd();
    },
    
    /**
     * Clear all app data
     */
    clearAllWalletData: () => {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('loan_ltv_') || key.startsWith('voltage_')
      );
      keys.forEach(key => localStorage.removeItem(key));
      console.log('✅ All data cleared. Refresh the page.');
    },

    /**
     * Show help
     */
    help: () => {
      console.log('🛠️ Available commands:');
      console.log('• walletStorageTest.showStoredWallets() - Show all data');
      console.log('• walletStorageTest.clearAllWalletData() - Clear all data');
    }
  };
  
  console.log('🛠️ Dev utilities loaded. Type walletStorageTest.help()');
  
} else {
  if (typeof window !== 'undefined') {
    window.walletStorageTest = {};
  }
} 