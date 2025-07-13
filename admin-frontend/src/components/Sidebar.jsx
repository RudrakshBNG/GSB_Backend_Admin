import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Stethoscope,
  ShoppingCart,
  UserCheck,
  LogOut,
  Play,
  FileText,
  Package,
  MessageSquare,
  Bell,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const allMenuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      permission: "dashboard",
    },
    { path: "/users", icon: Users, label: "Users", permission: "users" },
    {
      path: "/payments",
      icon: CreditCard,
      label: "Payments",
      permission: "payments",
    },
    {
      path: "/user-stories",
      icon: BookOpen,
      label: "User Stories",
      permission: "stories",
    },
    { path: "/videos", icon: Play, label: "Videos", permission: "videos" },
    {
      path: "/diet-plans",
      icon: FileText,
      label: "Diet Plans",
      permission: "dietPlans",
    },
    {
      path: "/products",
      icon: Package,
      label: "Products",
      permission: "products",
    },
    { path: "/team", icon: UserCheck, label: "Team", permission: "teams" },
    {
      path: "/chats",
      icon: MessageSquare,
      label: "Chats",
      permission: "chats",
    },
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifications",
      permission: "notifications",
    },
    {
      path: "/daily-updates",
      icon: Calendar,
      label: "Daily Updates",
      permission: "dailyUpdates",
    },
    {
      path: "/consultations",
      icon: Stethoscope,
      label: "Consultations",
      permission: "consultations",
    },
    {
      path: "/orders",
      icon: ShoppingCart,
      label: "Orders",
      permission: "orders",
    },
  ];

  // Check if user has permission for a specific module
  const hasPermission = (permission) => {
    // If no user is logged in, deny access
    if (!user) {
      return false;
    }

    // Super admin or admin has access to all modules
    if (user?.role === "super-admin" || user?.role === "admin") {
      return true;
    }

    // For hardcoded admin email (temporary fix)
    if (user?.email === "admin@gsbpathy.com") {
      return true;
    }

    // Team members need specific permissions
    if (user?.permissions && user.permissions[permission]) {
      return user.permissions[permission].read === true;
    }

    return false;
  };

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter((item) =>
    hasPermission(item.permission),
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img
            src="/logo.png"
            alt="GSB Pathy Logo"
            style={{ width: "150px", height: "100px" }}
          />
        </div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/");

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`menu-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li>
          <button
            onClick={handleLogout}
            className="menu-item"
            style={{
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
