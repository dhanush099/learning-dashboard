import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login Function
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(data)); // Save to browser
    setUser(data);
  };

  // Register Function
  const register = async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
