// @ts-nocheck - Temporary during migration to Next.js
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Terminal, Copy, Trash2 } from 'lucide-react';

/**
 * SystemLogsPanel Component
 * Displays transparent system logs for Lightning operations, wallet setup, and payments
 * Replaces console.log for user-facing transparency
 */
const SystemLogsPanel = ({ logs, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const copyLogsToClipboard = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`).join('\n');
    navigator.clipboard.writeText(logText);
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🐛';
      case 'liquidation': return '🚨';
      case 'payment': return '⚡';
      case 'wallet': return '💰';
      default: return '📝';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          System Logs ({logs.length})
          {logs.some(log => log.level === 'error') && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-40 w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          <span className="font-semibold text-orange-400">System Logs</span>
          <span className="text-xs text-gray-500">({logs.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={copyLogsToClipboard}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Copy logs to clipboard"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-gray-400 hover:text-white transition-colors ml-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs Content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto p-3 space-y-1">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-sm italic text-center py-4">
              No system logs yet...
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-xs font-mono flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-shrink-0">
                  {getLogIcon(log.level)}
                </span>
                <span className={`${getLogColor(log.level)} break-words`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
      
      {/* Summary when collapsed */}
      {!isExpanded && logs.length > 0 && (
        <div className="p-3 text-xs text-gray-400">
          Last: {logs[logs.length - 1]?.message.substring(0, 50)}...
        </div>
      )}
    </div>
  );
};

export default SystemLogsPanel; 