/**
 * Custom hook for Voltage Pay API interactions
 * Handles wallet operations for the custodial Lightning wallet option
 * All amounts are handled in satoshis internally but converted to millisats for API
 * 
 * Supports user wallet creation and management via Voltage API
 */

import { satsToMillisats, millisatsToSats } from '../utils/bitcoinUnits';

// Voltage API configuration
const VOLTAGE_CONFIG = {
  baseUrl: '/api/voltage', // Uses Vite proxy in development
  directUrl: import.meta.env.VITE_VOLTAGE_API_URL || 'https://voltageapi.com/v1',
  apiKey: import.meta.env.VITE_VOLTAGE_API_KEY,
  organizationId: import.meta.env.VITE_VOLTAGE_ORGANIZATION_ID,
  environmentId: import.meta.env.VITE_VOLTAGE_ENVIRONMENT_ID,
  lineOfCreditId: import.meta.env.VITE_VOLTAGE_LINE_OF_CREDIT_ID,
  network: import.meta.env.VITE_VOLTAGE_NETWORK || 'mutinynet' // mainnet, testnet3, mutinynet
};

// Local storage keys
const STORAGE_KEYS = {
  USER_WALLET: 'voltage_user_wallet',
  USER_ID: 'voltage_user_id'
};

export const useVoltageAPI = (logger = null) => {
  const log = (level, message, data) => {
    if (logger) {
      logger[`log${level.charAt(0).toUpperCase() + level.slice(1)}`]?.(message, data);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
  };

  /**
   * Make authenticated API request to Voltage
   */
  const makeVoltageRequest = async (endpoint, options = {}) => {
    const url = `${VOLTAGE_CONFIG.baseUrl}${endpoint}`;
    const headers = {
      'X-Api-Key': VOLTAGE_CONFIG.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Voltage API error: ${response.status} - ${errorText}`);
    }

    // Handle 202 responses (async operations) that may not have a body
    if (response.status === 202) {
      return null;
    }

    return await response.json();
  };

  /**
   * Get user wallet from localStorage
   */
  const getUserWallet = () => {
    try {
      const wallet = localStorage.getItem(STORAGE_KEYS.USER_WALLET);
      return wallet ? JSON.parse(wallet) : null;
    } catch (error) {
      log('error', 'Failed to get user wallet from localStorage', error.message);
      return null;
    }
  };

  /**
   * Save user wallet to localStorage
   */
  const saveUserWallet = (wallet) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_WALLET, JSON.stringify(wallet));
      log('debug', 'User wallet saved to localStorage');
    } catch (error) {
      log('error', 'Failed to save user wallet to localStorage', error.message);
    }
  };

  /**
   * Save user ID to localStorage
   */
  const saveUserId = (userId) => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  };

  /**
   * Clear user data from localStorage
   */
  const clearUserData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_WALLET);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    log('info', 'User data cleared from localStorage');
  };

  /**
   * Creates a new wallet in Voltage
   */
  const createWallet = async (walletName = null) => {
    try {
      const randomId = Math.random().toString(36).substring(2, 8);
      const defaultWalletName = walletName || `LTV Loan Wallet ${randomId}`;
      
      log('wallet', `🔧 Creating new Voltage wallet: ${defaultWalletName}`);
      
      const walletId = crypto.randomUUID();
      const walletData = {
        id: walletId,
        environment_id: VOLTAGE_CONFIG.environmentId,
        line_of_credit_id: VOLTAGE_CONFIG.lineOfCreditId,
        name: defaultWalletName,
        network: VOLTAGE_CONFIG.network,
        limit: 100000000, // 100M msats = 0.1 BTC limit
        metadata: {
          created_by: "loan_ltv_demo",
          created_at: new Date().toISOString(),
          purpose: "Lightning loan collateral management"
        }
      };
      
      await makeVoltageRequest(
        `/organizations/${VOLTAGE_CONFIG.organizationId}/wallets`,
        {
          method: 'POST',
          body: JSON.stringify(walletData)
        }
      );
      
      // Voltage returns 202 for async wallet creation
      log('success', `✅ Wallet creation requested: ${defaultWalletName} (${walletId})`);
      
      // Save wallet data locally
      const savedWalletData = {
        id: walletId,
        name: defaultWalletName,
        organization_id: VOLTAGE_CONFIG.organizationId,
        environment_id: VOLTAGE_CONFIG.environmentId,
        network: VOLTAGE_CONFIG.network,
        created_at: new Date().toISOString()
      };
      
      saveUserWallet(savedWalletData);
      saveUserId(walletId);
      
      return savedWalletData;
    } catch (error) {
      log('error', 'Failed to create wallet', error.message);
      throw error;
    }
  };

  /**
   * Gets or creates a user wallet
   */
  const getOrCreateUserWallet = async () => {
    // Check if we already have a user wallet
    let userWallet = getUserWallet();
    
    if (userWallet) {
      log('info', `📖 Using existing user wallet: ${userWallet.name} (${userWallet.id})`);
      
      // Verify the wallet still exists and get current balance
      try {
        const walletDetails = await getWalletDetails(userWallet.id);
        return {
          ...userWallet,
          ...walletDetails
        };
      } catch (error) {
        log('warning', 'Existing wallet not accessible, creating new one', error.message);
        clearUserData();
        userWallet = null;
      }
    }
    
    if (!userWallet) {
      log('info', '🆕 No existing wallet found, creating new user wallet...');
      const wallet = await createWallet();
      
      // Wait a moment for wallet creation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const walletDetails = await getWalletDetails(wallet.id);
        return {
          ...wallet,
          ...walletDetails
        };
      } catch (error) {
        // If we can't get details yet, return basic wallet info
        log('warning', 'Could not get wallet details immediately, returning basic info', error.message);
        return {
          ...wallet,
          balanceSats: 0,
          balanceMillisats: 0,
          balances: []
        };
      }
    }
  };

  /**
   * Fetches wallet details from Voltage API
   */
  const getWalletDetails = async (walletId = null) => {
    try {
      const targetWalletId = walletId || getUserWallet()?.id;
      if (!targetWalletId) {
        throw new Error('No wallet ID available');
      }

      log('wallet', `🔍 Fetching wallet details for: ${targetWalletId}`);
      
      const wallet = await makeVoltageRequest(
        `/organizations/${VOLTAGE_CONFIG.organizationId}/wallets/${targetWalletId}`
      );
      
      // Calculate balance in sats from the balances array
      let balanceMillisats = 0;
      if (wallet.balances && wallet.balances.length > 0) {
        const btcBalance = wallet.balances.find(b => b.currency === 'btc');
        if (btcBalance && btcBalance.available) {
          balanceMillisats = btcBalance.available.amount;
        }
      }
      
      const result = {
        ...wallet,
        balanceSats: millisatsToSats(balanceMillisats),
        balanceMillisats: balanceMillisats
      };
      
      log('success', `💰 Wallet balance: ${result.balanceSats} sats (${result.balanceMillisats} msat)`);
      return result;
    } catch (error) {
      log('error', 'Failed to get wallet details', error.message);
      throw error;
    }
  };

  /**
   * Creates a Lightning invoice using Voltage API
   * @param {number} amountSats - Amount in satoshis
   * @param {string} description - Invoice description
   * @returns {Promise<Object>} Invoice details including payment_request
   */
  const createInvoice = async (amountSats, description = 'Lightning topup') => {
    try {
      const userWallet = getUserWallet();
      if (!userWallet) {
        throw new Error('No user wallet found. Please setup custodial wallet first.');
      }

      log('payment', `⚡ Creating invoice for ${amountSats} sats: "${description}"`);
      
      const paymentId = crypto.randomUUID();
      const paymentData = {
        id: paymentId,
        wallet_id: userWallet.id,
        amount_msats: satsToMillisats(amountSats),
        currency: "btc",
        description: description,
        payment_kind: "bolt11"
      };
      
      await makeVoltageRequest(
        `/organizations/${VOLTAGE_CONFIG.organizationId}/environments/${VOLTAGE_CONFIG.environmentId}/payments`,
        {
          method: 'POST',
          body: JSON.stringify(paymentData)
        }
      );
      
      // Voltage returns 202 for async payment creation, need to fetch details
      // Wait a moment for the payment to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentDetails = await getPaymentDetails(paymentId);
      
      const result = {
        payment_request: paymentDetails.data.payment_request,
        payment_hash: paymentDetails.id, // Use payment ID as hash
        checking_id: paymentDetails.id,
        amountSats,
        amountMillisats: satsToMillisats(amountSats)
      };
      
      log('success', `✅ Invoice created successfully for ${amountSats} sats`);
      return result;
    } catch (error) {
      log('error', 'Failed to create invoice', error.message);
      throw error;
    }
  };

  /**
   * Gets payment details from Voltage API
   */
  const getPaymentDetails = async (paymentId) => {
    try {
      const payment = await makeVoltageRequest(
        `/organizations/${VOLTAGE_CONFIG.organizationId}/environments/${VOLTAGE_CONFIG.environmentId}/payments/${paymentId}`
      );
      return payment;
    } catch (error) {
      log('error', 'Failed to get payment details', error.message);
      throw error;
    }
  };

  /**
   * Checks payment status for a given payment ID
   * @param {string} paymentId - Payment ID to check
   * @returns {Promise<Object>} Payment status including paid boolean
   */
  const checkPayment = async (paymentId) => {
    try {
      const payment = await getPaymentDetails(paymentId);
      
      // Debug: Log the actual status to understand what Voltage returns
      log('debug', `Payment ${paymentId} status: ${payment.status}`, payment);
      
      // Convert status to paid boolean based on Voltage API documentation
      // For receiving payments: 'completed' means payment received successfully
      // For sending payments: 'completed' means payment sent successfully
      const paid = payment.status === 'completed' || payment.status === 'succeeded';
      
      // Add sats conversion if amount is present
      if (payment.data && payment.data.amount_msats) {
        payment.amountSats = millisatsToSats(payment.data.amount_msats);
        payment.amountMillisats = payment.data.amount_msats;
      }
      
      return {
        ...payment,
        paid
      };
    } catch (error) {
      log('error', 'Failed to check payment', error.message);
      throw error;
    }
  };

  /**
   * Sends a payment from the user's Voltage wallet
   * @param {string} bolt11Invoice - BOLT11 invoice to pay
   * @param {number} maxFeeSats - Maximum fee in satoshis
   * @returns {Promise<Object>} Payment details
   */
  const sendPayment = async (bolt11Invoice, maxFeeSats = null) => {
    try {
      const userWallet = getUserWallet();
      if (!userWallet) {
        throw new Error('No user wallet found. Please setup custodial wallet first.');
      }

      log('payment', `⚡ Sending payment via Voltage wallet`);
      
      const paymentId = crypto.randomUUID();
      const paymentData = {
        id: paymentId,
        wallet_id: userWallet.id,
        currency: "btc",
        type: "bolt11",
        data: {
          payment_request: bolt11Invoice,
          ...(maxFeeSats && { max_fee_msats: satsToMillisats(maxFeeSats) })
        }
      };
      
      await makeVoltageRequest(
        `/organizations/${VOLTAGE_CONFIG.organizationId}/environments/${VOLTAGE_CONFIG.environmentId}/payments`,
        {
          method: 'POST',
          body: JSON.stringify(paymentData)
        }
      );
      
      log('success', `✅ Payment sent successfully`);
      return {
        payment_hash: paymentId,
        checking_id: paymentId
      };
    } catch (error) {
      log('error', 'Failed to send payment', error.message);
      throw error;
    }
  };

  /**
   * Resolves a Lightning Address to get payment request
   */
  const resolveLightningAddress = async (lightningAddress) => {
    const parts = lightningAddress.split('@');
    if (parts.length !== 2) {
      throw new Error('Invalid Lightning Address format.');
    }
    const [user, domain] = parts;
    const lnurlPayUrl = `https://${domain}/.well-known/lnurlp/${user}`;
    return lnurlPayUrl;
  };

  /**
   * Sends a payment to a Lightning Address using Voltage wallet
   */
  const sendPaymentToLightningAddress = async (lightningAddress, amountSats, comment = 'Loan LTV Top-up') => {
    if (amountSats <= 0) {
      throw new Error('Payment amount must be greater than 0 satoshis.');
    }

    const userWallet = getUserWallet();
    if (!userWallet) {
      throw new Error('No user wallet found. Please setup custodial wallet first.');
    }

    try {
      // 1. Resolve Lightning Address to LNURL-pay URL
      const lnurlPayUrl = await resolveLightningAddress(lightningAddress);
      
      // 2. Fetch LNURL-pay parameters
      const lnurlPayParamsRes = await fetch(lnurlPayUrl);
      if (!lnurlPayParamsRes.ok) {
        throw new Error(`Failed to fetch LNURL-pay params: ${lnurlPayParamsRes.statusText}`);
      }
      const lnurlPayParams = await lnurlPayParamsRes.json();

      if (lnurlPayParams.tag !== 'payRequest') {
        throw new Error('Invalid LNURL-pay response: Missing or incorrect tag.');
      }

      // 3. Get the actual invoice from the LNURL-pay callback
      const amountMillisats = satsToMillisats(amountSats);
      const callbackUrl = new URL(lnurlPayParams.callback);
      callbackUrl.searchParams.append('amount', amountMillisats.toString());
      if (comment) {
        callbackUrl.searchParams.append('comment', comment);
      }
      
      const invoiceRes = await fetch(callbackUrl.toString());
      if (!invoiceRes.ok) {
        throw new Error(`Failed to fetch invoice: ${invoiceRes.statusText}`);
      }
      const invoiceData = await invoiceRes.json();

      if (!invoiceData.pr) {
        throw new Error('Invalid invoice response: Missing payment request.');
      }

      // 4. Send payment using Voltage API
      const paymentResult = await sendPayment(invoiceData.pr);
      
      return {
        ...paymentResult,
        amountSats,
        lightningAddress,
        comment,
        bolt11Invoice: invoiceData.pr
      };

    } catch (error) {
      log('error', `Failed to send payment to ${lightningAddress}`, error.message);
      throw error;
    }
  };

  return {
    // Wallet management
    getOrCreateUserWallet,
    clearUserData,
    getUserWallet,
    
    // Standard wallet operations
    getWalletDetails,
    createInvoice,
    checkPayment,
    sendPayment,
    sendPaymentToLightningAddress,
    
    // Config
    config: VOLTAGE_CONFIG
  };
}; 