/**
 * Environment Configuration Example
 * 
 * To use your own LNbits instance instead of the demo:
 * 1. Create a .env file in the project root
 * 2. Add the following variables with your actual values:
 * 
 * # LNbits Instance URL (without trailing slash)
 * VITE_LNBITS_URL=https://your-lnbits-instance.com
 * 
 * # Admin Wallet Configuration
 * VITE_LNBITS_ADMIN_WALLET_ID=your_admin_wallet_id_here
 * VITE_LNBITS_ADMIN_KEY=your_admin_key_here
 * VITE_LNBITS_ADMIN_INVOICE_KEY=your_admin_invoice_key_here
 * 
 * # User Manager Extension Configuration
 * VITE_LNBITS_USER_MANAGER_ADMIN_KEY=your_user_manager_admin_key_here
 * 
 * Demo Configuration (current settings for demo.lnbits.com):
 * VITE_LNBITS_URL=https://demo.lnbits.com
 * VITE_LNBITS_ADMIN_WALLET_ID=7b62a3019da5499ab307ff2bd350680d
 * VITE_LNBITS_ADMIN_KEY=711b71152ad14d67bcbfe3866d45d33f
 * VITE_LNBITS_ADMIN_INVOICE_KEY=921cbb1e491f4825b1e34f1e75cbc89d
 * VITE_LNBITS_USER_MANAGER_ADMIN_KEY=711b71152ad14d67bcbfe3866d45d33f
 * 
 * Requirements:
 * - LNbits instance with usermanager extension enabled
 * - Admin access to create and manage user wallets
 * - Valid Lightning node connection for payments
 */

// This file is for documentation only
// The actual configuration is loaded from environment variables in useLNbitsAPI.js
export const ENV_CONFIG_EXAMPLE = {
  LNBITS_URL: 'https://your-lnbits-instance.com',
  ADMIN_WALLET_ID: 'your_admin_wallet_id_here',
  ADMIN_KEY: 'your_admin_key_here',
  ADMIN_INVOICE_KEY: 'your_admin_invoice_key_here',
  USER_MANAGER_ADMIN_KEY: 'your_user_manager_admin_key_here'
}; 