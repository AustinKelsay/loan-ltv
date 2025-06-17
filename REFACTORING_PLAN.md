# 🔧 Loan LTV Demo - Refactoring Plan

## Overview
This document outlines a comprehensive plan to simplify and refactor the loan LTV demo codebase, reducing complexity and improving maintainability.

## Current Issues
- **Main component**: 1,331 lines (extremely unwieldy)
- **@ts-nocheck**: Disabled TypeScript checking across all files
- **Duplicate code**: localStorage patterns repeated across hooks
- **Mixed concerns**: UI, business logic, and API calls in single components
- **Magic numbers**: Scattered throughout codebase

## ✅ Completed Refactoring

### 1. Service Layer Extraction (TypeScript)
- **`src/services/mockApi.ts`** - Centralized mock API functions with full typing
- **`src/services/storageService.ts`** - Unified localStorage operations with type safety

### 2. Constants Centralization (TypeScript)
- **`src/constants/index.ts`** - All configuration values and thresholds with const assertions

### 3. Hook Extraction (TypeScript)
- **`src/hooks/useLoanCalculations.ts`** - Complex LTV calculation logic with proper types
- **`src/hooks/usePriceFeed.ts`** - Price simulation logic with full typing

### 4. Type System Enhancement
- **`src/types/index.ts`** - Comprehensive type definitions for all data structures

### 5. Utility Simplification
- **`src/utils/testWalletStorage.js`** - Reduced from 183 to 42 lines (78% reduction)

## 🎯 Next Steps for Complete Refactoring

### Phase 1: Component Splitting (High Priority)
Split `LoanLTVDemo.tsx` into focused components:

```
src/components/
├── LoanLTVDemo.tsx (main container - ~200 lines)
├── loan/
│   ├── LoanMetricsDisplay.tsx    # LTV display, status indicators
│   ├── TopUpControls.tsx         # Amount input, payment buttons
│   ├── PriceControls.tsx         # Price slider, crash simulation
│   └── LiquidationManager.tsx    # Auto-liquidation logic
└── shared/
    ├── StatusBadge.tsx           # Reusable status components
    └── AmountInput.tsx           # Reusable amount input
```

### Phase 2: State Management Simplification
Replace 15+ useState hooks with useReducer:

```javascript
// Current: 15+ useState calls
const [topupAmount, setTopupAmount] = useState(500000);
const [topupInput, setTopupInput] = useState('500000');
const [processingPayment, setProcessingPayment] = useState(false);
// ... 12+ more

// Proposed: Single state object
const [appState, dispatch] = useReducer(appReducer, {
  topup: { amount: 500000, input: '500000' },
  payment: { processing: false, error: null },
  ui: { activeTab: 'custom', showInvoice: false }
});
```

### Phase 3: TypeScript Integration ✅ COMPLETED
1. ✅ All new files created with full TypeScript support
2. ✅ Comprehensive type definitions added to `src/types/index.ts`
3. ⏳ Next: Remove `@ts-nocheck` from existing components and integrate new services

### Phase 4: Hook Consolidation
Consolidate the existing hooks to use the new services:

```javascript
// Update existing hooks to use StorageService
const useWalletSetup = (logger) => {
  const storage = new StorageService(logger);
  // ... simplified localStorage operations
}
```

### Phase 5: Remove Unused Code
- Remove duplicate validation functions
- Simplify polling logic
- Clean up unused imports and variables

## 📊 Expected Results

| Metric | Current | After Refactoring | Improvement |
|--------|---------|-------------------|-------------|
| Main component size | 1,331 lines | ~200 lines | 85% reduction |
| Number of files | 15 files | ~25 files | Better organization |
| TypeScript errors | Many (hidden) | 0 | Full type safety |
| Duplicate code | High | Minimal | Improved DRY |
| Maintainability | Low | High | Much easier to modify |

## 🎨 Implementation Order

1. **Import new services** into existing components
2. **Replace direct localStorage** calls with StorageService
3. **Split main component** into smaller pieces
4. **Consolidate state** with useReducer
5. **Remove @ts-nocheck** and fix types
6. **Clean up unused code**

## Benefits

- **Easier maintenance**: Smaller, focused components
- **Better testing**: Isolated logic is easier to test
- **Type safety**: Full TypeScript support
- **Performance**: Reduced re-renders with better state management
- **Developer experience**: Much easier to navigate and modify

## Files to Refactor

### High Priority
- `src/components/LoanLTVDemo.tsx` (1,331 lines → multiple small components)
- All hook files (remove @ts-nocheck, use new services)

### Medium Priority
- `src/components/WalletSetupModal.tsx` (could be simplified)
- `src/components/LightningInvoiceModal.tsx` (state management)

### Low Priority
- `src/components/SystemLogsPanel.tsx` (already well-structured)
- `src/components/Tooltip.jsx` (already simple)

This refactoring will transform the codebase from a monolithic structure to a clean, maintainable, and type-safe application. 