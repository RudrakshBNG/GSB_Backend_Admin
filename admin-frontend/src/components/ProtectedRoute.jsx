import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, permission }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has permission for this route
  const hasPermission = () => {
    // Super admin or admin has access to all routes
    if (user?.role === "super-admin" || user?.role === "admin") {
      return true;
    }

    // Team members need specific permissions
    if (user?.permissions && user.permissions[permission]) {
      return user.permissions[permission].read === true;
    }

    return false;
  };

  if (!hasPermission()) {
    // Redirect to dashboard if no permission
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
