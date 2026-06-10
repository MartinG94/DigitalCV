import React from 'react';
import { h } from '../components/ui.js';

const storageKey = 'digitalcv_theme';
const ThemeContext = React.createContext(null);

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (_error) {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(getInitialTheme);

  React.useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.error('No se pudo aplicar el tema.', error);
    }
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
    }),
    [theme]
  );

  return h(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider.');
  }

  return context;
}
