// @ts-nocheck - Temporary during migration to Next.js
import React from 'react';
import { Clock, Copy, Send, XCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { satsToUSD, formatSats } from '../utils/bitcoinUnits';

/**
 * LightningInvoiceModal Component
 * Displays Lightning invoice for incoming payments (self-custodial and custodial funding)
 * OR displays status of an outgoing payment (legacy custodial)
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the modal
 * @param {Object} props.invoice - Invoice/Payment details. Structure varies based on paymentType.
 *    For incoming: { paymentType: 'incoming', invoice: 'lnbc...', amountSats: 123, ... }
 *    For custodial_funding: { paymentType: 'custodial_funding', invoice: 'lnbc...', amountSats: 123, walletUrl: '...', ... }
 *    For outgoing: { paymentType: 'outgoing', targetAddress: 'user@domain.com', amountSats: 123, paymentHash: '...', ... }
 * @param {number} props.btcPrice - Current BTC price for USD conversion
 * @param {boolean} props.processingPayment - Whether payment is being processed/polled
 * @param {string|null} props.paymentError - Error message to display
 * @param {Function} props.onClose - Function to call when closing modal
 */
const LightningInvoiceModal = ({ 
  show, 
  invoice, 
  btcPrice, 
  processingPayment, 
  paymentError, 
  onClose,
  onStopPolling 
}) => {
  if (!show || !invoice) {
    // If modal is shown due to an error without full invoice details (e.g. balance check failed)
    if (show && paymentError && (!invoice || invoice.paymentType === 'error')) {
      // Render a simplified modal just for the error message
      return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-red-500">Payment Error</h3>
            <ErrorDisplay message={paymentError} />
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const isOutgoingPayment = invoice.paymentType === 'outgoing' || invoice.paymentType === 'auto_liquidation';
  const isCustodialFunding = invoice.paymentType === 'custodial_funding';
  const isAutoLiquidation = invoice.paymentType === 'auto_liquidation';
  const isIncomingPayment = invoice.paymentType === 'incoming' || isCustodialFunding;
  const isErrorState = !!paymentError && !processingPayment;
  const isSuccessState = !paymentError && !processingPayment && invoice.paymentHash;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const openVoltageWallet = () => {
    if (invoice.walletUrl) {
      window.open(invoice.walletUrl, '_blank');
    }
  };

  let modalTitle = 'Lightning Invoice';
  if (isOutgoingPayment && !isAutoLiquidation) modalTitle = 'Processing Lightning Payment';
  if (isAutoLiquidation) modalTitle = '🚨 Auto-Liquidation';
  if (isCustodialFunding) modalTitle = 'Fund Your Voltage Wallet';
  if (isErrorState) modalTitle = 'Payment Failed';
  if (isSuccessState && isOutgoingPayment && !isAutoLiquidation) modalTitle = 'Payment Sent Successfully';
  if (isSuccessState && isAutoLiquidation) modalTitle = '🚨 Liquidation Complete';
  if (isSuccessState && isIncomingPayment) modalTitle = isCustodialFunding ? 'Wallet Funded Successfully' : 'Payment Received (Simulated)';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <h3 className={`text-xl font-semibold mb-4 ${isErrorState ? 'text-red-500' : isSuccessState ? (isAutoLiquidation ? 'text-red-400' : 'text-green-500') : (isAutoLiquidation ? 'text-red-400' : '')}`}>
          {modalTitle}
        </h3>
        
        {/* Display Area */}
        {!isErrorState && isOutgoingPayment && (
          <OutgoingPaymentDisplay 
            targetAddress={invoice.targetAddress}
            amountSats={invoice.amountSats}
            btcPrice={btcPrice}
            comment={invoice.comment}
            isSuccess={isSuccessState}
            isAutoLiquidation={isAutoLiquidation}
            ltvAtLiquidation={invoice.ltvAtLiquidation}
            updatedAmount={invoice.updatedAmount}
            originalAmount={invoice.originalAmount}
          />
        )}
        
        {!isErrorState && isIncomingPayment && (
          <>
            {isCustodialFunding && (
              <CustodialFundingDisplay 
                amountSats={invoice.amountSats}
                btcPrice={btcPrice}
                isSuccess={isSuccessState}
                walletName={invoice.walletName}
              />
            )}
            <InvoiceDisplay 
              invoiceString={invoice.invoice} 
              onCopy={() => copyToClipboard(invoice.invoice)} 
              isSuccess={isSuccessState}
              isCustodial={isCustodialFunding}
            />
            <AmountDisplay 
              amountSats={invoice.amountSats} 
              btcPrice={btcPrice} 
            />
          </>
        )}
        
        {!isErrorState && !isOutgoingPayment && !isSuccessState && <ExpiryInfo />}
        
        {/* Status/Error Display Area */}
        {processingPayment && <PaymentStatus isOutgoing={isOutgoingPayment} isCustodial={isCustodialFunding} onStopPolling={onStopPolling} />}
        {isErrorState && <ErrorDisplay message={paymentError} />}
        {isSuccessState && <SuccessDisplay isOutgoing={isOutgoingPayment} isCustodial={isCustodialFunding} />}
        
        {/* Voltage wallet management button */}
        {isCustodialFunding && invoice.walletUrl && (
          <button
            onClick={openVoltageWallet}
            className="w-full py-3 mb-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
          >
            <ExternalLink className="w-4 h-4" />
            Open Voltage Wallet
          </button>
        )}
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * CustodialFundingDisplay Component
 * Shows info about funding the custodial wallet
 */
const CustodialFundingDisplay = ({ amountSats, btcPrice, isSuccess, walletName }) => (
  <div className={`p-4 rounded-lg mb-4 text-center ${isSuccess ? 'bg-green-900/30' : 'bg-blue-900/30'}`}>
    <div className={`w-12 h-12 ${isSuccess ? 'text-green-500' : 'text-blue-400'} mx-auto mb-3 flex items-center justify-center`}>
      {isSuccess ? <CheckCircle className="w-12 h-12" /> : '💰'}
    </div>
    <p className="text-lg font-semibold mb-2">
      {isSuccess ? 'Added' : 'Add'} {formatSats(amountSats)} to Your Wallet
    </p>
    {walletName && (
      <p className="text-xs text-gray-400 mb-2">
        Wallet: {walletName}
      </p>
    )}
    <p className="text-gray-400 mb-2">
      (≈ ${satsToUSD(amountSats, btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
    </p>
    <p className="text-sm text-gray-300">
      {isSuccess ? 
        'Funds have been added to your custodial wallet and loan collateral.' : 
        'Pay the invoice below to fund your custodial wallet and increase your loan collateral.'
      }
    </p>
  </div>
);

/**
 * InvoiceDisplay Component (for incoming payments)
 * Shows the Lightning invoice with copy functionality
 */
const InvoiceDisplay = ({ invoiceString, onCopy, isSuccess, isCustodial }) => (
  <div className={`bg-black p-4 rounded-lg mb-4 ${isSuccess ? 'border border-green-500' : ''}`}>
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-gray-400">
        {isCustodial ? 'Voltage Wallet Invoice' : 'Invoice'} (click to copy)
      </span>
      {!isSuccess && (
        <button
          onClick={onCopy}
          className="text-gray-400 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
    </div>
    <div 
      className={`font-mono text-xs break-all ${isSuccess ? 'text-green-400' : 'text-orange-400'} ${!isSuccess ? 'cursor-pointer hover:text-orange-300' : ''} transition-colors`}
      onClick={!isSuccess ? onCopy : undefined}
      title={!isSuccess ? "Click to copy" : "Payment Received"}
    >
      {invoiceString}
    </div>
  </div>
);

/**
 * OutgoingPaymentDisplay Component
 * Shows details of an outgoing payment being processed
 */
const OutgoingPaymentDisplay = ({ targetAddress, amountSats, btcPrice, comment, isSuccess, isAutoLiquidation, ltvAtLiquidation, updatedAmount, originalAmount }) => (
  <div className={`p-4 rounded-lg mb-4 text-center ${
    isAutoLiquidation ? 
      (isSuccess ? 'bg-red-900/30 border border-red-500' : 'bg-red-900/20') : 
      (isSuccess ? 'bg-green-900/30' : 'bg-gray-800')
  }`}>
    {isAutoLiquidation ? (
      <div className={`w-12 h-12 ${isSuccess ? 'text-red-400' : 'text-red-500'} mx-auto mb-3 flex items-center justify-center`}>
        🚨
      </div>
    ) : (
      <Send className={`w-12 h-12 ${isSuccess ? 'text-green-500' : 'text-orange-400'} mx-auto mb-3`} />
    )}
    
    <p className="text-lg font-semibold">
      {isAutoLiquidation ? 
        (isSuccess ? 'Liquidated' : 'Liquidating') : 
        (isSuccess ? 'Sent' : 'Sending')
      } {formatSats(amountSats)}
    </p>
    
    {/* Show amount update notification for auto-liquidations */}
    {isAutoLiquidation && updatedAmount && originalAmount && originalAmount !== amountSats && (
      <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-xs text-yellow-300">
        <div className="flex items-center justify-center gap-1 mb-1">
          <span>📊</span>
          <strong>Amount Updated</strong>
        </div>
        <div>
          {formatSats(originalAmount)} → {formatSats(amountSats)}
        </div>
        <div className="text-yellow-400 mt-1">
          (Adjusted for price changes)
        </div>
      </div>
    )}
    
    <p className="text-gray-400 mb-1">
      (≈ ${satsToUSD(amountSats, btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
    </p>
    <p className="text-sm text-gray-300 mb-2">
      {isAutoLiquidation ? 'Liquidated to' : 'to'} <span className={`font-medium ${
        isAutoLiquidation ? 'text-red-300' : 
        (isSuccess ? 'text-green-300' : 'text-orange-300')
      }`}>{targetAddress}</span>
    </p>
    {comment && (
      <p className="text-xs text-gray-500 italic">Comment: "{comment}"</p>
    )}
    {isAutoLiquidation && ltvAtLiquidation && (
      <div className="mt-3 p-2 bg-red-900/30 rounded text-xs text-red-300">
        <strong>Liquidation Trigger:</strong> LTV reached {ltvAtLiquidation.toFixed(1)}%
      </div>
    )}
  </div>
);

/**
 * AmountDisplay Component (used for incoming payments)
 * Shows the amount in sats and USD equivalent
 */
const AmountDisplay = ({ amountSats, btcPrice }) => (
  <div className="text-center mb-4">
    <div className="text-2xl font-bold">{formatSats(amountSats)}</div>
    <div className="text-gray-400">
      ${satsToUSD(amountSats, btcPrice).toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </div>
  </div>
);

/**
 * ExpiryInfo Component (used for incoming payments)
 * Shows invoice expiry information
 */
const ExpiryInfo = () => (
  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
    <Clock className="w-4 h-4" />
    <span>Expires in 60 minutes</span>
  </div>
);

/**
 * PaymentStatus Component
 * Shows payment processing status with loading animation and stop button
 */
const PaymentStatus = ({ isOutgoing, isCustodial, onStopPolling }) => {
  let message = 'Waiting for incoming payment...';
  if (isOutgoing) message = 'Processing payment... Please wait.';
  if (isCustodial) message = 'Waiting for wallet funding...';
  
  return (
    <div className="my-4">
      <div className="flex items-center justify-center gap-2 text-green-400 py-3 bg-green-900/30 rounded-md text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-400 border-t-transparent"></div>
        <span>{message}</span>
      </div>
      {onStopPolling && (
        <button
          onClick={onStopPolling}
          className="w-full mt-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
        >
          Stop Polling
        </button>
      )}
    </div>
  );
};

/**
 * ErrorDisplay Component
 * Shows payment error message
 */
const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center gap-3 text-red-400 my-4 p-3 bg-red-900/30 rounded-md text-sm">
    <XCircle className="w-6 h-6 flex-shrink-0" />
    <span className="text-left">{message || 'An unknown error occurred.'}</span>
  </div>
);

/**
 * SuccessDisplay Component
 * Shows payment success message
 */
const SuccessDisplay = ({ isOutgoing, isCustodial }) => {
  let message = 'Payment confirmed!';
  if (isOutgoing) message = 'Payment sent successfully!';
  if (isCustodial) message = 'Wallet funded successfully!';
  
  return (
    <div className="flex items-center justify-center gap-2 text-green-400 my-4 py-3 bg-green-900/30 rounded-md text-sm">
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
};

export default LightningInvoiceModal; 