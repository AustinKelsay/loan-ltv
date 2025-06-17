import { useState, useEffect } from 'react';
import { PRICE_CONFIG } from '../constants';
import type { PriceFeedData } from '../types';

/**
 * Custom hook for simulating real-time Bitcoin price feed
 * Simulates price fluctuations for demo purposes
 */
export const usePriceFeed = (initialPrice: number = PRICE_CONFIG.INITIAL_PRICE): PriceFeedData => {
  const [price, setPrice] = useState<number>(initialPrice);
  const [priceChange, setPriceChange] = useState<number>(-0.5);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * PRICE_CONFIG.MAX_VOLATILITY;
        const newPrice = Math.max(
          PRICE_CONFIG.MIN_PRICE, 
          Math.min(PRICE_CONFIG.MAX_PRICE, prev + change)
        );
        setPriceChange(((newPrice - prev) / prev) * 100);
        return newPrice;
      });
    }, PRICE_CONFIG.UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);
  
  return { 
    price, 
    priceChange, 
    setPrice 
  };
};

export default usePriceFeed; 