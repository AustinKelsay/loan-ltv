import { useState } from 'react';
import { useLNbitsAPI } from './useLNbitsAPI';

/**
 * Custom hook for managing wallet setup state and operations
 * Handles both self-custodial and custodial wallet configurations
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

  /**
   * Sets up a custodial wallet using LNbits
   * Fetches wallet details and configures the wallet
   */
  const setupCustodialWallet = async () => {
    setLoadingWallet(true);
    log('wallet', '🔧 Setting up LNbits custodial wallet...');
    
    try {
      const walletDetails = await lnbitsAPI.getWalletDetails();
      setCustodialWallet(walletDetails);
      setWalletConfig({
        type: 'custodial',
        wallet: walletDetails
      });
      setWalletSetup(true);
      setShowWalletSetup(false);
      
      log('success', `✅ Custodial wallet setup complete! Balance: ${walletDetails.balanceSats} sats`);
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
    if (selfCustodialType === 'nwc' && nwcString.trim()) {
      log('wallet', '🔧 Setting up NWC self-custodial wallet...');
      setWalletConfig({
        type: 'self-custodial',
        method: 'nwc',
        connectionString: nwcString.trim()
      });
      setWalletSetup(true);
      setShowWalletSetup(false);
      log('success', '✅ NWC wallet setup complete!');
    } else if (selfCustodialType === 'lnurlw' && lnurlwString.trim()) {
      log('wallet', '🔧 Setting up LNURLW self-custodial wallet...');
      setWalletConfig({
        type: 'self-custodial',
        method: 'lnurlw',
        withdrawUrl: lnurlwString.trim()
      });
      setWalletSetup(true);
      setShowWalletSetup(false);
      log('success', '✅ LNURLW wallet setup complete!');
    } else {
      const error = 'Please enter a valid connection string.';
      log('error', error);
      throw new Error(error);
    }
  };

  /**
   * Resets wallet setup state and opens setup modal
   */
  const resetWalletSetup = () => {
    setWalletType(null);
    setSelfCustodialType(null);
    setNwcString('');
    setLnurlwString('');
    setShowWalletSetup(true);
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