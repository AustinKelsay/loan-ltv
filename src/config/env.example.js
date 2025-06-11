/**
 * Environment Configuration Example
 * 
 * To use your Voltage API setup instead of the demo:
 * 1. Create a .env file in the project root
 * 2. Add the following variables with your actual values:
 * 
 * # Voltage API Configuration
 * VITE_VOLTAGE_API_URL=https://voltageapi.com/v1
 * VITE_VOLTAGE_PROXY_URL=http://localhost:3001/api/voltage
 * VITE_VOLTAGE_API_KEY=your_api_key_here
 * VITE_VOLTAGE_ORGANIZATION_ID=your_organization_id_here
 * VITE_VOLTAGE_ENVIRONMENT_ID=your_environment_id_here
 * VITE_VOLTAGE_LINE_OF_CREDIT_ID=your_line_of_credit_id_here
 * VITE_VOLTAGE_NETWORK=mutinynet
 * 
 * Networks available:
 * - mainnet (production Bitcoin network)
 * - testnet3 (Bitcoin testnet)
 * - mutinynet (Signet-based testing network, recommended for demos)
 * 
 * Setup Requirements:
 * 1. Sign up for a Voltage account
 * 2. Create an organization and environment
 * 3. Set up a line of credit for wallet funding
 * 4. Generate an API key with appropriate permissions
 * 5. Note down your organization ID, environment ID, and line of credit ID
 * 
 * API Key Permissions Required:
 * - Wallet creation and management
 * - Payment sending and receiving
 * - Balance and transaction history access
 */

// This file is for documentation only
// The actual configuration is loaded from environment variables in useVoltageAPI.js
export const ENV_CONFIG_EXAMPLE = {
  VOLTAGE_API_URL: 'https://voltageapi.com/v1',
  VOLTAGE_PROXY_URL: 'http://localhost:3001/api/voltage',
  VOLTAGE_API_KEY: 'your_api_key_here',
  VOLTAGE_ORGANIZATION_ID: 'your_organization_id_here',
  VOLTAGE_ENVIRONMENT_ID: 'your_environment_id_here',
  VOLTAGE_LINE_OF_CREDIT_ID: 'your_line_of_credit_id_here',
  VOLTAGE_NETWORK: 'mutinynet'
}; 