// client_side/src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // 1. Show loading state while checkAuth() verifies session with backend
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Verifying session...</p>
      </div>
    );
  }

  // 2. If user is authenticated, render the nested route (Dashboard)
  // 3. Otherwise, redirect to login page
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};