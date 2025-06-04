import { useState, useEffect } from 'react';
import { useLNbitsAPI } from './useLNbitsAPI';

// Local storage keys for wallet persistence
const WALLET_STORAGE_KEYS = {
  WALLET_SETUP: 'loan_ltv_wallet_setup',
  WALLET_CONFIG: 'loan_ltv_wallet_config',
  WALLET_TYPE: 'loan_ltv_wallet_type',
  SELF_CUSTODIAL_TYPE: 'loan_ltv_self_custodial_type',
  NWC_STRING: 'loan_ltv_nwc_string',
  LNURLW_STRING: 'loan_ltv_lnurlw_string'
};

/**
 * Custom hook for managing wallet setup state and operations
 * Handles both self-custodial and custodial wallet configurations
 * Includes localStorage persistence and automatic restoration on startup
 */
export const useWalletSetup = (logger = null) => {
  // LNbits API hook with logger
  const lnbitsAPI = useLNbitsAPI(logger);

  const log = (level, message, data) => {
    if (logger) {
      logger[`log${level.charAt(0).toUpperCase() + level.slice(1)}`]?.(message, data);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  };

  // Wallet setup state
  const [walletSetup, setWalletSetup] = useState(false);
  const [walletType, setWalletType] = useState(null); // 'self-custodial' | 'custodial'
  const [selfCustodialType, setSelfCustodialType] = useState(null); // 'nwc' | 'lnurlw'
  const [walletConfig, setWalletConfig] = useState(null);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [nwcString, setNwcString] = useState('');
  const [lnurlwString, setLnurlwString] = useState('');
  const [custodialWallet, setCustodialWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  /**
   * Saves wallet state to localStorage
   */
  const saveWalletState = (state = {}) => {
    try {
      const stateToSave = {
        walletSetup: state.walletSetup ?? walletSetup,
        walletType: state.walletType ?? walletType,
        selfCustodialType: state.selfCustodialType ?? selfCustodialType,
        walletConfig: state.walletConfig ?? walletConfig,
        nwcString: state.nwcString ?? nwcString,
        lnurlwString: state.lnurlwString ?? lnurlwString
      };

      localStorage.setItem(WALLET_STORAGE_KEYS.WALLET_SETUP, JSON.stringify(stateToSave));
      log('debug', '💾 Wallet state saved to localStorage');
    } catch (error) {
      log('error', 'Failed to save wallet state to localStorage', error.message);
    }
  };

  /**
   * Loads wallet state from localStorage
   */
  const loadWalletState = () => {
    try {
      const savedState = localStorage.getItem(WALLET_STORAGE_KEYS.WALLET_SETUP);
      if (savedState) {
        const state = JSON.parse(savedState);
        log('info', '📖 Restoring wallet state from localStorage', state);
        
        setWalletSetup(state.walletSetup || false);
        setWalletType(state.walletType || null);
        setSelfCustodialType(state.selfCustodialType || null);
        setWalletConfig(state.walletConfig || null);
        setNwcString(state.nwcString || '');
        setLnurlwString(state.lnurlwString || '');
        
        return state;
      }
      return null;
    } catch (error) {
      log('error', 'Failed to load wallet state from localStorage', error.message);
      return null;
    }
  };

  /**
   * Clears wallet state from localStorage
   */
  const clearWalletState = () => {
    try {
      localStorage.removeItem(WALLET_STORAGE_KEYS.WALLET_SETUP);
      log('debug', '🗑️ Wallet state cleared from localStorage');
    } catch (error) {
      log('error', 'Failed to clear wallet state from localStorage', error.message);
    }
  };

  /**
   * Restores custodial wallet details from LNbits API
   */
  const restoreCustodialWallet = async () => {
    try {
      log('wallet', '🔍 Checking for existing custodial wallet...');
      const existingWallet = lnbitsAPI.getUserWallet();
      
      if (existingWallet) {
        // Get fresh wallet details
        const walletDetails = await lnbitsAPI.getOrCreateUserWallet();
        setCustodialWallet(walletDetails);
        log('success', `✅ Custodial wallet restored: ${walletDetails.name}, Balance: ${walletDetails.balanceSats} sats`);
        return walletDetails;
      }
      
      return null;
    } catch (error) {
      log('warning', 'Failed to restore custodial wallet, will need to setup again', error.message);
      return null;
    }
  };

  /**
   * Initializes wallet state on component mount
   * Checks localStorage for existing wallet configuration and restores it
   */
  useEffect(() => {
    const initializeWalletState = async () => {
      log('info', '🚀 Initializing wallet state...');
      
      // Load wallet state from localStorage
      const savedState = loadWalletState();
      
      if (savedState && savedState.walletSetup) {
        log('info', '🔄 Found existing wallet setup, restoring...');
        
        // If it's a custodial wallet, try to restore the wallet details
        if (savedState.walletConfig?.type === 'custodial') {
          const restoredWallet = await restoreCustodialWallet();
          
          if (!restoredWallet) {
            // Failed to restore custodial wallet, reset state
            log('warning', '⚠️ Failed to restore custodial wallet, resetting state');
            clearWalletState();
            setWalletSetup(false);
            setWalletConfig(null);
            setCustodialWallet(null);
            setWalletType(null);
            setSelfCustodialType(null);
            setNwcString('');
            setLnurlwString('');
          }
        } else {
          // Self-custodial wallet, just validate the config exists
          log('success', '✅ Self-custodial wallet configuration restored');
        }
      } else {
        log('info', '📝 No existing wallet setup found, user will need to configure');
      }
      
      setInitialLoadComplete(true);
      log('success', '✅ Wallet state initialization complete');
    };

    initializeWalletState();
  }, []); // Empty dependency array - run only on mount

  /**
   * Sets up a custodial wallet using LNbits
   * Fetches wallet details and configures the wallet
   */
  const setupCustodialWallet = async () => {
    setLoadingWallet(true);
    log('wallet', '🔧 Setting up LNbits custodial wallet...');
    
    try {
      // Create or get existing user wallet
      const walletDetails = await lnbitsAPI.getOrCreateUserWallet();
      setCustodialWallet(walletDetails);
      
      const newConfig = {
        type: 'custodial',
        wallet: walletDetails
      };
      
      setWalletConfig(newConfig);
      setWalletSetup(true);
      setShowWalletSetup(false);
      
      // Save state to localStorage
      saveWalletState({
        walletSetup: true,
        walletType: 'custodial',
        walletConfig: newConfig
      });
      
      log('success', `✅ Custodial wallet setup complete! User: ${walletDetails.name}, Balance: ${walletDetails.balanceSats} sats`);
    } catch (error) {
      log('error', 'Failed to setup custodial wallet', error.message);
      throw new Error('Failed to setup custodial wallet. Please try again.');
    } finally {
      setLoadingWallet(false);
    }
  };

  /**
   * Sets up a self-custodial wallet using NWC or LNURLW
   * Validates connection strings and saves configuration
   */
  const setupSelfCustodialWallet = () => {
    let newConfig = null;
    
    if (selfCustodialType === 'nwc' && nwcString.trim()) {
      log('wallet', '🔧 Setting up NWC self-custodial wallet...');
      newConfig = {
        type: 'self-custodial',
        method: 'nwc',
        connectionString: nwcString.trim()
      };
    } else if (selfCustodialType === 'lnurlw' && lnurlwString.trim()) {
      log('wallet', '🔧 Setting up LNURLW self-custodial wallet...');
      newConfig = {
        type: 'self-custodial',
        method: 'lnurlw',
        withdrawUrl: lnurlwString.trim()
      };
    }
    
    if (newConfig) {
      setWalletConfig(newConfig);
      setWalletSetup(true);
      setShowWalletSetup(false);
      
      // Save state to localStorage
      saveWalletState({
        walletSetup: true,
        walletType: 'self-custodial',
        selfCustodialType,
        walletConfig: newConfig,
        nwcString: selfCustodialType === 'nwc' ? nwcString : '',
        lnurlwString: selfCustodialType === 'lnurlw' ? lnurlwString : ''
      });
      
      log('success', `✅ ${selfCustodialType.toUpperCase()} wallet setup complete!`);
    } else {
      const error = 'Please enter a valid connection string.';
      log('error', error);
      throw new Error(error);
    }
  };

  /**
   * Resets wallet setup state and opens setup modal
   * Also clears user wallet data for custodial wallets
   */
  const resetWalletSetup = () => {
    // Clear user wallet data if it was custodial
    if (walletConfig?.type === 'custodial') {
      log('info', '🗑️ Clearing custodial wallet data...');
      lnbitsAPI.clearUserData();
    }
    
    // Clear localStorage
    clearWalletState();
    
    setWalletSetup(false);
    setWalletConfig(null);
    setCustodialWallet(null);
    setWalletType(null);
    setSelfCustodialType(null);
    setNwcString('');
    setLnurlwString('');
    setShowWalletSetup(true);
    
    log('info', 'Wallet setup reset complete');
  };

  /**
   * Closes wallet setup modal and resets state
   */
  const closeWalletSetup = () => {
    setShowWalletSetup(false);
    setWalletType(null);
    setSelfCustodialType(null);
    setNwcString('');
    setLnurlwString('');
  };

  return {
    // State
    walletSetup,
    walletType,
    selfCustodialType,
    walletConfig,
    showWalletSetup,
    nwcString,
    lnurlwString,
    custodialWallet,
    loadingWallet,
    initialLoadComplete,

    // Actions
    setWalletType,
    setSelfCustodialType,
    setNwcString,
    setLnurlwString,
    setShowWalletSetup,
    setCustodialWallet,
    setupCustodialWallet,
    setupSelfCustodialWallet,
    resetWalletSetup,
    closeWalletSetup,

    // API
    lnbitsAPI
  };
}; 