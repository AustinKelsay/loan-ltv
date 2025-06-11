// @ts-nocheck - Temporary during migration to Next.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for managing system logs
 * Provides logging functions and state management for transparent system operations
 */
export const useSystemLogs = () => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((level, message, data = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    setLogs(prev => [...prev, newLog]);
    
    // Also log to console for debugging
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Convenience logging methods
  const logInfo = useCallback((message, data) => addLog('info', message, data), [addLog]);
  const logSuccess = useCallback((message, data) => addLog('success', message, data), [addLog]);
  const logWarning = useCallback((message, data) => addLog('warning', message, data), [addLog]);
  const logError = useCallback((message, data) => addLog('error', message, data), [addLog]);
  const logDebug = useCallback((message, data) => addLog('debug', message, data), [addLog]);
  const logPayment = useCallback((message, data) => addLog('payment', message, data), [addLog]);
  const logWallet = useCallback((message, data) => addLog('wallet', message, data), [addLog]);
  const logLiquidation = useCallback((message, data) => addLog('liquidation', message, data), [addLog]);

  return {
    logs,
    clearLogs,
    logInfo,
    logSuccess,
    logWarning,
    logError,
    logDebug,
    logPayment,
    logWallet,
    logLiquidation
  };
}; 