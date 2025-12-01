import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { apiClient, storage } from "../lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.user);
  const [token, setToken] = useState(() => storage.token);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    storage.user = user;
  }, [user]);

  useEffect(() => {
    storage.token = token;
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const data = await apiClient.get("/users/me");
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error(err);
      setToken(null);
      setUser(null);
      return null;
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (token && !user) {
        await fetchProfile();
      }
      if (mounted) setIsReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [token, user, fetchProfile]);

  const login = useCallback(async (credentials) => {
    setError("");
    const data = await apiClient.post("/auth/login", credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setError("");
    const data = await apiClient.post("/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      error,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
      setError,
    }),
    [user, token, isReady, error, login, register, logout, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

