import React from 'react';
import { h } from '../components/ui.js';
import { clearToken, getAdminUser, loginAdmin, logoutAdmin } from '../services/authService.js';

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = React.useState({ status: 'checking', user: null });

  React.useEffect(() => {
    let active = true;

    getAdminUser()
      .then((data) => {
        if (active) setState(data?.user ? { status: 'authenticated', user: data.user } : { status: 'anonymous', user: null });
      })
      .catch(() => {
        clearToken();
        if (active) setState({ status: 'anonymous', user: null });
      });

    return () => {
      active = false;
    };
  }, []);

  const value = React.useMemo(
    () => ({
      ...state,
      login: async (username, password) => {
        const data = await loginAdmin(username, password);
        setState({ status: 'authenticated', user: data.user });
        return data;
      },
      logout: async () => {
        clearToken();
        await logoutAdmin().catch(() => null);
        setState({ status: 'anonymous', user: null });
      }
    }),
    [state]
  );

  return h(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
