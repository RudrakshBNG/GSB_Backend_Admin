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
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    const storedPermissions = localStorage.getItem("permissions");

    if (storedUser && storedRole) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, loginType) => {
    try {
      const endpoint = loginType === "admin" ? "/admin/login" : "/teams/login";
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        email,
        password,
      });

      const { user, token } = response.data;

      // Store user data
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      if (user.permissions) {
        localStorage.setItem("permissions", JSON.stringify(user.permissions));
        setPermissions(user.permissions);
      }

      setIsAuthenticated(true);
      setUser(user);
      setRole(user.role);

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
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    setPermissions(null);
  };

  const value = {
    isAuthenticated,
    user,
    role,
    permissions,
    login,
    logout,
    loading,
    API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Set axios defaults - proxy will handle /api requests to backend
//   const API_BASE = "http://localhost:3000/api";

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem("adminToken");
//     if (token) {
//       // Set axios default header
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       setIsAuthenticated(true);
//       setUser({ email: "admin@gsbpathy.com" }); // You can fetch user details from token
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${API_BASE}/auth/login`, {
//         email,
//         password,
//       });

//       const { token } = response.data;

//       // Store token
//       localStorage.setItem("adminToken", token);

//       // Set axios default header
//       axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       setIsAuthenticated(true);
//       setUser({ email });

//       return { success: true };
//     } catch (error) {
//       console.error("Login error:", error);
//       return {
//         success: false,
//         error: error.response?.data?.message || "Login failed",
//       };
//     }
//   };

//   const logout = () => {
//     // Remove token
//     localStorage.removeItem("adminToken");

//     // Remove axios default header
//     delete axios.defaults.headers.common["Authorization"];

//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   const value = {
//     isAuthenticated,
//     user,
//     login,
//     logout,
//     loading,
//     API_BASE,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
