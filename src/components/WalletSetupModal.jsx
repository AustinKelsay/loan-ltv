import React from 'react';
import { Wallet, Settings, ExternalLink, CheckCircle } from 'lucide-react';
import { formatSats } from '../utils/bitcoinUnits';

/**
 * WalletSetupModal Component
 * Handles the wallet setup flow for both self-custodial and custodial options
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Function} props.onClose - Function to call when closing modal
 * @param {Object} props.walletState - Wallet setup state from useWalletSetup hook
 */
const WalletSetupModal = ({ show, onClose, walletState }) => {
  const {
    walletType,
    selfCustodialType,
    nwcString,
    lnurlwString,
    custodialWallet,
    loadingWallet,
    setWalletType,
    setSelfCustodialType,
    setNwcString,
    setLnurlwString,
    setupCustodialWallet,
    setupSelfCustodialWallet,
    lnbitsAPI
  } = walletState;

  // Don't render if modal should not be shown
  if (!show) return null;

  /**
   * Handles custodial wallet setup with error handling
   */
  const handleCustodialSetup = async () => {
    try {
      await setupCustodialWallet();
    } catch (error) {
      alert(error.message);
    }
  };

  /**
   * Handles self-custodial wallet setup with error handling
   */
  const handleSelfCustodialSetup = () => {
    try {
      setupSelfCustodialWallet();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6">Setup Lightning Wallet</h3>
        
        {/* Step 1: Choose wallet type */}
        {!walletType ? (
          <WalletTypeSelection onSelectType={setWalletType} />
        ) : walletType === 'self-custodial' ? (
          <SelfCustodialSetup
            selfCustodialType={selfCustodialType}
            nwcString={nwcString}
            lnurlwString={lnurlwString}
            onBack={() => setWalletType(null)}
            onSelectType={setSelfCustodialType}
            onSetNwcString={setNwcString}
            onSetLnurlwString={setLnurlwString}
            onSetup={handleSelfCustodialSetup}
          />
        ) : (
          <CustodialSetup
            custodialWallet={custodialWallet}
            loadingWallet={loadingWallet}
            lnbitsConfig={lnbitsAPI.config}
            onBack={() => setWalletType(null)}
            onSetup={handleCustodialSetup}
          />
        )}
        
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * WalletTypeSelection Component
 * Displays the initial choice between self-custodial and custodial wallets
 */
const WalletTypeSelection = ({ onSelectType }) => (
  <div className="space-y-4">
    <p className="text-gray-400 mb-6">Choose how you want to manage your Lightning wallet for top-ups:</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => onSelectType('self-custodial')}
        className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-6 h-6 text-orange-400" />
          <h4 className="text-lg font-semibold">Self-Custodial</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Connect your own Lightning wallet using NWC (Nostr Wallet Connect) or LNURLW (LNURL Withdraw).
          You maintain full control of your funds.
        </p>
      </button>
      
      <button
        onClick={() => onSelectType('custodial')}
        className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-3">
          <ExternalLink className="w-6 h-6 text-blue-400" />
          <h4 className="text-lg font-semibold">Custodial</h4>
        </div>
        <p className="text-gray-400 text-sm">
          Use a managed wallet service (LNbits demo). Quick setup but the service holds your funds.
          Great for testing and small amounts.
        </p>
      </button>
    </div>
  </div>
);

/**
 * SelfCustodialSetup Component
 * Handles NWC and LNURLW wallet setup
 */
const SelfCustodialSetup = ({
  selfCustodialType,
  nwcString,
  lnurlwString,
  onBack,
  onSelectType,
  onSetNwcString,
  onSetLnurlwString,
  onSetup
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <button onClick={onBack} className="text-gray-400 hover:text-white cursor-pointer">
        ← Back
      </button>
      <h4 className="text-lg font-semibold">Self-Custodial Setup</h4>
    </div>
    
    {/* Method selection */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => onSelectType('nwc')}
        className={`p-4 border rounded-lg transition-colors ${
          selfCustodialType === 'nwc'
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        } cursor-pointer`}
      >
        <h5 className="font-semibold mb-2">NWC (Nostr Wallet Connect)</h5>
        <p className="text-sm text-gray-400">
          Connect via Nostr Wallet Connect string from supported wallets like Alby.
        </p>
      </button>
      
      <button
        onClick={() => onSelectType('lnurlw')}
        className={`p-4 border rounded-lg transition-colors ${
          selfCustodialType === 'lnurlw'
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        } cursor-pointer`}
      >
        <h5 className="font-semibold mb-2">LNURLW (LNURL Withdraw)</h5>
        <p className="text-sm text-gray-400">
          Use LNURL withdraw links from supported services.
        </p>
      </button>
    </div>
    
    {/* NWC Setup Form */}
    {selfCustodialType === 'nwc' && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">NWC Connection String</label>
          <textarea
            value={nwcString}
            onChange={(e) => onSetNwcString(e.target.value)}
            placeholder="nostr+walletconnect://..."
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get this from your Alby wallet or other NWC-supported wallet.
          </p>
        </div>
        
        <button
          onClick={onSetup}
          disabled={!nwcString.trim()}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Connect NWC Wallet
        </button>
      </div>
    )}
    
    {/* LNURLW Setup Form */}
    {selfCustodialType === 'lnurlw' && (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">LNURLW String</label>
          <textarea
            value={lnurlwString}
            onChange={(e) => onSetLnurlwString(e.target.value)}
            placeholder="lnurlw://..."
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste your LNURL withdraw link here.
          </p>
        </div>
        
        <button
          onClick={onSetup}
          disabled={!lnurlwString.trim()}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Connect LNURLW
        </button>
      </div>
    )}
  </div>
);

/**
 * CustodialSetup Component
 * Handles LNbits custodial wallet setup
 */
const CustodialSetup = ({
  custodialWallet,
  loadingWallet,
  lnbitsConfig,
  onBack,
  onSetup
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <button onClick={onBack} className="text-gray-400 hover:text-white cursor-pointer">
        ← Back
      </button>
      <h4 className="text-lg font-semibold">Custodial Wallet Setup</h4>
    </div>
    
    {/* Info banner */}
    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-blue-400 mb-1">LNbits Demo Wallet</h5>
          <p className="text-blue-300 text-sm">
            This will connect to a demo LNbits wallet. In production, you would create your own wallet
            or connect to your preferred custodial service.
          </p>
        </div>
      </div>
    </div>
    
    {/* Wallet details */}
    {custodialWallet && (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h5 className="font-semibold mb-3">Wallet Details</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Wallet ID:</span>
            <span className="font-mono">{lnbitsConfig.walletId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Balance:</span>
            <span>{formatSats(custodialWallet.balanceSats)}</span>
          </div>
        </div>
        
        {/* Open wallet button */}
        <button
          onClick={() => window.open(`${lnbitsConfig.baseUrl}/wallet?usr=${lnbitsConfig.walletId}`, '_blank')}
          className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Open Wallet in LNbits
        </button>
      </div>
    )}
    
    {/* Custodial Wallet Option */}
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-400">LNbits Custodial Wallet</h3>
            <p className="text-xs text-gray-400">Managed Lightning wallet</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          We'll create a dedicated custodial wallet for you on our LNbits demo instance. 
          This wallet will be used for loan collateral management and automatic liquidations.
        </p>
        <div className="bg-gray-900/50 rounded p-3 text-xs text-gray-400">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Individual user wallet creation</li>
            <li>Automatic invoice generation</li>
            <li>Real-time payment detection</li>
            <li>Lightning address payments</li>
            <li>Wallet data saved locally</li>
          </ul>
        </div>
      </div>
      
      <button
        onClick={onSetup}
        disabled={loadingWallet}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loadingWallet ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Creating Your Wallet...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Create Custodial Wallet
          </>
        )}
      </button>
    </div>
  </div>
);

export default WalletSetupModal; 