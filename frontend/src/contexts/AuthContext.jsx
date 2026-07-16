import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken, user: userData } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(userData);
    setPinVerified(false);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { accessToken, refreshToken, user: userData } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(userData);
    setPinVerified(false);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed with client-side logout even if network call fails
    }
    clearTokens();
    setUser(null);
    setPinVerified(false);
  }, []);

  const verifyPin = useCallback(async (pin) => {
    const res = await authApi.verifyPin(pin);
    const valid = res.data.valid;
    if (valid) {
      setPinVerified(true);
    }
    return valid;
  }, []);

  const refreshAuth = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.refresh(refresh);
      const { accessToken, refreshToken, user: userData } = res.data;
      setTokens(accessToken, refreshToken);
      setUser(userData);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const value = {
    user,
    loading,
    pinVerified,
    login,
    register,
    logout,
    verifyPin,
    setPinVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
