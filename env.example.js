// Next.js Environment Variables for Voltage Pay API Integration
// Copy this file to .env.local and fill in your actual values

// Voltage API Configuration (Client-side accessible)
export const NEXT_PUBLIC_VOLTAGE_API_URL = 'https://voltageapi.com/v1';
export const NEXT_PUBLIC_VOLTAGE_API_KEY = 'your_api_key_here';
export const NEXT_PUBLIC_VOLTAGE_ORGANIZATION_ID = 'your_organization_id_here';
export const NEXT_PUBLIC_VOLTAGE_ENVIRONMENT_ID = 'your_environment_id_here';
export const NEXT_PUBLIC_VOLTAGE_LINE_OF_CREDIT_ID = 'your_line_of_credit_id_here';
export const NEXT_PUBLIC_VOLTAGE_NETWORK = 'mutinynet'; // mainnet, testnet3, mutinynet

// Server-side only (for API routes) - add to .env.local:
// VOLTAGE_API_KEY=your_api_key_here

/*
Instructions:
1. Sign up for Voltage Pay at https://voltage.cloud/
2. Create an organization and environment
3. Generate an API key with appropriate permissions
4. Set up a line of credit for wallet operations
5. Choose your network (mainnet, testnet3, or mutinynet for testing)
6. Create .env.local file with these variables:

NEXT_PUBLIC_VOLTAGE_API_URL=https://voltageapi.com/v1
NEXT_PUBLIC_VOLTAGE_API_KEY=your_api_key_here
NEXT_PUBLIC_VOLTAGE_ORGANIZATION_ID=your_organization_id_here
NEXT_PUBLIC_VOLTAGE_ENVIRONMENT_ID=your_environment_id_here
NEXT_PUBLIC_VOLTAGE_LINE_OF_CREDIT_ID=your_line_of_credit_id_here
NEXT_PUBLIC_VOLTAGE_NETWORK=mutinynet
VOLTAGE_API_KEY=your_api_key_here
*/ 