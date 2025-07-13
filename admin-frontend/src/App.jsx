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
import ProtectedRoute from "./components/ProtectedRoute";
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
                  <ProtectedRoute permission="users">
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute permission="payments">
                    <AppLayout>
                      <Payments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/videos"
                element={
                  <ProtectedRoute permission="videos">
                    <AppLayout>
                      <Videos />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/diet-plans"
                element={
                  <ProtectedRoute permission="dietPlans">
                    <AppLayout>
                      <DietPlans />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute permission="products">
                    <AppLayout>
                      <Products />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily-updates"
                element={
                  <ProtectedRoute permission="dailyUpdates">
                    <AppLayout>
                      <DailyUpdates />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultations"
                element={
                  <ProtectedRoute permission="consultations">
                    <AppLayout>
                      <Consultations />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute permission="orders">
                    <AppLayout>
                      <Orders />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute permission="teams">
                    <AppLayout>
                      <Team />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats"
                element={
                  <ProtectedRoute permission="chats">
                    <AppLayout>
                      <Chats />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute permission="notifications">
                    <AppLayout>
                      <Notifications />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-stories"
                element={
                  <ProtectedRoute permission="stories">
                    <AppLayout>
                      <UserStories />
                    </AppLayout>
                  </ProtectedRoute>
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
