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
        // Decode token to get user data
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));

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
          // For team members, we might need to fetch full user data including permissions
          fetchTeamMemberData(tokenPayload);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Invalid token, remove it
        localStorage.removeItem("adminToken");
      }
    }
    setLoading(false);
  }, []);

  const fetchTeamMemberData = async (tokenPayload) => {
    try {
      const response = await axios.get(`${API_BASE}/teams/me`);
      setUser({ ...response.data.data, role: "team-member" });
    } catch (error) {
      console.error("Error fetching team member data:", error);
      setUser({
        email: tokenPayload.email,
        role: "team-member",
        permissions: {},
      });
    }
  };

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
        role: "team-member",
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
