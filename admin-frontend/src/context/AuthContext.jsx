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

  // Use relative URLs - proxy will handle /api requests to backend
  const API_BASE = "/api";

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        // For our base64 token format, decode it directly
        let tokenPayload;

        // Check if it's a JWT-like token (starts with base64 data)
        if (token.includes(".")) {
          // JWT format
          tokenPayload = JSON.parse(atob(token.split(".")[1]));
        } else {
          // Our custom base64 format
          tokenPayload = JSON.parse(atob(token));
        }

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setIsAuthenticated(true);

        // Set user based on token data
        if (
          tokenPayload.role === "super-admin" ||
          tokenPayload.role === "admin"
        ) {
          setUser({
            email: tokenPayload.email,
            role: tokenPayload.role,
          });
        } else {
          // For team members, use token data with default permissions
          setUser({
            id: tokenPayload.id,
            email: tokenPayload.email,
            role: "team-member",
            permissions: {}, // Will be populated on login
          });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Invalid token, remove it
        localStorage.removeItem("adminToken");
        delete axios.defaults.headers.common["Authorization"];
      }
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

      // Decode token to get role information
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          email: tokenPayload.email,
          role: tokenPayload.role || "admin",
        });
      } catch (decodeError) {
        // Fallback if token decode fails
        setUser({ email, role: "admin" });
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const teamMemberLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/teams/login`, {
        email,
        password,
      });

      const { token, user: teamMember } = response.data;

      // Store token
      localStorage.setItem("adminToken", token);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsAuthenticated(true);
      setUser({
        ...teamMember,
        isTeamMember: true,
      });

      return { success: true };
    } catch (error) {
      console.error("Team member login error:", error);
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
    teamMemberLogin,
    logout,
    loading,
    API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
