/**
 * Bitcoin Unit Conversion Utilities
 * Handles conversions between BTC, sats, and millisats
 */

// Constants for unit conversions
export const SATS_PER_BTC = 100_000_000; // 100 million sats = 1 BTC
export const MILLISATS_PER_SAT = 1000; // 1000 millisats = 1 sat

/**
 * Convert BTC to satoshis
 * @param {number} btc - Amount in BTC
 * @returns {number} Amount in satoshis
 */
export const btcToSats = (btc) => {
  return Math.floor(btc * SATS_PER_BTC);
};

/**
 * Convert satoshis to BTC
 * @param {number} sats - Amount in satoshis
 * @returns {number} Amount in BTC
 */
export const satsToBtc = (sats) => {
  return sats / SATS_PER_BTC;
};

/**
 * Convert millisatoshis to satoshis
 * @param {number} millisats - Amount in millisatoshis
 * @returns {number} Amount in satoshis (rounded down)
 */
export const millisatsToSats = (millisats) => {
  return Math.floor(millisats / MILLISATS_PER_SAT);
};

/**
 * Convert satoshis to millisatoshis
 * @param {number} sats - Amount in satoshis
 * @returns {number} Amount in millisatoshis
 */
export const satsToMillisats = (sats) => {
  return sats * MILLISATS_PER_SAT;
};

/**
 * Convert BTC to millisatoshis
 * @param {number} btc - Amount in BTC
 * @returns {number} Amount in millisatoshis
 */
export const btcToMillisats = (btc) => {
  return btcToSats(btc) * MILLISATS_PER_SAT;
};

/**
 * Convert millisatoshis to BTC
 * @param {number} millisats - Amount in millisatoshis
 * @returns {number} Amount in BTC
 */
export const millisatsToBtc = (millisats) => {
  return satsToBtc(millisatsToSats(millisats));
};

/**
 * Format satoshis for display with proper comma separators
 * @param {number} sats - Amount in satoshis
 * @param {boolean} includeSatsLabel - Whether to include "sats" label
 * @returns {string} Formatted string
 */
export const formatSats = (sats, includeSatsLabel = true) => {
  const formatted = sats.toLocaleString();
  return includeSatsLabel ? `${formatted} sats` : formatted;
};

/**
 * Format BTC for display (useful for price displays)
 * @param {number} btc - Amount in BTC
 * @param {number} decimals - Number of decimal places (default: 8)
 * @returns {string} Formatted BTC string
 */
export const formatBtc = (btc, decimals = 8) => {
  return btc.toFixed(decimals);
};

/**
 * Calculate USD value from sats given BTC price
 * @param {number} sats - Amount in satoshis
 * @param {number} btcPriceUSD - BTC price in USD
 * @returns {number} USD value
 */
export const satsToUSD = (sats, btcPriceUSD) => {
  return satsToBtc(sats) * btcPriceUSD;
};

/**
 * Calculate sats from USD value given BTC price
 * @param {number} usd - USD amount
 * @param {number} btcPriceUSD - BTC price in USD
 * @returns {number} Amount in satoshis
 */
export const usdToSats = (usd, btcPriceUSD) => {
  return btcToSats(usd / btcPriceUSD);
};

/**
 * Validate if a number is a valid satoshi amount
 * @param {number} sats - Amount to validate
 * @returns {boolean} True if valid
 */
export const isValidSatsAmount = (sats) => {
  return Number.isInteger(sats) && sats >= 0;
};

/**
 * Parse user input to sats (handles various formats)
 * @param {string|number} input - User input
 * @param {string} unit - Expected unit ('sats', 'btc', 'millisats')
 * @returns {number|null} Parsed amount in sats, or null if invalid
 */
export const parseToSats = (input, unit = 'sats') => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || num < 0) return null;
  
  switch (unit.toLowerCase()) {
    case 'btc':
      return btcToSats(num);
    case 'millisats':
      return millisatsToSats(num);
    case 'sats':
    default:
      return Math.floor(num);
  }
}; 