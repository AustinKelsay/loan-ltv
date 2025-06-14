# ⚡ Loan Lightning Topup Visualizer (loan-ltv)

A comprehensive Bitcoin-backed loan management platform demonstrating **dual liquidation thresholds**, **Lightning Network integration**, and **complete state persistence**. Experience real-time LTV monitoring with Lightning Network collateral top-ups and automatic liquidation mechanisms.

## 📊 Demo Overview

**Core Functionality**: Manage Bitcoin-backed loans with Lightning Network top-up capabilities, featuring two distinct liquidation thresholds for different risk management scenarios.

**Key Innovation**: Lightning wallet funds contribute to total collateral value, demonstrating advanced risk management where users can add instant liquidity while managing liquidation exposure.

## ✨ Key Features

### 🎯 **Advanced Risk Management**
- **Dual Liquidation System**: 85% LTV auto-liquidates Lightning wallet, 90% LTV triggers full loan liquidation
- **Lightning Collateral**: Lightning wallet balance contributes to total collateral value
- **Market Simulation**: Price volatility simulation to demonstrate liquidation scenarios
- **Real Lightning Payments**: Actual Bitcoin transactions via Voltage/LNbits integration

### 💾 **Complete Persistence**
- **Full State Management**: Wallet configurations, transactions, and loan state persist across browser sessions
- **Transaction History**: All Lightning payments, liquidations, and market events are permanently saved
- **Session Continuity**: Close browser and return later - everything exactly as you left it
- **Easy Reset**: Start fresh demos with one-click data reset

### ⚡ **Lightning Network Integration**
- **Custodial Wallets**: Real LNbits integration with live balance tracking
- **Self-Custodial Support**: NWC and LNURLW protocol integration (demo mode)
- **Auto-Liquidation**: Custodial wallets automatically send funds to `austin@vlt.ge` when triggered
- **Real-time Updates**: Live payment detection and balance synchronization

## 🚀 Quick Start

```bash
# Clone and setup
git clone [repository-url]
cd loan-ltv
npm install
npm run dev
```

Open `http://localhost:3000` and explore the demo!

## 🔧 Demo Walkthrough

### **Initial Setup**
1. **Default State**: Demo initializes with 1.5 BTC collateral and $50,000 loan (10% LTV)
2. **Lightning Wallet Configuration**: Choose custodial (LNbits) or self-custodial (NWC/LNURLW)
3. **Collateral Management**: Add Lightning funds to test dual liquidation thresholds

### **Testing Scenarios**
1. **Risk Threshold Testing**: Observe behavior as LTV approaches 85-90% range
2. **Market Volatility**: Use "Market Crash" button to simulate price volatility
3. **Auto-Liquidation**: At 85% LTV, Lightning wallet auto-liquidates (funds sent to `austin@vlt.ge`)
4. **Full Liquidation**: At 90% LTV, entire loan liquidates

### **Demo Outcomes**
- ✅ **Partial Liquidation**: Lightning wallet liquidated, main loan remains active
- ⚠️ **Full Liquidation**: Main loan liquidated (90% LTV reached)
- 🔄 **Reset**: Use "Reset All Data" to restart demo with fresh state

## 🏗️ Technical Architecture

### **State Management**
- `useTransactionStorage`: Persistent transaction and loan state management
- `useWalletSetup`: Lightning wallet configuration and restoration
- `useSystemLogs`: Real-time activity logging with persistence

### **Core Components**
- **LoanLTVDemo**: Main demo interface with dual liquidation mechanics
- **WalletSetupModal**: Lightning wallet configuration (custodial/self-custodial)
- **LightningInvoiceModal**: Payment interfaces with real-time polling

### **Lightning Integration**
- **Voltage API**: Real custodial wallet management and auto-liquidation
- **NWC/LNURLW**: Self-custodial wallet protocols (demo implementation)
- **Payment Detection**: Real-time Lightning payment confirmation

## 💰 Financial Mechanics

### **Liquidation Thresholds**
- **85% LTV**: ⚡ Lightning wallet auto-liquidation
- **90% LTV**: 💀 Main loan liquidation

### **Collateral Calculation**
```
Total Collateral = Main Loan Collateral + Lightning Wallet Balance
LTV = Loan Principal / (Total Collateral Value in USD)
```

### **Risk Management Considerations**
- Adding Lightning funds **reduces LTV** (safer loan, but more at risk in Lightning liquidation)
- Market volatility **increases LTV** (closer to liquidation thresholds)
- Lightning liquidation **removes collateral** (increases remaining LTV)

## 🛠️ Development

### **Testing Utilities**
Open browser console for development commands:
```javascript
// View all stored data
walletStorageTest.showStoredWallets()

// Create mock transaction history
walletStorageTest.simulateTransactionHistory()

// Reset everything
walletStorageTest.clearAllWalletData()

// Help menu
walletStorageTest.help()
```

### **Demo Controls**
- **BTC Price Slider**: Manual price adjustment (60k - 140k range)
- **Market Crash Button**: Simulated price volatility to trigger liquidations
- **Reset All Data**: Complete demo state reset

### **Configuration**
```javascript
// LNbits Demo Configuration
const LNBITS_CONFIG = {
  baseUrl: 'https://demo.lnbits.com',
  walletId: '7b62a3019da5499ab307ff2bd350680d',
  adminKey: '711b71152ad14d67bcbfe3866d45d33f',
  invoiceKey: '921cbb1e491f4825b1e34f1e75cbc89d'
};
```

## 📊 Demo Mechanics Deep Dive

### **Lightning Wallet Risk Management**
- **Risk vs Reward**: More sats = better loan health but higher liquidation risk
- **Timing Considerations**: When to add funds vs when to allow liquidation
- **Market Sensitivity**: Understanding price volatility impact

### **Auto-Liquidation Logic**
1. **LTV Calculation**: Real-time monitoring of loan-to-value ratio
2. **Threshold Detection**: Automatic triggering at 85% LTV
3. **Payment Execution**: Immediate Lightning payment to `austin@vlt.ge`
4. **State Updates**: Transaction recorded, collateral adjusted, LTV recalculated

### **Persistence Benefits**
- **Demo Continuity**: Build complex transaction histories over multiple sessions
- **Real Experience**: Feels like actual financial app with complete state management
- **Testing Scenarios**: Evaluate different approaches across multiple demo sessions
- **Educational Tool**: Observe long-term effects of liquidation mechanisms

---

**Ready to explore Lightning LTV management?** 🚀⚡

Start the demo and experience advanced Bitcoin-backed loan management with Lightning Network integration!
