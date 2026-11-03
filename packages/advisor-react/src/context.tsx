'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { CurrencyCode } from '@charlie/advisor-types';

export interface CharlieConfig {
  apiKey?: string;
  apiUrl?: string;
  businessId?: string;
  currency?: CurrencyCode;
  timezone?: string;
}

const CharlieContext = createContext<CharlieConfig | null>(null);

export interface CharlieProviderProps {
  children: ReactNode;
  config?: CharlieConfig;
}

export function CharlieProvider({ children, config = {} }: CharlieProviderProps) {
  const mergedConfig: CharlieConfig = {
    apiUrl: 'https://api.advisor.charlie.com',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    ...config,
  };

  return (
    <CharlieContext.Provider value={mergedConfig}>
      {children}
    </CharlieContext.Provider>
  );
}

export function useCharlieContext(): CharlieConfig {
  const context = useContext(CharlieContext);
  return context || {
    apiUrl: 'https://api.advisor.charlie.com',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
  };
}
