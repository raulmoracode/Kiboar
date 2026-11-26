import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { clearToken, loadToken, saveToken } from "./auth";

interface AuthContextValue {
  token: string | null;
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadToken().then((value) => {
      if (!cancelled) {
        setToken(value);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (value: string) => {
    await saveToken(value);
    setToken(value);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
