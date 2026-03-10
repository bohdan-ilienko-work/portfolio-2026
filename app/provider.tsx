"use client";

import {useEffect} from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import type {ThemeProviderProps} from 'next-themes';

const VISITOR_KEY = 'portfolio_unique_visitor_v1';

export const ThemeProvider = ({children, ...props}: ThemeProviderProps) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (localStorage.getItem(VISITOR_KEY) === '1') {
        return;
      }

      localStorage.setItem(VISITOR_KEY, '1');
    } catch {
      return;
    }

    void fetch('/api/track-visitor', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        url: window.location.href,
        path: window.location.pathname
      }),
      keepalive: true
    }).catch(() => {
      try {
        localStorage.removeItem(VISITOR_KEY);
      } catch {}
    });
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
