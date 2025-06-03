/**
 * Custom hook for LNbits API interactions
 * Handles wallet operations for the custodial Lightning wallet option
 * All amounts are handled in satoshis internally
 */

import { satsToMillisats, millisatsToSats } from '../utils/bitcoinUnits';

// LNbits API configuration
const LNBITS_CONFIG = {
  baseUrl: 'https://demo.lnbits.com',
  walletId: '7b62a3019da5499ab307ff2bd350680d',
  adminKey: '711b71152ad14d67bcbfe3866d45d33f',
  invoiceKey: '921cbb1e491f4825b1e34f1e75cbc89d'
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
   * Fetches wallet details from LNbits API
   * @returns {Promise<Object>} Wallet details including balance in millisats
   */
  const getWalletDetails = async () => {
    try {
      log('wallet', '🔍 Fetching LNbits wallet details...');
      
      const response = await fetch(`${LNBITS_CONFIG.baseUrl}/api/v1/wallet`, {
        headers: {
          'X-Api-Key': LNBITS_CONFIG.invoiceKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const wallet = await response.json();
      
      // Convert balance from millisats to sats for our app
      const result = {
        ...wallet,
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
   * Creates a Lightning invoice using LNbits API
   * @param {number} amountSats - Amount in satoshis
   * @param {string} memo - Invoice description
   * @returns {Promise<Object>} Invoice details including payment_request and payment_hash
   */
  const createInvoice = async (amountSats, memo = 'Lightning topup') => {
    try {
      log('payment', `⚡ Creating invoice for ${amountSats} sats: "${memo}"`);
      
      // LNbits API expects SATS for invoice creation, not millisats!
      const requestBody = {
        out: false, // incoming payment
        amount: amountSats, // LNbits expects SATS for invoice creation
        memo: memo,
        expiry: 3600 // 1 hour expiry
      };
      
      const response = await fetch(`${LNBITS_CONFIG.baseUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'X-Api-Key': LNBITS_CONFIG.invoiceKey,
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
   * Checks payment status for a given payment hash
   * @param {string} paymentHash - Payment hash to check
   * @returns {Promise<Object>} Payment status including paid boolean and amount info
   */
  const checkPayment = async (paymentHash) => {
    try {
      const response = await fetch(`${LNBITS_CONFIG.baseUrl}/api/v1/payments/${paymentHash}`, {
        headers: {
          'X-Api-Key': LNBITS_CONFIG.invoiceKey
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
      console.error('Failed to check payment:', error);
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
   * Sends a payment from the configured LNbits wallet to a Lightning Address.
   * This function uses the adminKey to authorize the outgoing payment.
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
        // Note: Not all LNURL-pay services support comments this way.
        // Some might require it in the lnurlPayParams.commentAllowed field.
        // For simplicity, we'll try adding it here.
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

      // 4. Pay the BOLT11 invoice using LNbits API (requires adminKey)
      const paymentResponse = await fetch(`${LNBITS_CONFIG.baseUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'X-Api-Key': LNBITS_CONFIG.adminKey, // Use ADMIN key for sending payments
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
      // paymentResult should contain { payment_hash: "..." }
      // We can also add the amountSats for consistency if needed.
      return {
        ...paymentResult,
        amountSats, // The amount we intended to send
        lightningAddress, // The address we sent to
        comment, // The comment we used
        bolt11Invoice // The actual invoice paid
      };

    } catch (error) {
      console.error(`Failed to send payment to ${lightningAddress}:`, error);
      throw error; // Re-throw to be caught by the caller
    }
  };

  return {
    getWalletDetails,
    createInvoice,
    checkPayment,
    sendPaymentToLightningAddress,
    config: LNBITS_CONFIG
  };
}; 