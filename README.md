# Loan Lightning Topup Visualizer (loan-ltv)

This project is a React application demonstrating a loan interface with Bitcoin collateral and Lightning Network top-up functionality. The app visualizes loan-to-value (LTV) ratios and allows users to manage their Bitcoin-backed loans through Lightning payments.

**All amounts in the application are denominated in satoshis (sats) for precision and clarity.**

## Prerequisites

- Node.js (v18 or later recommended)
- npm

## Setup

1. Clone the repository (if you haven't already).
2. Navigate to the project directory:
   ```bash
   cd loan-ltv
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Development Server

To start the development server, run:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173` (Vite's default) or another port if 5173 is busy.

## Project Structure

- `public/`: Static assets.
- `src/`: Application source code.
  - `components/`: React components
    - `LoanLTVDemo.jsx`: Main loan visualization component
    - `WalletSetupModal.jsx`: Modal for Lightning wallet configuration
    - `LightningInvoiceModal.jsx`: Modal for invoice display and payment
  - `hooks/`: Custom React hooks
    - `useLNbitsAPI.js`: LNbits API integration for custodial wallets
    - `useWalletSetup.js`: Wallet setup state management
  - `utils/`: Utility functions
    - `bitcoinUnits.js`: Bitcoin unit conversion utilities (BTC, sats, millisats)
  - `App.jsx`: Main application component
  - `main.jsx`: Entry point
  - `index.css`: Tailwind CSS imports and global styles
- `vite.config.js`: Vite configuration

## Features

### Bitcoin Unit Handling
- **Primary denomination**: Satoshis (sats) for all amounts
- **Unit conversions**: Utilities for converting between BTC, sats, and millisats
- **Display formatting**: Proper formatting with comma separators and unit labels
- **Input validation**: Ensures valid satoshi amounts (positive integers)

### Wallet Options

#### Self-Custodial Wallets
- **NWC (Nostr Wallet Connect)** - Connect your own Lightning wallet via NWC protocol
- **LNURLW (LNURL Withdraw)** - Use LNURL withdraw links for Lightning payments

#### Custodial Wallets  
- **LNbits Integration** - Demo integration with LNbits custodial Lightning wallet
- Real-time payment detection and invoice management
- Balance display in sats

### Loan Management
- Real-time LTV (Loan-to-Value) monitoring with sats precision
- Visual LTV meter with liquidation warnings
- Market price simulation for testing scenarios
- Automatic margin call alerts with required top-up amounts in sats

### Lightning Network Integration
- Instant Bitcoin collateral top-ups via Lightning Network
- Support for both custodial and self-custodial wallets
- Real-time payment polling and confirmation
- Invoice generation and management with proper unit handling

## Demo Experience

The application starts with a clean state to allow users to experience the full workflow:

1. **Initial State**: One hardcoded transaction (initial Bitcoin deposit of 1.5 BTC / 150,000,000 sats)
2. **Wallet Setup**: Users must configure a Lightning wallet before making top-ups
3. **Top-up Testing**: Add sats to collateral using Lightning payments
4. **Market Simulation**: Use demo controls to simulate price crashes and test margin calls
5. **Auto-Liquidation** (Custodial Only): When LTV hits 85%+, custodial wallets automatically send their full balance to `austin@bitcoinpleb.dev`

### Full Demo Flow Example
1. **Setup LNbits Custodial Wallet**: Configure with demo credentials
2. **Fund Wallet**: Add 200 sats to the LNbits wallet (creates invoice TO wallet)
3. **Market Crash**: Use "Crash -20%" button to simulate price drop
4. **Auto-Liquidation Trigger**: When LTV reaches 85%, wallet automatically pays out to `austin@bitcoinpleb.dev`
5. **Transaction History**: View the liquidation in transaction history with LTV details

## Component Architecture

### Main Component (`LoanLTVDemo`)
```javascript
// All amounts in satoshis
const [loan, setLoan] = useState(null); // collateral.amountSats
const [topupAmount, setTopupAmount] = useState(5000000); // 5M sats = 0.05 BTC

// Unit conversion utilities
import { btcToSats, satsToUSD, formatSats } from '../utils/bitcoinUnits';
```

### Unit Conversion Utilities (`bitcoinUnits.js`)
```javascript
// Core conversions
export const btcToSats = (btc) => Math.floor(btc * 100_000_000);
export const satsToBtc = (sats) => sats / 100_000_000;
export const millisatsToSats = (millisats) => Math.floor(millisats / 1000);

// Display formatting
export const formatSats = (sats, includeSatsLabel = true) => 
  includeSatsLabel ? `${sats.toLocaleString()} sats` : sats.toLocaleString();

// USD conversions
export const satsToUSD = (sats, btcPriceUSD) => satsToBtc(sats) * btcPriceUSD;
```

### Payment Flow

#### Custodial Wallet (LNbits)
1. **Funding**: Convert sats to millisats for LNbits API
2. Create invoice via LNbits API (user pays TO wallet)
3. Display Lightning invoice to user
4. Poll LNbits API for payment status
5. Update loan collateral on payment confirmation
6. **Auto-Liquidation**: When LTV ≥ 85%, automatically send full wallet balance to `austin@bitcoinpleb.dev`

#### Self-Custodial Wallet (NWC/LNURLW)
1. Generate mock invoice (in production: use NWC/LNURLW protocols)
2. Display Lightning invoice to user  
3. Simulate payment detection (in production: real protocol integration)
4. Update loan collateral on payment confirmation

### Payment Types

The application supports three payment types:

1. **`custodial_funding`**: User pays invoice TO their LNbits wallet (adds collateral)
2. **`incoming`**: Self-custodial wallet receives payment (adds collateral) 
3. **`auto_liquidation`**: Custodial wallet automatically pays out full balance when LTV ≥ 85% (removes collateral)

## Configuration

### LNbits Demo Wallet
```javascript
const LNBITS_CONFIG = {
  baseUrl: 'https://demo.lnbits.com',
  walletId: '7b62a3019da5499ab307ff2bd350680d',
  adminKey: '711b71152ad14d67bcbfe3866d45d33f',
  invoiceKey: '921cbb1e491f4825b1e34f1e75cbc89d'
};
```

## Usage

1. **Setup Wallet**: Choose between self-custodial or custodial wallet options
2. **Monitor LTV**: Watch real-time loan health via the LTV meter (all calculations in sats)
3. **Add Collateral**: Use Lightning Network for instant Bitcoin top-ups
   - Enter amount in sats (with quick buttons for common amounts)
   - View USD equivalent in real-time
   - Required top-up calculations show exact sats needed
4. **Demo Controls**: Simulate market conditions with the price controls

## Testing Flow

1. **Start Fresh**: Application loads with only initial deposit transaction
2. **Setup Wallet**: Configure Lightning wallet (custodial or self-custodial)
   - **Automatic Persistence**: Wallet configurations are saved to localStorage
   - **Restoration on Reload**: Previously configured wallets are automatically restored
3. **Market Crash**: Use demo controls to crash BTC price by 20%
4. **Margin Call**: LTV will increase, triggering warnings and showing required top-up
5. **Lightning Top-up**: Add sats via Lightning to restore healthy LTV ratio

### Wallet Management Features

- **Automatic Restoration**: Wallet connections are automatically restored when you reload the page
- **Loading States**: Clean loading indicators while checking for existing wallet connections
- **Open Wallet**: For custodial wallets, click "Open Wallet" to view your LNbits wallet in a new tab
- **Wallet Deletion**: Use "Delete Wallet" to clear all wallet data and start fresh
- **Development Testing**: Use browser console commands for testing wallet persistence:
  ```javascript
  // View stored wallet data
  walletStorageTest.showStoredWallets()
  
  // Clear all wallet data
  walletStorageTest.clearAllWalletData()
  
  // Simulate saved wallet configurations
  walletStorageTest.simulateNWCWallet()
  walletStorageTest.simulateLNURLWWallet()
  
  // Show all available commands
  walletStorageTest.help()
  ```

## Development Notes

- All custodial wallet operations use real LNbits API calls with proper millisats handling
- Self-custodial operations are currently mocked for demo purposes
- Production implementation would integrate real NWC and LNURLW protocols
- Payment polling uses 2-second intervals for responsive UX
- Unit conversions handle edge cases and validate input formats
- All amounts stored and calculated in sats for precision
