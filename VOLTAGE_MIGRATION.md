# Migration from LNbits to Voltage Pay API

This guide outlines the changes made to replace the LNbits custodial wallet integration with the Voltage Pay API.

## Overview of Changes

The loan-ltv demo application has been migrated from using LNbits as the custodial wallet provider to using Voltage's enterprise Lightning infrastructure via their Pay API.

## Key Files Modified

### 1. New Voltage API Hook
- **File**: `src/hooks/useVoltageAPI.js`
- **Purpose**: Complete replacement for `useLNbitsAPI.js`
- **Features**: 
  - Wallet creation and management
  - Lightning invoice generation
  - Payment sending and receiving
  - Lightning Address support
  - Millisatoshi/satoshi conversion utilities

### 2. Wallet Setup Hook Updates
- **File**: `src/hooks/useWalletSetup.js`
- **Changes**: 
  - Import `useVoltageAPI` instead of `useLNbitsAPI`
  - Updated all API calls to use Voltage methods
  - Updated logging messages to reference Voltage

### 3. Wallet Setup Modal Updates
- **File**: `src/components/WalletSetupModal.jsx`
- **Changes**:
  - Updated UI text from "LNbits" to "Voltage"
  - Changed wallet opening URLs to Voltage dashboard format
  - Updated configuration prop names

### 4. Main Demo Component Updates
- **File**: `src/components/LoanLTVDemo.jsx`
- **Changes**:
  - Updated all payment creation and polling logic
  - Changed reserve constant from `LNBITS_RESERVE_SATS` to `VOLTAGE_RESERVE_SATS`
  - Updated wallet opening functionality
  - Modified auto-liquidation logic to use Voltage API

### 5. Environment Configuration
- **File**: `src/config/env.example.js`
- **Changes**: Complete rewrite to show Voltage API configuration requirements

## Environment Variables Required

You need to set up the following environment variables in your `.env` file:

```bash
# Voltage API Configuration
VITE_VOLTAGE_API_URL=https://voltageapi.com/v1
VITE_VOLTAGE_API_KEY=your_api_key_here
VITE_VOLTAGE_ORGANIZATION_ID=your_organization_id_here
VITE_VOLTAGE_ENVIRONMENT_ID=your_environment_id_here
VITE_VOLTAGE_LINE_OF_CREDIT_ID=your_line_of_credit_id_here
VITE_VOLTAGE_NETWORK=mutinynet
```

## Voltage Setup Requirements

### 1. Voltage Account Setup
1. Sign up for a Voltage account at [voltage.cloud](https://voltage.cloud)
2. Create an organization
3. Set up an environment within your organization
4. Configure a line of credit for wallet funding

### 2. API Configuration
1. Generate an API key with the following permissions:
   - Wallet creation and management
   - Payment sending and receiving
   - Balance and transaction history access
2. Note down your:
   - Organization ID
   - Environment ID  
   - Line of Credit ID

### 3. Network Selection
Choose the appropriate network:
- **mainnet**: Production Bitcoin network (real money)
- **testnet3**: Bitcoin testnet (test coins)
- **mutinynet**: Signet-based testing network (recommended for demos)

## Key Functional Changes

### Wallet Creation
- **Before**: Created user wallets via LNbits user manager extension
- **After**: Creates wallets directly via Voltage API with configurable limits

### Payment Processing
- **Before**: Used LNbits payment endpoints with wallet-specific keys
- **After**: Uses Voltage unified payment API with organization-scoped authentication

### Balance Tracking
- **Before**: Simple balance field from LNbits wallet
- **After**: Structured balance array with currency-specific available amounts

### Invoice Generation
- **Before**: Direct LNbits wallet invoice creation
- **After**: Voltage payment creation with async processing and status polling

## Benefits of Migration

### Enterprise Features
- **Scalability**: Voltage's infrastructure scales automatically
- **Reliability**: Enterprise-grade uptime and redundancy
- **Security**: SOC 2 compliance and advanced security measures
- **Monitoring**: Built-in observability and alerting

### Developer Experience
- **Unified API**: Single API for all Lightning operations
- **Better Documentation**: Comprehensive API documentation
- **SDK Support**: Official SDKs for multiple languages
- **Webhooks**: Real-time payment notifications (not implemented in this demo)

### Operational Benefits
- **No Infrastructure**: No need to run your own LNbits instance
- **Automated Scaling**: Handles traffic spikes automatically
- **Professional Support**: Enterprise support available
- **Compliance**: Built-in compliance features for regulated environments

## Testing the Migration

### 1. Local Development
1. Set up your `.env` file with Voltage credentials
2. Start the development server: `npm run dev`
3. Test wallet setup flow
4. Test payment creation and polling
5. Verify auto-liquidation functionality

### 2. Wallet Operations to Test
- [ ] Custodial wallet creation
- [ ] Invoice generation for funding
- [ ] Payment status polling
- [ ] Balance updates after payments
- [ ] Lightning Address payments (auto-liquidation)
- [ ] Wallet reset functionality

## Troubleshooting

### Common Issues

**API Authentication Errors**
- Verify your API key is correct and has proper permissions
- Check that your organization and environment IDs are accurate

**Wallet Creation Failures**
- Ensure your line of credit is properly configured
- Verify you have sufficient API limits
- Check network configuration (mutinynet vs mainnet)

**Payment Issues**
- Confirm payment amounts are within wallet limits
- Verify invoice formats are correct
- Check network connectivity to Voltage API

### Debug Logging
The application includes comprehensive logging. Check the browser console for detailed API interaction logs prefixed with levels like:
- `[WALLET]` - Wallet operations
- `[PAYMENT]` - Payment processing
- `[ERROR]` - Error conditions
- `[SUCCESS]` - Successful operations

## Next Steps

### Production Considerations
1. **Environment**: Switch from `mutinynet` to `mainnet` for production
2. **Limits**: Configure appropriate wallet limits for your use case
3. **Monitoring**: Set up monitoring and alerting for payment failures
4. **Backup**: Implement proper backup and recovery procedures

### Potential Enhancements
1. **Webhooks**: Implement real-time payment notifications
2. **Multi-Currency**: Support for additional currencies if needed
3. **Advanced Features**: Explore Voltage's advanced Lightning features
4. **SDK Integration**: Consider using Voltage's official SDK for additional features

## Support

For Voltage-specific issues:
- [Voltage Documentation](https://docs.voltageapi.com/)
- [Voltage Support](https://voltage.cloud/support)

For application-specific issues:
- Check the browser console for detailed error logs
- Review the system logs in the application UI
- Verify environment configuration matches requirements 