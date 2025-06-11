// @ts-nocheck - Temporary during migration to Next.js
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, TrendingDown, CheckCircle, Wallet, Settings, XCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useWalletSetup } from '../hooks/useWalletSetup';
import { useSystemLogs } from '../hooks/useSystemLogs';
import WalletSetupModal from './WalletSetupModal';
import LightningInvoiceModal from './LightningInvoiceModal';
import SystemLogsPanel from './SystemLogsPanel';
import { 
  btcToSats, 
  satsToUSD, 
  formatSats, 
  parseToSats,
  isValidSatsAmount 
} from '../utils/bitcoinUnits';

// Test utility will be loaded dynamically on client side only

/**
 * Mock API for loan operations
 * In production, these would be real API calls to your backend
 * All amounts are handled in satoshis
 */
const mockAPI = {
  /**
   * Fetches loan details for a given loan ID
   */
  getLoanDetails: async (loanId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      loanId: loanId || "LOAN-001",
      userId: "user123",
      principal: 50000, // $50,000 USD
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
    };
  },
  
  /**
   * Fetches transaction history for a loan
   * Returns only the initial Bitcoin deposit by default
   */
  // eslint-disable-next-line no-unused-vars
  getTransactionHistory: async (loanId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: "tx-001",
        type: "initial_deposit",
        amountSats: btcToSats(1.5), // 1.5 BTC initial deposit
        currency: "BTC",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      }
    ];
  },
  
  /**
   * Generates a mock Lightning invoice (used for self-custodial wallets in demo)
   */
  generateLightningInvoice: async (loanId, amountSats) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const invoice = `lnbc${amountSats}n1pv${Math.random().toString(36).substring(7)}...`;
    
    return {
      invoice,
      amountSats,
      expiry: 3600,
      paymentHash: `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
  },
  
  /**
   * Confirms a mock payment (used for self-custodial demo)
   */
  confirmPayment: async (loanId, paymentHash) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentHash,
      preimage: `preimage_${Math.random().toString(36).substring(7)}`,
      settledAt: new Date().toISOString()
    };
  },
  
  /**
   * Gets current BTC price (mock)
   */
  getCurrentBTCPrice: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 300000;
  }
};

/**
 * Custom hook for simulating real-time Bitcoin price feed
 * Simulates price fluctuations for demo purposes
 * Price range: 100k - 500k for testing with smaller amounts
 */
const usePriceFeed = (initialPrice = 300000) => {
  const [price, setPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(-0.5);
  
  useEffect(() => {
    // Simulate price fluctuations every 5 seconds
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 20000; // Random change up to ±$10,000
        const newPrice = Math.max(100000, Math.min(500000, prev + change)); // Keep within 100k-500k range
        setPriceChange(((newPrice - prev) / prev) * 100);
        return newPrice;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { price, priceChange, setPrice };
};

/**
 * Main LoanLTVDemo Component
 * Handles the loan collateral management and Lightning top-up functionality
 * All amounts are denominated in satoshis
 */
export default function LoanLTVDemo() {
  // Core loan state
  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Top-up state (amounts in sats)
  const [topupAmount, setTopupAmount] = useState(500000); // 0.005 BTC = 500K sats
  const [topupInput, setTopupInput] = useState('500000'); // String for input field
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [paymentError, setPaymentError] = useState(null); // New state for payment errors
  
  // Wallet deletion confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Custom hooks
  const { price: btcPrice, priceChange, setPrice: setBtcPrice } = usePriceFeed();
  const systemLogs = useSystemLogs();
  const walletState = useWalletSetup(systemLogs);
  
  // Voltage wallet reserve constant (minimum sats to keep in wallet)
  const VOLTAGE_RESERVE_SATS = 7;

  /**
   * Calculates loan metrics based on current BTC price and loan data
   * Returns collateral value, LTV ratio, status, and required top-up amount
   */
  const calculateMetrics = useCallback(() => {
    if (!loan) return null;
    
    const collateralValueUSD = satsToUSD(loan.collateral.amountSats, btcPrice);
    const ltv = (loan.principal / collateralValueUSD) * 100;
    const ltvStatus = ltv >= 80 ? 'critical' : ltv >= 70 ? 'warning' : 'healthy';
    
    // Calculate required top-up to bring LTV back to 65%
    const targetCollateralValue = loan.principal / 0.65;
    const requiredTopupUSD = Math.max(0, targetCollateralValue - collateralValueUSD);
    const requiredTopupSats = requiredTopupUSD > 0 ? Math.ceil(requiredTopupUSD / btcPrice * 100_000_000) : 0;
    
    return {
      collateralValueUSD,
      ltv,
      ltvStatus,
      requiredTopupSats
    };
  }, [loan, btcPrice]);
  
  const metrics = calculateMetrics();

  /**
   * Automatic liquidation logic for custodial wallets
   * Triggers when LTV exceeds liquidation threshold (85%)
   */
  useEffect(() => {
    const checkForAutoLiquidation = async () => {
      const availableBalance = walletState.custodialWallet ? 
        Math.max(0, walletState.custodialWallet.balanceSats - VOLTAGE_RESERVE_SATS) : 0;
      
      systemLogs.logLiquidation('🚨 Auto-liquidation check triggered');
      systemLogs.logDebug(`Wallet balance: ${walletState.custodialWallet?.balanceSats || 0} sats, available (minus reserve): ${availableBalance} sats`);
      systemLogs.logDebug(`LTV: ${metrics?.ltv?.toFixed(1)}%, liquidation threshold: ${loan?.liquidationThreshold}%`);
      
      // Only auto-liquidate if:
      // 1. We have a custodial wallet setup
      // 2. LTV is at or above liquidation threshold (85%)
      // 3. Wallet has available balance to liquidate (minus reserve)
      // 4. Not already processing a payment
      if (
        walletState.walletSetup &&
        walletState.walletConfig.type === 'custodial' &&
        walletState.custodialWallet &&
        availableBalance > 0 &&
        metrics?.ltv >= loan?.liquidationThreshold &&
        !processingPayment &&
        !showInvoice
      ) {
        systemLogs.logLiquidation(`🚨 AUTO-LIQUIDATION TRIGGERED! LTV: ${metrics.ltv.toFixed(1)}% >= ${loan.liquidationThreshold}%`);
        systemLogs.logPayment(`💸 Sending ${formatSats(availableBalance)} to refund@lnurl.mutinynet.com (keeping ${VOLTAGE_RESERVE_SATS} sats reserve)`);
        
        setProcessingPayment(true);
        setShowInvoice(true);
        
        try {
          const liquidationAmount = availableBalance;
          const targetLightningAddress = 'refund@lnurl.mutinynet.com';
          const paymentComment = `🚨 AUTO-LIQUIDATION: Loan ID ${loan.loanId} - LTV ${metrics.ltv.toFixed(1)}%`;
          
          const liquidationPayment = await walletState.voltageAPI.sendPaymentToLightningAddress(
            targetLightningAddress,
            liquidationAmount,
            paymentComment
          );
          
          const liquidationDetails = {
            paymentType: 'auto_liquidation',
            targetAddress: targetLightningAddress,
            amountSats: liquidationAmount,
            paymentHash: liquidationPayment.payment_hash,
            checking_id: liquidationPayment.checking_id,
            createdAt: new Date().toISOString(),
            comment: paymentComment,
            ltvAtLiquidation: metrics.ltv
          };
          
          setCurrentInvoice(liquidationDetails);
          
          // Poll for liquidation payment confirmation
          pollCustodialPayment(liquidationDetails);
          
        } catch (error) {
          systemLogs.logError('Auto-liquidation failed', error.message);
          setPaymentError(`Auto-liquidation failed: ${error.message || 'Unknown error'}`);
          setProcessingPayment(false);
          setCurrentInvoice({ 
            paymentType: 'auto_liquidation_error', 
            amountSats: availableBalance,
            targetAddress: 'plebpoet@vlt.ge'
          });
        }
      } else {
        systemLogs.logDebug('🚨 Auto-liquidation conditions not met');
      }
    };

    // Check for auto-liquidation whenever metrics change
    if (metrics && loan && walletState.walletSetup) {
      // Add a small delay to prevent rapid-fire liquidations during price updates
      const timeoutId = setTimeout(checkForAutoLiquidation, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [metrics, loan, walletState.walletSetup, walletState.walletConfig, walletState.custodialWallet, processingPayment, showInvoice, systemLogs]);

  /**
   * Updates custodial wallet balance after successful operations
   */
  const updateCustodialWalletBalance = async () => {
    if (walletState.walletConfig.type === 'custodial') {
      try {
        systemLogs.logWallet('🔄 Updating custodial wallet balance...');
        const updatedWallet = await walletState.voltageAPI.getWalletDetails();
        walletState.setCustodialWallet(updatedWallet);
        systemLogs.logSuccess(`💰 Wallet balance updated: ${updatedWallet.balanceSats} sats`);
      } catch (error) {
        systemLogs.logError('Failed to update wallet balance', error.message);
      }
    }
  };
  
  /**
   * Loads initial loan data and transaction history
   */
  useEffect(() => {
    // Load test utility on client side only
    if (typeof window !== 'undefined') {
      import('../utils/testWalletStorage').catch(console.error);
    }
    
    const loadData = async () => {
      try {
        const [loanData, txHistory] = await Promise.all([
          mockAPI.getLoanDetails(),
          mockAPI.getTransactionHistory()
        ]);
        setLoan(loanData);
        setTransactions(txHistory);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  /**
   * Handles topup amount input changes with validation
   */
  const handleTopupInputChange = (value) => {
    systemLogs.logDebug(`Input changed to: ${value}`);
    setTopupInput(value);
    const sats = parseToSats(value, 'sats');
    if (sats !== null && isValidSatsAmount(sats)) {
      systemLogs.logDebug(`Setting topup amount to: ${sats} sats`);
      setTopupAmount(sats);
    } else {
      systemLogs.logWarning(`Invalid amount entered: ${value}`);
    }
  };

  /**
   * Handles the Lightning top-up process
   * Creates invoices based on wallet type and manages payment detection
   */
  const initiateTopUp = async () => {
    setPaymentError(null); // Clear previous errors
    if (!walletState.walletSetup) {
      walletState.setShowWalletSetup(true);
      return;
    }
    if (!isValidSatsAmount(topupAmount) || topupAmount <= 0) {
      systemLogs.logError('Invalid topup amount', `Amount: ${topupAmount} sats`);
      alert('Please enter a valid amount in sats (minimum 1 sat)');
      return;
    }

    systemLogs.logPayment(`🚀 Initiating top-up for ${formatSats(topupAmount)}`);

    setProcessingPayment(true);
    setShowInvoice(true); // Show modal immediately, it will show processing or error
    
    try {
      let paymentDetails;
      if (walletState.walletConfig.type === 'custodial') {
        // For custodial, generate an invoice TO the Voltage wallet for the user to pay
        systemLogs.logPayment(`Creating Voltage funding invoice for ${formatSats(topupAmount)}`);
        const voltageInvoice = await walletState.voltageAPI.createInvoice(
          topupAmount, 
          `Loan LTV collateral top-up for loan ID: ${loan.loanId}`
        );
        
        paymentDetails = {
          paymentType: 'custodial_funding', // New type to distinguish from self-custodial
          invoice: voltageInvoice.payment_request,
          amountSats: topupAmount,
          paymentHash: voltageInvoice.payment_hash,
          checking_id: voltageInvoice.checking_id,
          expiry: 3600,
          createdAt: new Date().toISOString(),
          walletUrl: `${walletState.voltageAPI.config.baseUrl}/organizations/${walletState.voltageAPI.config.organizationId}/wallets/${walletState.custodialWallet?.id || 'unknown'}`,
          walletName: walletState.custodialWallet?.name || 'User Wallet'
        };
        systemLogs.logSuccess('✅ Voltage funding invoice generated successfully');
      } else {
        // For self-custodial, generate a mock invoice for the user to pay (as before)
        systemLogs.logPayment('Creating mock invoice for self-custodial wallet');
        const mockInvoice = await mockAPI.generateLightningInvoice(loan.loanId, topupAmount);
        paymentDetails = {
          paymentType: 'incoming',
          invoice: mockInvoice.invoice,
          amountSats: mockInvoice.amountSats,
          expiry: 3600,
          paymentHash: mockInvoice.paymentHash,
          createdAt: new Date().toISOString()
        };
        systemLogs.logSuccess('✅ Mock invoice generated for self-custodial wallet');
      }
      setCurrentInvoice(paymentDetails);
      
      if (walletState.walletConfig.type === 'custodial') {
        systemLogs.logInfo('👀 Starting payment polling for custodial wallet...');
        pollCustodialPayment(paymentDetails); 
      } else {
        systemLogs.logInfo('⏱️ Starting payment simulation for self-custodial wallet...');
        simulateSelfCustodialPayment(paymentDetails);
      }
    } catch (error) {
      systemLogs.logError('Top-up initiation failed', error.message);
      setPaymentError(`Failed to initiate top-up: ${error.message || 'Unknown error'}`);
      setProcessingPayment(false);
      if (!currentInvoice) {
        setCurrentInvoice({ paymentType: 'error', amountSats: topupAmount });
      }
    }
  };

  /**
   * Polls Voltage API for custodial wallet payment status
   */
  const pollCustodialPayment = (paymentDetails) => {
    const paymentHash = paymentDetails.paymentHash; 
    systemLogs.logInfo(`🔄 Polling payment status for hash: ${paymentHash.substring(0, 8)}...`);
    
    let pollAttempts = 0;
    const maxAttempts = 30; // 30 attempts × 2 seconds = 60 seconds max
    let pollingStopped = false; // Flag to stop polling
    
    const poll = async () => {
      try {
        // Check if polling was stopped
        if (pollingStopped) {
          systemLogs.logInfo('🛑 Payment polling stopped by user');
          setProcessingPayment(false);
          return;
        }
        
        pollAttempts++;
        const paymentStatus = await walletState.voltageAPI.checkPayment(paymentHash);
        
        // Log more detailed status information
        systemLogs.logDebug(`🐛Payment ${paymentHash.substring(0, 8)}... status: ${paymentStatus.status}`);
        systemLogs.logDebug(`🐛Poll attempt ${pollAttempts}/${maxAttempts}: Payment status = ${paymentStatus.status}, paid = ${paymentStatus.paid}`);
        
        if (paymentStatus.paid) {
          systemLogs.logSuccess(`✅ Payment confirmed! Hash: ${paymentHash.substring(0, 8)}...`);
          handleSuccessfulPayment(paymentDetails); 
          setPaymentError(null); // Clear error on success
          return;
        }
        
        // Check if payment has been in 'receiving' state for too long
        if (paymentStatus.status === 'receiving' && pollAttempts > 15) {
          systemLogs.logWarning(`⚠️ Payment has been in 'receiving' state for ${pollAttempts * 2}s. This might indicate the invoice hasn't been paid yet.`);
        }
        
        // Stop polling after max attempts
        if (pollAttempts >= maxAttempts) {
          systemLogs.logWarning(`⏱️ Payment polling timeout after ${maxAttempts} attempts (${maxAttempts * 2}s)`);
          
          // Provide more helpful error message based on final status
          let errorMessage = `Payment confirmation timeout. Last status: ${paymentStatus.status}`;
          if (paymentStatus.status === 'receiving') {
            errorMessage += '. The invoice may not have been paid yet. Please check if the payment was actually sent.';
          }
          
          setPaymentError(errorMessage);
          setProcessingPayment(false);
          return;
        }
        
        // Continue polling if not stopped
        if (!pollingStopped) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        systemLogs.logError('Payment polling failed', error.message);
        setPaymentError(`Payment polling failed: ${error.message || 'Could not confirm payment'}`);
        setProcessingPayment(false);
      }
    };
    
    // Store the stop function globally so it can be called from the modal
    window.stopCurrentPolling = () => {
      pollingStopped = true;
    };
    
    setTimeout(poll, 2000);
  };

  /**
   * Simulates payment detection for self-custodial wallets (incoming payment)
   */
  const simulateSelfCustodialPayment = (invoiceDetails) => {
    setPaymentError(null); // Clear error before simulation
    systemLogs.logInfo('⏱️ Simulating self-custodial payment (3 second delay)...');
    
    setTimeout(async () => {
      try {
        const payment = await mockAPI.confirmPayment(loan.loanId, invoiceDetails.paymentHash);
        if (payment.success) {
          systemLogs.logSuccess('✅ Self-custodial payment simulation completed successfully');
          handleSuccessfulPayment(invoiceDetails);
        } else {
          systemLogs.logError('Self-custodial payment simulation failed');
          setPaymentError('Self-custodial payment simulation failed.');
          setProcessingPayment(false);
        }
      } catch (error) {
        systemLogs.logError('Payment simulation error', error.message);
        setPaymentError('Self-custodial payment simulation error.');
        setProcessingPayment(false);
      } 
    }, 3000);
  };

  /**
   * Handles successful payment by updating loan collateral and transaction history
   */
  const handleSuccessfulPayment = (paymentConfirmation) => {
    const paidAmountSats = paymentConfirmation.amountSats;

    // Handle different payment types
    if (paymentConfirmation.paymentType === 'auto_liquidation') {
      systemLogs.logLiquidation(`🚨 Auto-liquidation completed: ${formatSats(paidAmountSats)} sent to ${paymentConfirmation.targetAddress}`);
      
      // For auto-liquidation, the payment goes OUT of the collateral, not into it
      setLoan(prev => ({
        ...prev,
        collateral: {
          ...prev.collateral,
          amountSats: Math.max(0, prev.collateral.amountSats - paidAmountSats) // Subtract liquidated amount
        }
      }));
      
      const liquidationTx = {
        id: `tx-${Date.now()}`,
        type: "auto_liquidation",
        amountSats: -paidAmountSats, // Negative amount to show it was removed
        currency: "BTC",
        timestamp: new Date().toISOString(),
        status: "completed",
        paymentHash: paymentConfirmation.paymentHash,
        targetAddress: paymentConfirmation.targetAddress,
        comment: paymentConfirmation.comment,
        ltvAtLiquidation: paymentConfirmation.ltvAtLiquidation
      };
      
      setTransactions(prev => [liquidationTx, ...prev]);
      
      // Update custodial wallet balance after liquidation
      updateCustodialWalletBalance();
      
    } else {
      systemLogs.logSuccess(`✅ Top-up completed: ${formatSats(paidAmountSats)} added to collateral`);
      
      // For regular top-ups (custodial_funding or incoming), add to collateral
      setLoan(prev => ({
        ...prev,
        collateral: {
          ...prev.collateral,
          amountSats: prev.collateral.amountSats + paidAmountSats
        }
      }));
      
      const newTx = {
        id: `tx-${Date.now()}`,
        type: paymentConfirmation.paymentType === 'custodial_funding' ? "lightning_topup" : "lightning_topup",
        amountSats: paidAmountSats,
        currency: "BTC",
        timestamp: new Date().toISOString(),
        status: "completed",
        paymentHash: paymentConfirmation.paymentHash,
        ...(paymentConfirmation.paymentType === 'outgoing' && { 
          targetAddress: paymentConfirmation.targetAddress, 
          comment: paymentConfirmation.comment 
        })
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      // Update custodial wallet balance after funding
      if (paymentConfirmation.paymentType === 'custodial_funding') {
        updateCustodialWalletBalance();
      }
    }

    setProcessingPayment(false);
    setPaymentError(null);
  };

  /**
   * Stops the current payment polling
   */
  const stopPolling = () => {
    if (window.stopCurrentPolling) {
      window.stopCurrentPolling();
      systemLogs.logInfo('🛑 Payment polling stopped by user');
      setPaymentError('Payment polling stopped by user');
    }
  };

  /**
   * Closes invoice modal and resets payment state
   */
  const closeInvoiceModal = () => {
    // Stop any ongoing polling when closing modal
    if (window.stopCurrentPolling) {
      window.stopCurrentPolling();
    }
    setShowInvoice(false);
    setProcessingPayment(false);
    setCurrentInvoice(null);
    setPaymentError(null); // Clear error when modal is manually closed
  };
  
  /**
   * Demo function to simulate a market crash (20% price drop)
   */
  const simulateCrash = () => {
    const newPrice = btcPrice * 0.8;
    systemLogs.logWarning(`📉 Market crash simulated: BTC price dropped from $${btcPrice.toLocaleString()} to $${Math.round(newPrice).toLocaleString()} (-20%)`);
    setBtcPrice(newPrice);
  };

  /**
   * Handles wallet deletion confirmation
   */
  const handleDeleteWallet = () => {
    setShowDeleteConfirmation(true);
  };

  /**
   * Confirms wallet deletion and clears all wallet data
   */
  const confirmDeleteWallet = () => {
    systemLogs.logWarning('🗑️ Deleting wallet and clearing all data...');
    walletState.resetWalletSetup();
    setShowDeleteConfirmation(false);
    systemLogs.logSuccess('✅ Wallet deleted successfully');
  };

  /**
   * Cancels wallet deletion
   */
  const cancelDeleteWallet = () => {
    setShowDeleteConfirmation(false);
  };

  /**
   * Opens the Voltage wallet in a new tab (for custodial wallets)
   */
  const openVoltageWallet = () => {
    if (walletState.walletConfig?.type === 'custodial' && walletState.custodialWallet) {
      const voltageUrl = walletState.voltageAPI.config.baseUrl;
      const organizationId = walletState.voltageAPI.config.organizationId;
      const walletId = walletState.custodialWallet.id;
      const walletUrl = `${voltageUrl}/organizations/${organizationId}/wallets/${walletId}`;
      
      systemLogs.logInfo(`🔗 Opening Voltage wallet in new tab: ${walletUrl}`);
      window.open(walletUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading loan details...</div>
      </div>
    );
  }

  // Show loading state while checking for existing wallet connections
  if (!walletState.initialLoadComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-xl">Checking for existing wallet connections...</div>
          <div className="text-gray-400 text-sm mt-2">Please wait while we restore your wallet state</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with branding and BTC price */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              ⚡ Lightning LTV
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">BTC/USD</span>
                <span className="font-semibold">${btcPrice.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded text-xs ${priceChange >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Critical LTV warning alert */}
        {metrics?.ltvStatus === 'critical' && (
          <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-500">Margin Call Warning</h3>
                <p className="text-red-300 mt-1">
                  Your loan is approaching liquidation. Add Bitcoin collateral immediately to avoid liquidation of your assets.
                  Required top-up: <strong>{formatSats(metrics.requiredTopupSats)}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loan overview cards showing key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Loan Amount Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Loan Amount</div>
            <div className="text-3xl font-bold">${loan.principal.toLocaleString()}</div>
            <div className="text-gray-500">{loan.currency}</div>
          </div>
          
          {/* Collateral Value Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Bitcoin Collateral Value</div>
            <div className="text-3xl font-bold">${metrics?.collateralValueUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <div className="text-gray-500">{formatSats(loan.collateral.amountSats)}</div>
          </div>
          
          {/* LTV Ratio Card with visual meter */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Current LTV</div>
            <div className="text-3xl font-bold">{metrics?.ltv.toFixed(1)}%</div>
            <div className="text-gray-500">Liquidation at {loan.liquidationThreshold}%</div>
            
            {/* LTV Visual Meter */}
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                  style={{ width: `${metrics?.ltv}%` }}
                />
                {/* Liquidation threshold indicator */}
                <div className="absolute right-0 top-0 w-[15%] h-full bg-red-600/30 border-l-2 border-red-600" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>Safe</span>
                <span>Warning</span>
                <span>85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lightning Top-up Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Lightning Network Top-Up</h2>
            <div className="flex items-center gap-3">
              {/* Wallet status indicator */}
              {walletState.walletSetup && (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {walletState.walletConfig.type === 'custodial' 
                      ? `Custodial Wallet (${formatSats(walletState.custodialWallet?.balanceSats || 0)} balance)` 
                      : `Self-Custodial (${walletState.walletConfig.method.toUpperCase()})`
                    }
                  </span>
                </div>
              )}
              {/* LTV status badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                metrics?.ltvStatus === 'healthy' ? 'bg-green-900/50 text-green-400 border border-green-600' :
                metrics?.ltvStatus === 'warning' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600 animate-pulse' :
                'bg-red-900/50 text-red-400 border border-red-600 animate-pulse'
              }`}>
                {metrics?.ltvStatus === 'healthy' ? 'Healthy' : metrics?.ltvStatus === 'warning' ? 'Warning' : 'Critical'}
              </span>
            </div>
          </div>
          
          {/* Setup required notice */}
          {!walletState.walletSetup && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Setup Required</span>
              </div>
              <p className="text-gray-400 text-sm">
                Configure your Lightning wallet to enable instant top-ups for your loan collateral.
              </p>
            </div>
          )}
          
          {/* Top-up controls */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Top-up Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={topupInput}
                  onChange={(e) => handleTopupInputChange(e.target.value)}
                  step="1000"
                  min="1"
                  className="w-full px-4 py-3 pr-16 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Enter amount in sats"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">sats</span>
              </div>
              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleTopupInputChange('100000')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                >
                  100K sats
                </button>
                <button
                  onClick={() => handleTopupInputChange('500000')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                >
                  500K sats
                </button>
                <button
                  onClick={() => handleTopupInputChange('1000000')}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                >
                  1M sats
                </button>
                {metrics?.requiredTopupSats > 0 && (
                  <button
                    onClick={() => handleTopupInputChange(metrics.requiredTopupSats.toString())}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded cursor-pointer"
                  >
                    Required: {formatSats(metrics.requiredTopupSats, false)}
                  </button>
                )}
              </div>
              {/* USD equivalent */}
              {isValidSatsAmount(topupAmount) && (
                <div className="text-xs text-gray-400 mt-1">
                  ≈ ${satsToUSD(topupAmount, btcPrice).toFixed(2)} USD
                </div>
              )}
            </div>
            
            {/* Main top-up button */}
            <button
              onClick={initiateTopUp}
              disabled={processingPayment || !isValidSatsAmount(topupAmount) || topupAmount <= 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              {walletState.walletSetup ? 'Top-up via Lightning' : 'Setup Wallet & Top-up'}
            </button>
            
            {/* Wallet management buttons (only shown when wallet is set up) */}
            {walletState.walletSetup && (
              <>
                {/* Open Wallet button (for custodial wallets only) */}
                {walletState.walletConfig?.type === 'custodial' && (
                  <button
                    onClick={openVoltageWallet}
                    className="px-4 py-3 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Wallet
                  </button>
                )}
                
                {/* Delete Wallet button */}
                <button
                  onClick={handleDeleteWallet}
                  className="px-4 py-3 bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {walletState.walletConfig?.type === 'custodial' ? 'Delete Wallet' : 'Change Wallet'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
          
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-center ${
                    tx.type === 'auto_liquidation' ? 'bg-red-500/20 text-red-400' :
                    tx.type === 'lightning_topup' ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {tx.type === 'auto_liquidation' ? '🚨' : 
                     tx.type === 'lightning_topup' ? <Zap className="w-5 h-5" /> : '📥'}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {tx.type === 'auto_liquidation' ? `🚨 Auto-Liquidation (LTV ${tx.ltvAtLiquidation?.toFixed(1)}%)` :
                       tx.type === 'lightning_topup' ? 'Lightning Top-up' : 
                       'Initial Bitcoin Deposit'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                      {tx.targetAddress && (
                        <span className="ml-2">→ {tx.targetAddress}</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.amountSats < 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.amountSats < 0 ? '' : '+'}{formatSats(Math.abs(tx.amountSats))}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${satsToUSD(Math.abs(tx.amountSats), btcPrice).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <WalletSetupModal
        show={walletState.showWalletSetup}
        onClose={walletState.closeWalletSetup}
        walletState={walletState}
      />
      
      <LightningInvoiceModal
        show={showInvoice}
        invoice={currentInvoice}
        btcPrice={btcPrice}
        processingPayment={processingPayment}
        paymentError={paymentError}
        onClose={closeInvoiceModal}
        onStopPolling={stopPolling}
      />

      {/* Delete Wallet Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Wallet</h3>
                <p className="text-sm text-gray-400">
                  {walletState.walletConfig?.type === 'custodial' ? 'LNbits Custodial Wallet' : 'Self-Custodial Wallet'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-3">
                Are you sure you want to delete this wallet? This action cannot be undone.
              </p>
              {walletState.walletConfig?.type === 'custodial' && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    <strong>Warning:</strong> This will permanently delete your custodial wallet and any remaining balance. 
                    Make sure to withdraw all funds before proceeding.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteWallet}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWallet}
                className="flex-1 px-4 py-2 bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Controls Panel */}
      <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-orange-400 mb-4">Demo Controls</h3>
        
        <div className="space-y-4">
          {/* BTC Price Slider */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">BTC Price</label>
            <input
              type="range"
              min="30000"
              max="60000"
              value={btcPrice}
              onChange={(e) => setBtcPrice(parseInt(e.target.value))}
              className="w-48"
            />
            <div className="text-sm font-semibold text-orange-400">${btcPrice.toLocaleString()}</div>
          </div>
          
          {/* Market crash simulator */}
          <button
            onClick={simulateCrash}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            Crash -20%
          </button>
        </div>
      </div>

      {/* System Logs Panel */}
      <SystemLogsPanel 
        logs={systemLogs.logs} 
        onClearLogs={systemLogs.clearLogs} 
      />
    </div>
  );
} 