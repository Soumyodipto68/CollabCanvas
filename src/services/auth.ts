
export const handleGoogleLogin = () => {
    // Redirect browser directly to Express Passport route
    window.location.href = "http://localhost:4000/api/auth/google";
  };