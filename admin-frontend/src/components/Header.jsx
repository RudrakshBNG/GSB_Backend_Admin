import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, UserCircle, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const getPageTitle = () => {
    const titles = {
      "/": "Dashboard",
      "/dashboard": "Dashboard",
      "/users": "Users Management",
      "/payments": "Payment Analytics",
      "/daily-updates": "Daily Updates",
      "/consultations": "Consultations",
      "/orders": "Orders",
      "/team": "Team Management",
    };

    return titles[location.pathname] || "Dashboard";
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle">
          <Menu size={20} />
        </button>
        {/* <h1 className="page-title">{getPageTitle()}</h1> */}
      </div>
      <div className="header-right">
        <button
          onClick={toggleTheme}
          className="sidebar-toggle"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="user-info">
          <span>Welcome, Admin</span>
          <div className="user-avatar">
            <UserCircle size={32} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
