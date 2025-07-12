import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios defaults - proxy will handle /api requests to backend
  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      setUser({ email: "admin@gsbpathy.com" }); // You can fetch user details from token
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const { token } = response.data;

      // Store token
      localStorage.setItem("adminToken", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsAuthenticated(true);
      setUser({ email });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem("adminToken");

    // Remove axios default header
    delete axios.defaults.headers.common["Authorization"];

    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
