import { useCallback } from 'react';
import { satsToUSD } from '../utils/bitcoinUnits';
import { LIQUIDATION_THRESHOLDS, DEFAULT_AMOUNTS } from '../constants';
import type { Loan, LoanMetrics } from '../types';

/**
 * Custom hook for loan calculations
 * Encapsulates all LTV and liquidation logic
 */
export const useLoanCalculations = (btcPrice: number) => {
  /**
   * Calculate comprehensive loan metrics
   */
  const calculateMetrics = useCallback((loan: Loan | null, lightningWalletSats: number = 0): LoanMetrics | null => {
    if (!loan) return null;
    
    // Apply voltage reserve to lightning wallet balance
    const effectiveLightningWalletSats = Math.max(0, lightningWalletSats - DEFAULT_AMOUNTS.VOLTAGE_RESERVE);
    
    // Calculate collateral values
    const totalCollateralSats = loan.collateral.amountSats + effectiveLightningWalletSats;
    const totalCollateralValueUSD = satsToUSD(totalCollateralSats, btcPrice);
    const mainCollateralValueUSD = satsToUSD(loan.collateral.amountSats, btcPrice);
    const lightningCollateralValueUSD = satsToUSD(effectiveLightningWalletSats, btcPrice);
    
    // Calculate LTV
    const ltv = (loan.principal / totalCollateralValueUSD) * 100;
    
    // Determine status
    const { ltvStatus, gameStatus } = getLTVStatus(ltv);
    
    // Calculate required topup to reach 65% LTV
    const targetCollateralValue = loan.principal / 0.65;
    const requiredTopupUSD = Math.max(0, targetCollateralValue - totalCollateralValueUSD);
    const requiredTopupSats = requiredTopupUSD > 0 ? Math.ceil(requiredTopupUSD / btcPrice * 100_000_000) : 0;
    
    return {
      // Collateral metrics
      totalCollateralSats,
      totalCollateralValueUSD,
      mainCollateralValueUSD,
      lightningCollateralValueUSD,
      lightningWalletSats: effectiveLightningWalletSats,
      
      // LTV and status
      ltv,
      ltvStatus,
      gameStatus,
      lightningLiquidationThreshold: LIQUIDATION_THRESHOLDS.LIGHTNING_LIQUIDATION,
      loanLiquidationThreshold: LIQUIDATION_THRESHOLDS.LOAN_LIQUIDATION,
      
      // Top-up calculations
      requiredTopupSats
    };
  }, [btcPrice]);

  /**
   * Determine LTV status based on thresholds
   */
  const getLTVStatus = useCallback((ltv: number): { ltvStatus: LoanMetrics['ltvStatus']; gameStatus: LoanMetrics['gameStatus'] } => {
    let ltvStatus: LoanMetrics['ltvStatus'];
    let gameStatus: LoanMetrics['gameStatus'];
    
    if (ltv >= LIQUIDATION_THRESHOLDS.LOAN_LIQUIDATION) {
      ltvStatus = 'liquidated';
      gameStatus = 'loan_liquidated';
    } else if (ltv >= LIQUIDATION_THRESHOLDS.LIGHTNING_LIQUIDATION) {
      ltvStatus = 'critical';
      gameStatus = 'lightning_zone';
    } else if (ltv >= LIQUIDATION_THRESHOLDS.WARNING) {
      ltvStatus = 'warning';
      gameStatus = 'safe';
    } else {
      ltvStatus = 'healthy';
      gameStatus = 'safe';
    }
    
    return { ltvStatus, gameStatus };
  }, []);

  /**
   * Check if auto-liquidation should be triggered
   */
  const shouldTriggerLiquidation = useCallback((ltv: number, gameStatus: LoanMetrics['gameStatus']): boolean => {
    return ltv >= LIQUIDATION_THRESHOLDS.LIGHTNING_LIQUIDATION && 
           gameStatus === 'lightning_zone';
  }, []);

  /**
   * Calculate liquidation amount (all available Lightning wallet balance minus reserve)
   */
  const calculateLiquidationAmount = useCallback((lightningWalletSats: number): number => {
    return Math.max(0, lightningWalletSats - DEFAULT_AMOUNTS.VOLTAGE_RESERVE);
  }, []);

  return {
    calculateMetrics,
    getLTVStatus,
    shouldTriggerLiquidation,
    calculateLiquidationAmount,
  };
};

export default useLoanCalculations; 