import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatPrice = (priceInr, priceUsd) => {
    if (currency === 'INR') {
      return `₹${priceInr.toLocaleString('en-IN')}`;
    }
    return `$${priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getPrice = (priceInr, priceUsd) => {
    return currency === 'INR' ? priceInr : priceUsd;
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'INR' ? 'USD' : 'INR');
  };

  const value = {
    currency,
    setCurrency,
    toggleCurrency,
    formatPrice,
    getPrice
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
