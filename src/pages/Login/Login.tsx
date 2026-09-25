// client_side/src/pages/Login.tsx
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { handleGoogleLogin } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated (or just returned from Google OAuth redirect), redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onGoogleClick = async () => {
    try {
      // Initiates Google OAuth redirect or popup authentication
      await handleGoogleLogin();
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <div className="login-shell flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl">
        <h1 className="text-center text-3xl font-bold text-white">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-gray-400">
          Continue with your Google account to access your whiteboards.
        </p>

        <button
          onClick={onGoogleClick}
          className="mt-8 flex w-full items-center justify-center bg-white gap-3   rounded-xl bg- py-3 font-semibold text-black transition hover:scale-[1.02] cursor-pointer"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;