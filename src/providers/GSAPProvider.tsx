'use client';

import React, { createContext, useContext, useLayoutEffect } from 'react';
import { gsap } from '@/lib/gsap';

const GSAPContext = createContext<typeof gsap | null>(null);

export const useGSAPClient = () => {
  const context = useContext(GSAPContext);
  if (!context) {
    throw new Error('useGSAPClient must be used within a GSAPProvider');
  }
  return context;
};

export const GSAPProvider = ({ children }: { children: React.ReactNode }) => {
  useLayoutEffect(() => {
    gsap.config({
      nullTargetWarn: false,
    });
  }, []);

  return <GSAPContext.Provider value={gsap}>{children}</GSAPContext.Provider>;
};
