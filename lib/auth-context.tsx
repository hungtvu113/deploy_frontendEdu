"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (data: { studentId: string; name: string; password: string; phone?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(newToken);
        setUser(userData);

        return { success: true, message: response.message, user: userData };
      }

      return { success: false, message: response.message || "Đăng nhập thất bại" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      return { success: false, message };
    }
  };

  const register = async (data: { studentId: string; name: string; password: string; phone?: string }) => {
    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(newToken);
        setUser(userData);

        return { success: true, message: response.message, user: userData };
      }

      return { success: false, message: response.message || "Đăng ký thất bại" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng ký thất bại";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const getRedirectPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

