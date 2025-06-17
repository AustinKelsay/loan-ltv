import React, { useState } from 'react';

interface LoanSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLoan: (collateralSats: number, principalUSD: number) => void;
  btcPrice: number;
}

// Constants for validation
const MIN_COLLATERAL_SATS = 1_000_000; // 0.01 BTC
const MIN_PRINCIPAL_USD = 1_000; // $1,000
const MAX_SAFE_LTV = 50; // 50% for safe initial LTV

const LoanSubmissionModal: React.FC<LoanSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitLoan,
  btcPrice
}) => {
  const [collateralSats, setCollateralSats] = useState(150_000_000); // 1.5 BTC default
  const [principalUSD, setPrincipalUSD] = useState(30_000); // $30,000 default
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validation
      if (collateralSats < MIN_COLLATERAL_SATS) {
        throw new Error(`Collateral must be at least ${MIN_COLLATERAL_SATS.toLocaleString()} sats (0.01 BTC)`);
      }
      if (principalUSD < MIN_PRINCIPAL_USD) {
        throw new Error(`Loan amount must be at least $${MIN_PRINCIPAL_USD.toLocaleString()}`);
      }
      
      const collateralUSD = (collateralSats / 100_000_000) * btcPrice;
      const initialLTV = (principalUSD / collateralUSD) * 100;
      
      if (initialLTV > 90) {
        throw new Error('Initial LTV cannot exceed 90% (loan liquidation threshold)');
      }
      if (initialLTV > MAX_SAFE_LTV) {
        const confirmed = confirm(
          `⚠️ Warning: Initial LTV is ${initialLTV.toFixed(1)}% which is above the recommended safe level of ${MAX_SAFE_LTV}%. ` +
          'This puts your loan at higher risk. Continue anyway?'
        );
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
      }
      
      onSubmitLoan(collateralSats, principalUSD);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const collateralBTC = collateralSats / 100_000_000;
  const collateralUSD = collateralBTC * btcPrice;
  const initialLTV = (principalUSD / collateralUSD) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto border border-gray-600">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">🏦 Submit Loan Application</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Collateral Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bitcoin Collateral (sats)
              </label>
              <input
                type="number"
                value={collateralSats}
                onChange={(e) => {
                  setCollateralSats(Number(e.target.value));
                  setError(null); // Clear error on input change
                }}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:outline-none"
                min={MIN_COLLATERAL_SATS}
                step="1000000"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                = {collateralBTC.toFixed(8)} BTC (${collateralUSD.toLocaleString()})
              </p>
            </div>

            {/* Loan Principal */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Loan Amount (USD)
              </label>
              <input
                type="number"
                value={principalUSD}
                onChange={(e) => {
                  setPrincipalUSD(Number(e.target.value));
                  setError(null); // Clear error on input change
                }}
                className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:outline-none"
                min={MIN_PRINCIPAL_USD}
                step="1000"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Calculated LTV */}
            <div className="mb-6 p-3 bg-gray-700 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Initial LTV:</span>
                <span className={`font-bold ${
                  initialLTV < 50 ? 'text-green-400' : 
                  initialLTV < 70 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {initialLTV.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                ⚡ Lightning liquidation at 80% • 💀 Loan liquidation at 90%
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  'Create Loan'
                )}
              </button>
            </div>
          </form>

          {/* Demo Info */}
          <div className="mt-4 p-3 bg-blue-900/30 rounded-md border border-blue-600/30">
            <p className="text-xs text-blue-300">
              💡 <strong>Demo Tip:</strong> Start with default values for optimal demonstration of dual liquidation thresholds. 
              The initial 20% LTV gives you room to test market volatility and Lightning wallet funding scenarios.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoanSubmissionModal; 