// client_side/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/current-user", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // Sends connect.sid cookie
      });

      const contentType = response.headers.get("content-type");

      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json();
        // Unwraps { user: { ... } } or raw user object safely
        setUser(data.user || data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth status error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth on initial mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check whenever tab gains focus (e.g., returning from Google OAuth redirect)
  useEffect(() => {
    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};