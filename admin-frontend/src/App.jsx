import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Videos from "./pages/Videos";
import DietPlans from "./pages/DietPlans";
import Products from "./pages/Products";
import DailyUpdates from "./pages/DailyUpdates";
import Consultations from "./pages/Consultations";
import Orders from "./pages/Orders";
import Team from "./pages/Team";
import Chats from "./pages/Chats";
import Notifications from "./pages/Notifications";
import UserStories from "./pages/UserStories";
import Login from "./pages/Login";
import "./App.css";

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/users"
                element={
                  <AppLayout>
                    <Users />
                  </AppLayout>
                }
              />
              <Route
                path="/payments"
                element={
                  <AppLayout>
                    <Payments />
                  </AppLayout>
                }
              />
              <Route
                path="/videos"
                element={
                  <AppLayout>
                    <Videos />
                  </AppLayout>
                }
              />
              <Route
                path="/diet-plans"
                element={
                  <AppLayout>
                    <DietPlans />
                  </AppLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <AppLayout>
                    <Products />
                  </AppLayout>
                }
              />
              <Route
                path="/daily-updates"
                element={
                  <AppLayout>
                    <DailyUpdates />
                  </AppLayout>
                }
              />
              <Route
                path="/consultations"
                element={
                  <AppLayout>
                    <Consultations />
                  </AppLayout>
                }
              />
              <Route
                path="/orders"
                element={
                  <AppLayout>
                    <Orders />
                  </AppLayout>
                }
              />
              <Route
                path="/team"
                element={
                  <AppLayout>
                    <Team />
                  </AppLayout>
                }
              />
              <Route
                path="/chats"
                element={
                  <AppLayout>
                    <Chats />
                  </AppLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                }
              />
              <Route
                path="/user-stories"
                element={
                  <AppLayout>
                    <UserStories />
                  </AppLayout>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
