// @ts-nocheck - Temporary during migration to Next.js
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, TrendingDown, CheckCircle, Wallet, Settings, XCircle, ExternalLink, Trash2 } from 'lucide-react';
import { useWalletSetup } from '../hooks/useWalletSetup';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { useTransactionStorage } from '../hooks/useTransactionStorage';
import WalletSetupModal from './WalletSetupModal';
import LightningInvoiceModal from './LightningInvoiceModal';
import SystemLogsPanel from './SystemLogsPanel';
import Tooltip, { QuestionMarkIcon } from './Tooltip';
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
 * Price range: 60k - 140k for realistic demo scenarios
 */
const usePriceFeed = (initialPrice = 100000) => {
  const [price, setPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(-0.5);
  
  useEffect(() => {
    // Simulate price fluctuations every 10 seconds (slower for better observation of smart liquidation updates)
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 6000; // Reduced volatility: ±$3,000 instead of ±$4,000
        const newPrice = Math.max(20000, Math.min(140000, prev + change)); // Keep within 20k-140k range
        setPriceChange(((newPrice - prev) / prev) * 100);
        return newPrice;
      });
    }, 10000); // Changed from 5000ms to 10000ms
    
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
  // Custom hooks
  const systemLogs = useSystemLogs();
  const walletState = useWalletSetup(systemLogs);
  const transactionStorage = useTransactionStorage(systemLogs);
  
  // Destructure transaction storage for easier access
  const { transactions, loan, isInitialized: transactionStorageReady, addTransaction, updateLoan } = transactionStorage;
  
  // Top-up state (amounts in sats)
  const [topupAmount, setTopupAmount] = useState(500000); // 0.005 BTC = 500K sats
  const [topupInput, setTopupInput] = useState('500000'); // String for input field
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [paymentError, setPaymentError] = useState(null); // New state for payment errors
  const [activeTab, setActiveTab] = useState("custom"); // Tab state for UI
  
  // Wallet deletion confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Price feed hook
  const { price: btcPrice, priceChange, setPrice: setBtcPrice } = usePriceFeed();
  
  // Voltage wallet reserve constant (minimum sats to keep in wallet)
  const VOLTAGE_RESERVE_SATS = 7;

  /**
   * Calculates loan metrics based on current BTC price and loan data
   * Lightning wallet balance is included as part of total collateral
   * Returns collateral value, LTV ratio, status, and required top-up amount
   */
  const calculateMetrics = useCallback(() => {
    if (!loan) return null;
    
    // Get Lightning wallet balance (part of total collateral)
    const lightningWalletSats = walletState.custodialWallet ? 
      Math.max(0, walletState.custodialWallet.balanceSats - VOLTAGE_RESERVE_SATS) : 0;
    
    // Total collateral = main collateral + Lightning wallet balance
    const totalCollateralSats = loan.collateral.amountSats + lightningWalletSats;
    const totalCollateralValueUSD = satsToUSD(totalCollateralSats, btcPrice);
    const mainCollateralValueUSD = satsToUSD(loan.collateral.amountSats, btcPrice);
    const lightningCollateralValueUSD = satsToUSD(lightningWalletSats, btcPrice);
    
    // LTV calculation based on total collateral
    const ltv = (loan.principal / totalCollateralValueUSD) * 100;
    
    // Status based on liquidation thresholds
    const lightningLiquidationThreshold = 85; // Lightning wallet liquidates
    const loanLiquidationThreshold = 90; // Main loan liquidates (game over)
    
    let ltvStatus, gameStatus;
    if (ltv >= loanLiquidationThreshold) {
      ltvStatus = 'liquidated';
      gameStatus = 'loan_liquidated'; // Game over
    } else if (ltv >= lightningLiquidationThreshold) {
      ltvStatus = 'critical';
      gameStatus = 'lightning_zone'; // Lightning wallet at risk
    } else if (ltv >= 70) {
      ltvStatus = 'warning';
      gameStatus = 'safe';
    } else {
      ltvStatus = 'healthy';
      gameStatus = 'safe';
    }
    
    // Calculate required top-up to bring LTV back to 65%
    const targetCollateralValue = loan.principal / 0.65;
    const requiredTopupUSD = Math.max(0, targetCollateralValue - totalCollateralValueUSD);
    const requiredTopupSats = requiredTopupUSD > 0 ? Math.ceil(requiredTopupUSD / btcPrice * 100_000_000) : 0;
    
    return {
      // Total collateral metrics
      totalCollateralSats,
      totalCollateralValueUSD,
      mainCollateralValueUSD,
      lightningCollateralValueUSD,
      lightningWalletSats,
      
      // LTV and status
      ltv,
      ltvStatus,
      gameStatus,
      lightningLiquidationThreshold,
      loanLiquidationThreshold,
      
      // Top-up calculations
      requiredTopupSats
    };
  }, [loan, btcPrice, walletState.custodialWallet, VOLTAGE_RESERVE_SATS]);
  
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
      // 2. LTV is at or above Lightning liquidation threshold (85%)
      // 3. Wallet has available balance to liquidate (minus reserve)
      // 4. Not already processing a payment
      // 5. Main loan hasn't been liquidated yet
      if (
        walletState.walletSetup &&
        walletState.walletConfig.type === 'custodial' &&
        walletState.custodialWallet &&
        availableBalance > 0 &&
        metrics?.ltv >= metrics?.lightningLiquidationThreshold &&
        metrics?.gameStatus !== 'loan_liquidated' &&
        !processingPayment &&
        !showInvoice
      ) {
        systemLogs.logLiquidation(`🚨 LIGHTNING AUTO-LIQUIDATION TRIGGERED! LTV: ${metrics.ltv.toFixed(1)}% >= ${metrics.lightningLiquidationThreshold}%`);
        systemLogs.logPayment(`💸 Sending ${formatSats(availableBalance)} to austin@vlt.ge (keeping ${VOLTAGE_RESERVE_SATS} sats reserve)`);
        
        setProcessingPayment(true);
        setShowInvoice(true);
        
        try {
          const liquidationAmount = availableBalance;
          const targetLightningAddress = 'snstrtest@vlt.ge';
          const paymentComment = `🚨 AUTO-LIQUIDATION: Loan ID ${loan.loanId} - LTV ${metrics.ltv.toFixed(1)}%`;
          
          const liquidationPayment = await walletState.voltageAPI.sendPaymentToLightningAddress(
            targetLightningAddress,
            liquidationAmount,
            paymentComment
          );
          
          systemLogs.logDebug(`🐛 Liquidation payment created:`, liquidationPayment);
          systemLogs.logDebug(`🐛 Payment hash: ${liquidationPayment.payment_hash}`);
          
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
            targetAddress: 'snstrtest@vlt.ge'
          });
        }
      } else {
        systemLogs.logDebug('🚨 Lightning auto-liquidation conditions not met');
      }

      // Check for main loan liquidation (90% LTV - game over)
      if (
        metrics?.ltv >= metrics?.loanLiquidationThreshold &&
        metrics?.gameStatus !== 'loan_liquidated' &&
        !processingPayment &&
        !showInvoice
      ) {
        systemLogs.logLiquidation(`💀 LOAN LIQUIDATION TRIGGERED! LTV: ${metrics.ltv.toFixed(1)}% >= ${metrics.loanLiquidationThreshold}%`);
        
        // Mark loan as liquidated in transaction history
        const liquidationTx = {
          id: `tx-${Date.now()}`,
          type: "loan_liquidation",
          amountSats: -loan.collateral.amountSats, // Negative to show collateral removed
          currency: "BTC",
          timestamp: new Date().toISOString(),
          status: "completed",
          ltvAtLiquidation: metrics.ltv,
          gameOver: true
        };
        
        addTransaction(liquidationTx);
        
        // Zero out the loan collateral (loan is liquidated)
        updateLoan(prev => ({
          ...prev,
          collateral: {
            ...prev.collateral,
            amountSats: 0
          },
          status: 'liquidated'
        }));
        
        systemLogs.logError('💀 GAME OVER: Main loan has been liquidated!');
      }
    };

    // Check for auto-liquidation whenever metrics change
    if (metrics && loan && walletState.walletSetup) {
      // Small delay for demo purposes - responsive but not spammy
      const timeoutId = setTimeout(checkForAutoLiquidation, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [metrics, loan, walletState.walletSetup, walletState.walletConfig, walletState.custodialWallet, processingPayment, showInvoice]);

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
   * Loads test utility on client side only
   */
  useEffect(() => {
    // Load test utility on client side only
    if (typeof window !== 'undefined') {
      import('../utils/testWalletStorage').catch(console.error);
    }
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
        
        // For auto-liquidation payments, dynamically update the amount based on current conditions
        if (paymentDetails.paymentType === 'auto_liquidation') {
          try {
            // Get current wallet balance
            const currentWallet = await walletState.voltageAPI.getWalletDetails();
            const currentAvailableBalance = Math.max(0, currentWallet.balanceSats - VOLTAGE_RESERVE_SATS);
            
            // Check if we still need to liquidate based on current LTV
            const currentMetrics = calculateLoanMetrics(loan, btcPrice, currentWallet.balanceSats);
            
            if (currentMetrics.ltv < currentMetrics.lightningLiquidationThreshold) {
              systemLogs.logInfo(`📈 Price recovery detected! LTV now ${currentMetrics.ltv.toFixed(1)}% < ${currentMetrics.lightningLiquidationThreshold}% - cancelling auto-liquidation`);
              setPaymentError('Auto-liquidation cancelled: LTV recovered below liquidation threshold');
              setProcessingPayment(false);
              return;
            }
            
            // Update the payment details with current amount if it changed significantly
            const originalAmount = paymentDetails.amountSats;
            if (Math.abs(currentAvailableBalance - originalAmount) > originalAmount * 0.05) { // 5% threshold
              systemLogs.logInfo(`💰 Liquidation amount updated: ${formatSats(originalAmount)} → ${formatSats(currentAvailableBalance)} (price change impact)`);
              paymentDetails.amountSats = currentAvailableBalance;
              
              // Update the modal display
              setCurrentInvoice(prev => ({
                ...prev,
                amountSats: currentAvailableBalance,
                updatedAmount: true,
                originalAmount: originalAmount
              }));
            }
          } catch (error) {
            systemLogs.logWarning('Could not update liquidation amount during polling', error.message);
          }
        }
        
        const paymentStatus = await walletState.voltageAPI.checkPayment(paymentHash);
        
        // Log more detailed status information
        systemLogs.logDebug(`🐛Payment ${paymentHash.substring(0, 8)}... status: ${paymentStatus.status}, direction: ${paymentStatus.direction}`);
        systemLogs.logDebug(`🐛Poll attempt ${pollAttempts}/${maxAttempts}: Payment status = ${paymentStatus.status}, paid = ${paymentStatus.paid}`);
        
        // For auto-liquidations (sending payments), check for completed status
        const isPaymentComplete = paymentStatus.paid || 
          (paymentStatus.status === 'completed') || 
          (paymentStatus.status === 'succeeded');
        
        if (isPaymentComplete) {
          systemLogs.logSuccess(`✅ Payment confirmed! Hash: ${paymentHash.substring(0, 8)}... Status: ${paymentStatus.status}`);
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
      updateLoan(prev => ({
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
      
      systemLogs.logDebug(`🐛 Adding liquidation transaction: ${JSON.stringify(liquidationTx)}`);
      addTransaction(liquidationTx);
      systemLogs.logSuccess(`✅ Liquidation transaction added to history`);
      
      // Update custodial wallet balance after liquidation
      updateCustodialWalletBalance();
      
    } else {
      systemLogs.logSuccess(`✅ Top-up completed: ${formatSats(paidAmountSats)} added to collateral`);
      
      // For regular top-ups (custodial_funding or incoming), add to collateral
      updateLoan(prev => ({
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
      
      addTransaction(newTx);
      
      // Update custodial wallet balance after funding
      if (paymentConfirmation.paymentType === 'custodial_funding') {
        updateCustodialWalletBalance();
      }
    }

    setProcessingPayment(false);
    setPaymentError(null);
    
    // Auto-close modal after successful payment (with a brief delay to show success state)
    setTimeout(() => {
      setShowInvoice(false);
      setCurrentInvoice(null);
      systemLogs.logInfo('✅ Payment modal auto-closed after successful completion');
    }, 2000); // 2 second delay to show success state
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
   * Demo function to simulate a market crash 
   * Calibrated to trigger Lightning liquidation (85%) and potentially loan liquidation (90%)
   */
  const simulateCrash = () => {
    // Calculate crash needed to hit exactly 87% LTV (between 85% and 90%)
    const targetLTV = 87; // Right in the danger zone
    const targetCollateralValue = loan.principal / (targetLTV / 100);
    const targetPrice = targetCollateralValue / (metrics?.totalCollateralSats / 100_000_000);
    const crashPrice = Math.max(20000, targetPrice); // Don't go below minimum
    
    const crashPercent = ((btcPrice - crashPrice) / btcPrice * 100);
    systemLogs.logWarning(`📉 Market crash simulated: BTC price dropped from $${btcPrice.toLocaleString()} to $${Math.round(crashPrice).toLocaleString()} (-${crashPercent.toFixed(1)}%)`);
    systemLogs.logWarning(`📊 Demo Mode: This should trigger Lightning liquidation (85%) - monitor for potential loan liquidation (90%)`);
    setBtcPrice(crashPrice);
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
    transactionStorage.clearAllData(); // Also clear transaction history
    setShowDeleteConfirmation(false);
    systemLogs.logSuccess('✅ Wallet deleted and all demo data reset to defaults');
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
  
  // Show loading state while initializing
  if (!transactionStorageReady || !walletState.initialLoadComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                      <div className="text-xl">Loading Loan Lightning Topup Visualizer...</div>
            <div className="text-gray-400 text-sm mt-2 space-y-1">
              <div>Restoring wallet connections...</div>
              <div>Loading transaction history...</div>
              <div>Initializing demo state...</div>
            </div>
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
              <span className="hidden sm:inline">⚡ Loan Lightning Topup Visualizer</span>
              <span className="sm:hidden">⚡ Loan LTV</span>
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
        {/* Loan Liquidation Alert */}
        {metrics?.gameStatus === 'loan_liquidated' && (
          <div className="mb-6 bg-black border-2 border-red-600 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">💀</div>
            <h3 className="text-2xl font-bold text-red-500 mb-2">LOAN LIQUIDATED</h3>
            <p className="text-red-300 mb-4">
              Your main loan has been liquidated at <strong>{metrics.ltv.toFixed(1)}% LTV</strong>
            </p>
            <p className="text-gray-400 text-sm">
              Use "Reset All Data" to start fresh. Try to trigger Lightning wallet liquidation (85%) without hitting loan liquidation (90%)!
            </p>
          </div>
        )}

        {/* Lightning Zone Alert */}
        {metrics?.gameStatus === 'lightning_zone' && metrics?.gameStatus !== 'loan_liquidated' && (
          <div className="mb-6 bg-orange-900/20 border border-orange-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-orange-500 text-2xl">⚡</div>
              <div>
                <h3 className="text-lg font-semibold text-orange-500">Lightning Liquidation Zone!</h3>
                <p className="text-orange-300 mt-1">
                  LTV is at <strong>{metrics.ltv.toFixed(1)}%</strong> - Your Lightning wallet is at risk of auto-liquidation at 85%.
                  <br />
                  <span className="text-yellow-300">📊 Demo Challenge: Can you trigger Lightning liquidation without hitting loan liquidation (90%)?</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Critical LTV warning alert */}
        {metrics?.ltvStatus === 'warning' && metrics?.gameStatus === 'safe' && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-500">Approaching Danger Zone</h3>
                <p className="text-yellow-300 mt-1">
                  Your LTV is getting higher. Add collateral or be ready for the Lightning liquidation scenario!
                  Required top-up to be safe: <strong>{formatSats(metrics.requiredTopupSats)}</strong>
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
          
          {/* Total Collateral Value Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wider mb-2">
              Total Collateral Value
              <Tooltip content="Total collateral includes main loan collateral + Lightning wallet balance. Both contribute to LTV calculation.">
                <QuestionMarkIcon />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold">${metrics?.totalCollateralValueUSD.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <div className="text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Main:</span>
                <span>{formatSats(loan.collateral.amountSats)}</span>
              </div>
              {metrics?.lightningWalletSats > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>⚡ Wallet:</span>
                  <span>{formatSats(metrics.lightningWalletSats)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* LTV Ratio Card with game mechanics */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wider mb-2">
              Current LTV
              <Tooltip content="Demo Challenge: Test market volatility to trigger Lightning wallet liquidation (85% LTV) without triggering main loan liquidation (90% LTV). This demonstrates sophisticated risk management with dual liquidation thresholds.">
                <QuestionMarkIcon />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold">{metrics?.ltv.toFixed(1)}%</div>
            
            {/* Game status indicator */}
            <div className="text-gray-500 space-y-1">
              {metrics?.gameStatus === 'loan_liquidated' ? (
                <div className="text-red-400 font-semibold">💀 LOAN LIQUIDATED</div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>⚡ Lightning:</span>
                    <span className={metrics?.ltv >= 85 ? 'text-red-400' : 'text-gray-400'}>{metrics?.lightningLiquidationThreshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💀 Loan:</span>
                    <span className={metrics?.ltv >= 90 ? 'text-red-400' : 'text-gray-400'}>{metrics?.loanLiquidationThreshold}%</span>
                  </div>
                </>
              )}
            </div>
            
            {/* LTV Visual Meter with dual thresholds */}
            <div className="mt-4">
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                  style={{ width: `${Math.min(metrics?.ltv || 0, 100)}%` }}
                />
                {/* Lightning liquidation threshold (85%) */}
                <div className="absolute top-0 h-full border-l-2 border-orange-400" style={{ left: '85%' }}>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
                {/* Loan liquidation threshold (90%) */}
                <div className="absolute top-0 h-full border-l-2 border-red-600" style={{ left: '90%' }}>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>Safe</span>
                <span className="text-orange-400">⚡85%</span>
                <span className="text-red-400">💀90%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lightning Top-up Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="text-[#f7931a]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 3L4 9V21H20V9L12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-medium">Lightning Network Top-Up</h2>
              <Tooltip content="DEMO MECHANICS: Lightning wallet funds are included in your total collateral and affect LTV calculation. When LTV hits 85%, your Lightning wallet auto-liquidates. When LTV hits 90%, your main loan liquidates. Demo Challenge: Can you trigger Lightning liquidation without loan liquidation?">
                <QuestionMarkIcon />
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              {/* Wallet status indicator */}
              {walletState.walletSetup ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {walletState.walletConfig.type === 'custodial' 
                      ? `Custodial (${formatSats(walletState.custodialWallet?.balanceSats || 0)})` 
                      : `Self-Custodial (${walletState.walletConfig.method.toUpperCase()})`
                    }
                  </span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-[#3a2a1a] text-[#f7931a] rounded-full text-sm">Setup Required</div>
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
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="text-[#f7931a] mt-0.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M16 10C16 8.89543 15.1046 8 14 8H10C8.89543 8 8 8.89543 8 10V10C8 11.1046 8.89543 12 10 12H14C15.1046 12 16 11.1046 16 10V10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M8 3V6M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-200">
                  Configure your Lightning wallet to enable instant top-ups for your loan collateral.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Protect your position from liquidation with fast, low-fee transactions.
                </p>
              </div>
            </div>
          )}

          {/* Tab interface */}
          <div className="mb-6">
            <div className="grid grid-cols-2 bg-gray-800 rounded-md overflow-hidden mb-4">
                              <button
                  className={`py-2 text-center text-sm transition-colors ${
                    activeTab === "custom" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("custom")}
                >
                  Custom Amount
                </button>
                <button
                  className={`py-2 text-center text-sm transition-colors ${
                    activeTab === "presets" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("presets")}
                >
                  Quick Presets
                </button>
            </div>

            {activeTab === "custom" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="topup-amount" className="text-sm text-gray-300">
                    Top-up Amount
                  </label>
                  {isValidSatsAmount(topupAmount) && (
                    <span className="text-sm text-gray-400">≈ ${satsToUSD(topupAmount, btcPrice).toFixed(2)} USD</span>
                  )}
                </div>
                <div className="flex">
                  <input
                    id="topup-amount"
                    type="text"
                    inputMode="numeric"
                    value={topupInput}
                    onChange={(e) => handleTopupInputChange(e.target.value)}
                    className="flex-1 bg-black border border-gray-700 text-white rounded-l-md px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter amount"
                  />
                  <div className="bg-gray-800 border border-l-0 border-gray-700 px-4 flex items-center rounded-r-md text-gray-300 text-sm">
                    sats
                  </div>
                </div>
              </div>
            )}

            {activeTab === "presets" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "100K sats", value: "100000", usd: satsToUSD(100000, btcPrice).toFixed(2) },
                    { label: "500K sats", value: "500000", usd: satsToUSD(500000, btcPrice).toFixed(2) },
                    { label: "1M sats", value: "1000000", usd: satsToUSD(1000000, btcPrice).toFixed(2) },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      className={`bg-gray-800 border ${
                        topupInput === preset.value ? "border-orange-500" : "border-gray-700"
                      } rounded-md py-2 px-3 text-center hover:bg-gray-700 transition-colors cursor-pointer`}
                      onClick={() => handleTopupInputChange(preset.value)}
                    >
                      <div className="text-sm">{preset.label}</div>
                      <div className="text-xs text-gray-400">${preset.usd}</div>
                    </button>
                  ))}
                </div>
                {metrics?.requiredTopupSats > 0 && (
                  <button
                    onClick={() => handleTopupInputChange(metrics.requiredTopupSats.toString())}
                    className={`w-full bg-gray-800 border ${
                      topupInput === metrics.requiredTopupSats.toString() ? "border-red-500" : "border-red-600"
                    } rounded-md py-2 px-3 text-center hover:bg-red-900/20 transition-colors cursor-pointer`}
                  >
                    <div className="text-sm text-red-400">Required: {formatSats(metrics.requiredTopupSats, false)}</div>
                    <div className="text-xs text-red-500">${satsToUSD(metrics.requiredTopupSats, btcPrice).toFixed(2)}</div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={initiateTopUp}
              disabled={processingPayment || !isValidSatsAmount(topupAmount) || topupAmount <= 0}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-medium h-12 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <div className="mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" fill="currentColor"/>
                </svg>
              </div>
              {walletState.walletSetup ? 'Top-up via Lightning' : 'Setup Lightning Wallet'}
            </button>

            {/* Wallet management buttons (only shown when wallet is set up) */}
            {walletState.walletSetup && (
              <div className="flex gap-3">
                {/* Open Wallet button (for custodial wallets only) */}
                {walletState.walletConfig?.type === 'custodial' && (
                  <button
                    onClick={openVoltageWallet}
                    className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Wallet
                  </button>
                )}
                
                {/* Delete Wallet button */}
                <button
                  onClick={handleDeleteWallet}
                  className="flex-1 px-4 py-2 bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {walletState.walletConfig?.type === 'custodial' ? 'Delete Wallet' : 'Change Wallet'}
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-500 mt-3">
            This is optional. You can still manage your loan without Lightning top-ups.
          </p>
        </div>

        {/* Transaction History */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
          
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Add Lightning funds or trigger liquidations to see transaction history</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-center ${
                      tx.type === 'loan_liquidation' ? 'bg-black border-2 border-red-600 text-red-400' :
                      tx.type === 'auto_liquidation' ? 'bg-red-500/20 text-red-400' :
                      tx.type === 'lightning_topup' ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type === 'loan_liquidation' ? '💀' :
                       tx.type === 'auto_liquidation' ? '🚨' : 
                       tx.type === 'lightning_topup' ? <Zap className="w-5 h-5" /> : '📥'}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {tx.type === 'loan_liquidation' ? `💀 LOAN LIQUIDATED (LTV ${tx.ltvAtLiquidation?.toFixed(1)}%)` :
                         tx.type === 'auto_liquidation' ? `🚨 Lightning Auto-Liquidation (LTV ${tx.ltvAtLiquidation?.toFixed(1)}%)` :
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
              ))
            )}
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
                  {walletState.walletConfig?.type === 'custodial' ? 'Voltage Custodial Wallet' : 'Self-Custodial Wallet'}
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
              min="20000"
              max="140000"
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
📉 Market Crash
          </button>
          
          <button
            onClick={() => {
              if (confirm('⚠️ This will reset ALL data (wallet, transactions, loan state) to defaults. Continue?')) {
                walletState.resetWalletSetup();
                transactionStorage.clearAllData();
                systemLogs.logWarning('🗑️ All demo data reset to defaults');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
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