/**
 * Authentication Context
 * 
 * Provides authentication state and methods to the application.
 * Uses authService for all API calls - components should never
 * make direct API calls.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "@/services/auth.service";

const AuthContext = createContext(null);

/**
 * Hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verify current authentication status with backend
   */
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check if we have a token
      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Verify token with backend and get user data
      const result = await authService.getCurrentUser();

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        // Token is invalid or expired
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);

    if (result.success) {
      await checkAuthStatus();
    }

    return result;
  }, [checkAuthStatus]);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    const result = await authService.register(userData);

    if (result.success) {
      await checkAuthStatus();
    }

    return result;
  }, [checkAuthStatus]);

  /**
   * Initiate OAuth login flow
   */
  const loginWithOAuth = useCallback((provider) => {
    authService.oauthLogin(provider);
  }, []);

  /**
   * Handle OAuth callback with token
   */
  const handleOAuthCallback = useCallback(async (token) => {
    const result = authService.handleOAuthCallback(token);

    if (result.success) {
      await checkAuthStatus();
    }

    return result;
  }, [checkAuthStatus]);

  /**
   * Logout the current user
   */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Update user data in context
   */
  const updateUser = useCallback((userData) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
    }));
  }, []);

  const value = {
    // State
    user,
    setUser,
    updateUser,
    isAuthenticated,
    isLoading,

    // Auth methods
    login,
    register,
    loginWithOAuth,
    handleOAuthCallback,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
