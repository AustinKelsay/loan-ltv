/**
 * Custom hook for LNbits API interactions
 * Handles wallet operations for the custodial Lightning wallet option
 * All amounts are handled in satoshis internally
 * 
 * Now supports user wallet creation via usermanager API
 */

import { satsToMillisats, millisatsToSats } from '../utils/bitcoinUnits';

// LNbits Admin configuration (for managing user wallets)
const LNBITS_ADMIN_CONFIG = {
  baseUrl: import.meta.env.VITE_LNBITS_URL,
  adminWalletId: import.meta.env.VITE_LNBITS_ADMIN_WALLET_ID,
  adminKey: import.meta.env.VITE_LNBITS_ADMIN_KEY,
  adminInvoiceKey: import.meta.env.VITE_LNBITS_ADMIN_INVOICE_KEY,
  userManagerAdminKey: import.meta.env.VITE_LNBITS_USER_MANAGER_ADMIN_KEY
};

// Local storage keys
const STORAGE_KEYS = {
  USER_WALLET: 'lnbits_user_wallet',
  USER_ID: 'lnbits_user_id'
};

export const useLNbitsAPI = (logger = null) => {
  const log = (level, message, data) => {
    if (logger) {
      logger[`log${level.charAt(0).toUpperCase() + level.slice(1)}`]?.(message, data);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }
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
   * Creates a new user in LNbits usermanager
   */
  const createUser = async (userName = null) => {
    try {
      const randomId = Math.random().toString(36).substring(2, 8);
      const defaultUserName = userName || `loan_user_${randomId}`;
      const walletName = `LTV Loan Wallet`;
      
      log('wallet', `🔧 Creating new LNbits user: ${defaultUserName}`);
      
      const response = await fetch(`${LNBITS_ADMIN_CONFIG.baseUrl}/usermanager/api/v1/users`, {
        method: 'POST',
        headers: {
          'X-Api-Key': LNBITS_ADMIN_CONFIG.adminKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_name: defaultUserName,
          wallet_name: walletName,
          admin_id: LNBITS_ADMIN_CONFIG.userManagerAdminKey,
          email: "",
          password: "",
          extra: {
            created_by: "loan_ltv_demo",
            created_at: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
      }
      
      const userData = await response.json();
      log('success', `✅ User created successfully: ${userData.name}`);
      
      // Save user ID
      saveUserId(userData.id);
      
      // Extract wallet data from the response
      if (userData.wallets && userData.wallets.length > 0) {
        const userWallet = userData.wallets[0];
        const walletData = {
          id: userWallet.id,
          name: userWallet.name,
          user: userWallet.user,
          adminkey: userWallet.adminkey,
          inkey: userWallet.inkey,
          created_at: new Date().toISOString()
        };
        
        saveUserWallet(walletData);
        log('success', `💰 User wallet created: ${userWallet.name} (${userWallet.id})`);
        
        return {
          user: userData,
          wallet: walletData
        };
      } else {
        throw new Error('No wallet found in user creation response');
      }
    } catch (error) {
      log('error', 'Failed to create user', error.message);
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
        const walletDetails = await getWalletDetailsForUser(userWallet);
        return walletDetails;
      } catch (error) {
        log('warning', 'Existing wallet not accessible, creating new one', error.message);
        clearUserData();
        userWallet = null;
      }
    }
    
    if (!userWallet) {
      log('info', '🆕 No existing wallet found, creating new user wallet...');
      const { wallet } = await createUser();
      const walletDetails = await getWalletDetailsForUser(wallet);
      return walletDetails;
    }
  };

  /**
   * Fetches wallet details for a specific user wallet
   */
  const getWalletDetailsForUser = async (userWallet) => {
    try {
      log('wallet', `🔍 Fetching wallet details for: ${userWallet.name}`);
      
      const response = await fetch(`${LNBITS_ADMIN_CONFIG.baseUrl}/api/v1/wallet`, {
        headers: {
          'X-Api-Key': userWallet.inkey // Use user's invoice key
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const wallet = await response.json();
      
      // Convert balance from millisats to sats for our app
      const result = {
        ...wallet,
        ...userWallet, // Include user wallet metadata
        balanceSats: millisatsToSats(wallet.balance),
        balanceMillisats: wallet.balance
      };
      
      log('success', `💰 Wallet balance: ${result.balanceSats} sats (${result.balanceMillisats} msat)`);
      return result;
    } catch (error) {
      log('error', 'Failed to get wallet details', error.message);
      throw error;
    }
  };

  /**
   * Fetches wallet details (legacy method for compatibility)
   */
  const getWalletDetails = async () => {
    const userWallet = getUserWallet();
    if (userWallet) {
      return await getWalletDetailsForUser(userWallet);
    } else {
      // Create new wallet if none exists
      return await getOrCreateUserWallet();
    }
  };

  /**
   * Creates a Lightning invoice using LNbits API for the user's wallet
   * @param {number} amountSats - Amount in satoshis
   * @param {string} memo - Invoice description
   * @returns {Promise<Object>} Invoice details including payment_request and payment_hash
   */
  const createInvoice = async (amountSats, memo = 'Lightning topup') => {
    try {
      // Get user wallet
      const userWallet = getUserWallet();
      if (!userWallet) {
        throw new Error('No user wallet found. Please setup custodial wallet first.');
      }

      log('payment', `⚡ Creating invoice for ${amountSats} sats: "${memo}"`);
      
      // LNbits API expects SATS for invoice creation, not millisats!
      const requestBody = {
        out: false, // incoming payment
        amount: amountSats, // LNbits expects SATS for invoice creation
        memo: memo,
        expiry: 3600 // 1 hour expiry
      };
      
      const response = await fetch(`${LNBITS_ADMIN_CONFIG.baseUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'X-Api-Key': userWallet.inkey, // Use user's invoice key
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const invoice = await response.json();
      
      // Add our sats amount for convenience
      const result = {
        ...invoice,
        amountSats,
        amountMillisats: satsToMillisats(amountSats) // Convert for our internal use
      };
      
      log('success', `✅ Invoice created successfully for ${amountSats} sats`);
      return result;
    } catch (error) {
      log('error', 'Failed to create invoice', error.message);
      throw error;
    }
  };

  /**
   * Checks payment status for a given payment hash using user's wallet
   * @param {string} paymentHash - Payment hash to check
   * @returns {Promise<Object>} Payment status including paid boolean and amount info
   */
  const checkPayment = async (paymentHash) => {
    try {
      // Get user wallet
      const userWallet = getUserWallet();
      if (!userWallet) {
        throw new Error('No user wallet found. Please setup custodial wallet first.');
      }

      const response = await fetch(`${LNBITS_ADMIN_CONFIG.baseUrl}/api/v1/payments/${paymentHash}`, {
        headers: {
          'X-Api-Key': userWallet.inkey // Use user's invoice key
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const payment = await response.json();
      
      // Add sats conversion if amount is present
      if (payment.amount) {
        payment.amountSats = millisatsToSats(Math.abs(payment.amount));
        payment.amountMillisats = Math.abs(payment.amount);
      }
      
      return payment;
    } catch (error) {
      log('error', 'Failed to check payment', error.message);
      throw error;
    }
  };

  /**
   * Resolves a Lightning Address to an LNURL-pay URL.
   * @param {string} lightningAddress - e.g., user@domain.com
   * @returns {string} LNURL-pay URL
   * @throws {Error} if the Lightning Address is invalid or the domain doesn't support LNURL-pay
   */
  const resolveLightningAddress = async (lightningAddress) => {
    const parts = lightningAddress.split('@');
    if (parts.length !== 2) {
      throw new Error('Invalid Lightning Address format.');
    }
    const [user, domain] = parts;
    const lnurlPayUrl = `https://${domain}/.well-known/lnurlp/${user}`;
    
    // Check if the URL is valid and returns expected LNURL data (optional but good practice)
    // For this example, we'll assume it's valid if it looks like a URL
    // In a real app, you would fetch this URL and check its content for `tag: "payRequest"`
    return lnurlPayUrl;
  };

  /**
   * Sends a payment from the user's LNbits wallet to a Lightning Address.
   * @param {string} lightningAddress - The recipient's Lightning Address (e.g., austin@bitcoinpleb.dev)
   * @param {number} amountSats - Amount to send in satoshis
   * @param {string} comment - Optional comment for the payment
   * @returns {Promise<Object>} Payment details from LNbits, including payment_hash
   * @throws {Error} if any step of the payment process fails
   */
  const sendPaymentToLightningAddress = async (lightningAddress, amountSats, comment = 'Loan LTV Top-up') => {
    if (amountSats <= 0) {
      throw new Error('Payment amount must be greater than 0 satoshis.');
    }

    // Get user wallet
    const userWallet = getUserWallet();
    if (!userWallet) {
      throw new Error('No user wallet found. Please setup custodial wallet first.');
    }

    try {
      // 1. Resolve Lightning Address to LNURL-pay URL
      const lnurlPayUrl = await resolveLightningAddress(lightningAddress);
      
      // 2. Fetch LNURL-pay parameters from the resolved URL
      const lnurlPayParamsRes = await fetch(lnurlPayUrl);
      if (!lnurlPayParamsRes.ok) {
        throw new Error(`Failed to fetch LNURL-pay params from ${lnurlPayUrl}: ${lnurlPayParamsRes.statusText}`);
      }
      const lnurlPayParams = await lnurlPayParamsRes.json();

      if (lnurlPayParams.tag !== 'payRequest') {
        throw new Error('Invalid LNURL-pay response: Missing or incorrect tag.');
      }
      if (!lnurlPayParams.callback || typeof lnurlPayParams.callback !== 'string') {
        throw new Error('Invalid LNURL-pay response: Missing or invalid callback URL.');
      }

      // 3. Get the actual invoice from the LNURL-pay callback URL
      const amountMillisats = satsToMillisats(amountSats);
      const callbackUrl = new URL(lnurlPayParams.callback);
      callbackUrl.searchParams.append('amount', amountMillisats.toString());
      if (comment) {
        callbackUrl.searchParams.append('comment', comment);
      }
      
      const invoiceRes = await fetch(callbackUrl.toString());
      if (!invoiceRes.ok) {
        throw new Error(`Failed to fetch invoice from LNURL-pay callback ${callbackUrl.toString()}: ${invoiceRes.statusText}`);
      }
      const invoiceData = await invoiceRes.json();

      if (!invoiceData.pr || typeof invoiceData.pr !== 'string') {
        throw new Error('Invalid invoice response from LNURL-pay callback: Missing or invalid payment request (pr).');
      }
      const bolt11Invoice = invoiceData.pr;

      // 4. Pay the BOLT11 invoice using user's LNbits wallet
      const paymentResponse = await fetch(`${LNBITS_ADMIN_CONFIG.baseUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'X-Api-Key': userWallet.adminkey, // Use user's admin key for sending payments
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          out: true, // outgoing payment
          bolt11: bolt11Invoice
        })
      });

      if (!paymentResponse.ok) {
        const errorBody = await paymentResponse.json().catch(() => ({ detail: 'Unknown error during payment.'}));
        throw new Error(`LNbits payment failed: ${paymentResponse.statusText} - ${errorBody.detail}`);
      }
      
      const paymentResult = await paymentResponse.json();
      return {
        ...paymentResult,
        amountSats, // The amount we intended to send
        lightningAddress, // The address we sent to
        comment, // The comment we used
        bolt11Invoice // The actual invoice paid
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
    sendPaymentToLightningAddress,
    
    // Config
    config: LNBITS_ADMIN_CONFIG
  };
}; 