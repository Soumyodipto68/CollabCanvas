const API_URL = import.meta.env.VITE_API_URL;

export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    credentials: "include",
  });

  window.location.href = "/";
};