import React, { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, TrendingDown, Clock, CheckCircle } from 'lucide-react';

// Mock API
const mockAPI = {
  getLoanDetails: async (loanId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      loanId: loanId || "LOAN-001",
      userId: "user123",
      principal: 50000,
      currency: "USDC",
      collateral: {
        amount: 1.5,
        currency: "BTC",
        valueUSD: 67845
      },
      ltv: 73.7,
      liquidationThreshold: 85,
      warningThreshold: 70,
      interestRate: 8.5,
      status: "active",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    };
  },
  
  // eslint-disable-next-line no-unused-vars
  getTransactionHistory: async (loanId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: "tx-002",
        type: "lightning_topup",
        amount: 0.02,
        currency: "BTC",
        valueUSD: 904.60,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        paymentHash: "3a2f8b9c..."
      },
      {
        id: "tx-001",
        type: "initial_deposit",
        amount: 1.48,
        currency: "BTC",
        valueUSD: 66940.40,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      }
    ];
  },
  
  generateLightningInvoice: async (loanId, amountBTC) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock Lightning invoice
    const invoice = `lnbc${Math.floor(amountBTC * 100000000)}n1pv${Math.random().toString(36).substring(7)}...`;
    
    return {
      invoice,
      amount: amountBTC,
      expiry: 3600, // 1 hour
      paymentHash: `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
  },
  
  confirmPayment: async (loanId, paymentHash) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentHash,
      preimage: `preimage_${Math.random().toString(36).substring(7)}`,
      settledAt: new Date().toISOString()
    };
  },
  
  getCurrentBTCPrice: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 45230;
  }
};

// Price feed simulator
const usePriceFeed = (initialPrice = 45230) => {
  const [price, setPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(-2.3);
  
  useEffect(() => {
    // Simulate price fluctuations
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 200;
        const newPrice = Math.max(30000, Math.min(60000, prev + change));
        setPriceChange(((newPrice - prev) / prev) * 100);
        return newPrice;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { price, priceChange, setPrice };
};

export default function LoanLTVDemo() {
  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(0.05);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  
  const { price: btcPrice, priceChange, setPrice: setBtcPrice } = usePriceFeed();
  
  // Calculate loan metrics
  const calculateMetrics = useCallback(() => {
    if (!loan) return null;
    
    const collateralValue = loan.collateral.amount * btcPrice;
    const ltv = (loan.principal / collateralValue) * 100;
    const ltvStatus = ltv >= 80 ? 'critical' : ltv >= 70 ? 'warning' : 'healthy';
    
    return {
      collateralValue,
      ltv,
      ltvStatus,
      requiredTopup: ltv > 70 ? ((loan.principal / 0.65) - collateralValue) / btcPrice : 0
    };
  }, [loan, btcPrice]);
  
  const metrics = calculateMetrics();
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loanData, txHistory] = await Promise.all([
          mockAPI.getLoanDetails(),
          mockAPI.getTransactionHistory()
        ]);
        setLoan(loanData);
        setTransactions(txHistory);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle Lightning top-up
  const initiateTopUp = async () => {
    setProcessingPayment(true);
    
    try {
      // Generate Lightning invoice
      const invoice = await mockAPI.generateLightningInvoice(loan.loanId, topupAmount);
      setCurrentInvoice(invoice);
      setShowInvoice(true);
      
      // Simulate payment detection after 2 seconds
      setTimeout(async () => {
        const payment = await mockAPI.confirmPayment(loan.loanId, invoice.paymentHash);
        
        if (payment.success) {
          // Update loan collateral
          setLoan(prev => ({
            ...prev,
            collateral: {
              ...prev.collateral,
              amount: prev.collateral.amount + topupAmount
            }
          }));
          
          // Add transaction to history
          const newTx = {
            id: `tx-${Date.now()}`,
            type: "lightning_topup",
            amount: topupAmount,
            currency: "BTC",
            valueUSD: topupAmount * btcPrice,
            timestamp: new Date().toISOString(),
            status: "completed",
            paymentHash: payment.paymentHash
          };
          
          setTransactions(prev => [newTx, ...prev]);
          setShowInvoice(false);
          setCurrentInvoice(null);
        }
        
        setProcessingPayment(false);
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setProcessingPayment(false);
    }
  };
  
  // Simulate market crash
  const simulateCrash = () => {
    setBtcPrice(prev => prev * 0.8);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading loan details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              ⚡ Lightning LTV
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">BTC/USD</span>
                <span className="font-semibold">${btcPrice.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded text-xs ${priceChange >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Margin Call Alert */}
        {metrics?.ltvStatus === 'critical' && (
          <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-500">Margin Call Warning</h3>
                <p className="text-red-300 mt-1">
                  Your loan is approaching liquidation. Add Bitcoin collateral immediately to avoid liquidation of your assets.
                  Required top-up: <strong>{metrics.requiredTopup.toFixed(4)} BTC</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loan Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Loan Amount</div>
            <div className="text-3xl font-bold">${loan.principal.toLocaleString()}</div>
            <div className="text-gray-500">{loan.currency}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Bitcoin Collateral Value</div>
            <div className="text-3xl font-bold">${metrics?.collateralValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <div className="text-gray-500">{loan.collateral.amount} BTC</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Current LTV</div>
            <div className="text-3xl font-bold">{metrics?.ltv.toFixed(1)}%</div>
            <div className="text-gray-500">Liquidation at {loan.liquidationThreshold}%</div>
            
            {/* LTV Meter */}
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                  style={{ width: `${metrics?.ltv}%` }}
                />
                <div className="absolute right-0 top-0 w-[15%] h-full bg-red-600/30 border-l-2 border-red-600" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>Safe</span>
                <span>Warning</span>
                <span>85%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lightning Top-up Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Lightning Network Top-Up</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              metrics?.ltvStatus === 'healthy' ? 'bg-green-900/50 text-green-400 border border-green-600' :
              metrics?.ltvStatus === 'warning' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600 animate-pulse' :
              'bg-red-900/50 text-red-400 border border-red-600 animate-pulse'
            }`}>
              {metrics?.ltvStatus === 'healthy' ? 'Healthy' : metrics?.ltvStatus === 'warning' ? 'Warning' : 'Critical'}
            </span>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Top-up Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(parseFloat(e.target.value) || 0)}
                  step="0.001"
                  min="0.001"
                  className="w-full px-4 py-3 pr-16 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">BTC</span>
              </div>
            </div>
            
            <button
              onClick={initiateTopUp}
              disabled={processingPayment || topupAmount <= 0}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Top-up via Lightning
            </button>
          </div>
        </div>

        {/* Lightning Invoice Modal */}
        {showInvoice && currentInvoice && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Lightning Invoice</h3>
              
              <div className="bg-black p-4 rounded-lg mb-4">
                <div className="text-xs text-gray-400 mb-2">Invoice (click to copy)</div>
                <div className="font-mono text-xs break-all text-orange-400 cursor-pointer hover:text-orange-300"
                     onClick={() => navigator.clipboard.writeText(currentInvoice.invoice)}>
                  {currentInvoice.invoice}
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold">{currentInvoice.amount} BTC</div>
                <div className="text-gray-400">${(currentInvoice.amount * btcPrice).toLocaleString()}</div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Expires in 60 minutes</span>
              </div>
              
              {processingPayment && (
                <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent"></div>
                  <span>Waiting for payment...</span>
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowInvoice(false);
                  setProcessingPayment(false);
                }}
                className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
          
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                    {tx.type === 'lightning_topup' ? <Zap className="w-5 h-5" /> : '📥'}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {tx.type === 'lightning_topup' ? 'Lightning Top-up' : 'Initial Bitcoin Deposit'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">+{tx.amount} BTC</div>
                  <div className="text-sm text-gray-400">${tx.valueUSD.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-orange-400 mb-4">Demo Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">BTC Price</label>
            <input
              type="range"
              min="30000"
              max="60000"
              value={btcPrice}
              onChange={(e) => setBtcPrice(parseInt(e.target.value))}
              className="w-48"
            />
            <div className="text-sm font-semibold text-orange-400">${btcPrice.toLocaleString()}</div>
          </div>
          
          <button
            onClick={simulateCrash}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Crash -20%
          </button>
        </div>
      </div>
    </div>
  );
} 