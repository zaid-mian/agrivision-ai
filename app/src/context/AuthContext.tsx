import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (name: string, email: string, password: string, location: string) => Promise<void>;
  logout: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("agri-token");
    const savedUser = localStorage.getItem("agri-user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid email or password");
      }
      const { access_token, user: loggedUser } = data.data;
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem("agri-token", access_token);
      localStorage.setItem("agri-user", JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to initialize demo session");
      }
      const { access_token, user: loggedUser } = data.data;
      setToken(access_token);
      setUser(loggedUser);
      localStorage.setItem("agri-token", access_token);
      localStorage.setItem("agri-user", JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, location: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, location })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to register user");
      }
      const { access_token, user: registeredUser } = data.data;
      setToken(access_token);
      setUser(registeredUser);
      localStorage.setItem("agri-token", access_token);
      localStorage.setItem("agri-user", JSON.stringify(registeredUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("agri-token");
    localStorage.removeItem("agri-user");
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const response = await fetch(endpoint, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error("Your session has expired. Please log in again.");
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || "API request failed");
    }
    return data.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginDemo, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }
  return context;
}
