import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (amount: number, options?: { hideSymbol?: boolean }) => string;
  symbol: string;
}

const SYMBOL_MAP: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('spendsense_currency') as CurrencyCode) || 'INR';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('spendsense_currency', c);
  };

  const symbol = SYMBOL_MAP[currency];

  const formatCurrency = (amount: number, options?: { hideSymbol?: boolean }) => {
    const isNeg = amount < 0;
    const absVal = Math.abs(amount);
    const formattedNum = absVal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (options?.hideSymbol) {
      return `${isNeg ? '-' : ''}${formattedNum}`;
    }
    return `${isNeg ? '-' : ''}${symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
