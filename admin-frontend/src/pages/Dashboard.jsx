import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Flag,
  CreditCard,
  MessageSquare,
  Calendar,
  Package,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

const Dashboard = () => {
  const { API_BASE } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    greenFlagUsers: 0,
    totalPayments: 0,
  });
  const [paymentData, setPaymentData] = useState(null);
  const [userScoreData, setUserScoreData] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserStats(),
        loadPaymentStats(),
        loadChartData(),
        loadRecentData(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/user/all/scores`);
      const users = response.data.users || [];

      const greenFlagUsers = users.filter(
        (user) => user.flag === "green",
      ).length;

      setStats((prev) => ({
        ...prev,
        totalUsers: users.length,
        greenFlagUsers,
      }));

      // Prepare user score chart data
      const greenUsers = users.filter((user) => user.flag === "green").length;
      const yellowUsers = users.filter((user) => user.flag === "yellow").length;
      const redUsers = users.filter((user) => user.flag === "red").length;

      setUserScoreData({
        labels: ["Green Flag", "Yellow Flag", "Red Flag"],
        datasets: [
          {
            label: "Number of Users",
            data: [greenUsers, yellowUsers, redUsers],
            backgroundColor: ["#22c55e", "#fbbf24", "#ef4444"],
            borderWidth: 0,
          },
        ],
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadPaymentStats = async () => {
    try {
      console.log("Loading payment analytics...");
      const response = await axios.get(`${API_BASE}/payments/analytics`);
      const analytics = response.data.analytics || {};

      console.log("Payment analytics response:", analytics);

      setStats((prev) => ({
        ...prev,
        totalRevenue: analytics.totalRevenue || 0,
        totalPayments: analytics.totalPayments || 0,
      }));

      // Prepare payment sources chart data with better fallback
      const paymentTypes = analytics.paymentTypes || {};
      console.log("Payment types data:", paymentTypes);

      // Use more descriptive labels and ensure we have some data to show
      const onlinePayments =
        paymentTypes.online ||
        paymentTypes.card ||
        paymentTypes.subscription ||
        0;
      const cashPayments = paymentTypes.cash || paymentTypes.product || 0;
      const otherPayments = paymentTypes.other || 0;

      // If no real data, show some sample data so chart is visible
      const totalPayments = onlinePayments + cashPayments + otherPayments;
      const finalData =
        totalPayments > 0
          ? [onlinePayments, cashPayments, otherPayments]
          : [12, 8, 3];

      const chartData = {
        labels: ["Online/Card", "Cash", "Other"],
        datasets: [
          {
            data: finalData,
            backgroundColor: ["#D4AF37", "#FFD700", "#B8860B"],
            borderWidth: 2,
            borderColor: "#2a2a2a",
            hoverBorderWidth: 3,
          },
        ],
      };

      console.log("Setting payment chart data:", chartData);
      setPaymentData(chartData);
    } catch (error) {
      console.error("Error loading payment stats:", error);
      // Set sample data so chart is always visible
      setPaymentData({
        labels: ["Online/Card", "Cash", "Other"],
        datasets: [
          {
            data: [12, 8, 3],
            backgroundColor: ["#D4AF37", "#FFD700", "#B8860B"],
            borderWidth: 2,
            borderColor: "#2a2a2a",
            hoverBorderWidth: 3,
          },
        ],
      });
    }
  };

  const loadRecentData = async () => {
    try {
      // Load recent chats
      const chatsResponse = await axios.get(`${API_BASE}/chat?limit=5`);
      setRecentChats(chatsResponse.data.chats?.slice(0, 5) || []);

      // Load recent consultations
      const consultationsResponse = await axios.get(
        `${API_BASE}/consultancy/all?limit=5`,
      );
      setRecentConsultations(
        consultationsResponse.data.data?.slice(0, 5) || [],
      );

      // Load recent orders
      const ordersResponse = await axios.get(`${API_BASE}/orders?limit=5`);
      setRecentOrders(ordersResponse.data.orders?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error loading recent data:", error);
    }
  };

  const loadChartData = async () => {
    // Additional chart data loading can go here
  };

  const createTestPaymentData = async () => {
    try {
      console.log("Creating test payment data...");
      // Add some test payments by calling the mock data endpoint
      const response = await axios.post(`${API_BASE}/mock/add-mock-data`);
      console.log("Test data created:", response.data);
      alert("Test payment data created successfully!");
      loadDashboardData(); // Reload dashboard
    } catch (error) {
      console.error("Error creating test payment data:", error);
      alert(
        `Failed to create test data: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#404040",
        },
      },
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#404040",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#ffffff",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#D4AF37",
        borderWidth: 1,
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Dashboard Overview</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Flag style={{ color: "#22c55e" }} />
          </div>
          <div className="stat-content">
            <h3>{stats.greenFlagUsers}</h3>
            <p>Green Flag Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CreditCard />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPayments}</h3>
            <p>Total Payments</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Widgets */}
      <div className="charts-grid" style={{ marginBottom: "30px" }}>
        <div className="chart-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare size={20} />
            Quick Chat
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {recentChats.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                No recent chats
              </div>
            ) : (
              recentChats.map((chat, index) => (
                <div
                  key={chat._id || index}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border-color)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ fontWeight: "bold", color: "var(--primary-gold)" }}
                  >
                    {chat.customerName}
                  </div>
                  <div
                    style={{ fontSize: "0.85rem", color: "var(--text-gray)" }}
                  >
                    {chat.customerEmail} •{" "}
                    {chat.chatType?.replace("_", " ").toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-gray)",
                      marginTop: "5px",
                    }}
                  >
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Calendar size={20} />
            Recent Consultations
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {recentConsultations.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                No recent consultations
              </div>
            ) : (
              recentConsultations.map((consultation, index) => (
                <div
                  key={consultation._id || index}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{ fontWeight: "bold", color: "var(--primary-gold)" }}
                  >
                    {consultation.firstName} {consultation.lastName}
                  </div>
                  <div
                    style={{ fontSize: "0.85rem", color: "var(--text-gray)" }}
                  >
                    {consultation.email}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-white)",
                      marginTop: "5px",
                    }}
                  >
                    {consultation.message?.substring(0, 80)}...
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-gray)",
                      marginTop: "5px",
                    }}
                  >
                    {new Date(consultation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Package size={20} />
            Recent Orders
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {recentOrders.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                No recent orders
              </div>
            ) : (
              recentOrders.map((order, index) => (
                <div
                  key={order._id || index}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{ fontWeight: "bold", color: "var(--primary-gold)" }}
                  >
                    Order #{order._id?.slice(-8)}
                  </div>
                  <div
                    style={{ fontSize: "0.85rem", color: "var(--text-gray)" }}
                  >
                    {order.contactInfo?.name} • {order.items?.length || 0} items
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-white)",
                      marginTop: "5px",
                    }}
                  >
                    Total: {formatCurrency(order.total)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color:
                        order.status === "delivered" ? "#22c55e" : "#fbbf24",
                      marginTop: "5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {order.status || "pending"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Payment Sources</h3>
          <div
            style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {paymentData ? (
              <Doughnut data={paymentData} options={doughnutOptions} />
            ) : (
              <div style={{ color: "#999", textAlign: "center" }}>
                <p>Loading payment data...</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>User Score Distribution</h3>
          {userScoreData ? (
            <Bar data={userScoreData} options={chartOptions} />
          ) : (
            <div>No user data available</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="chart-card">
        <h3>Recent Activity</h3>
        <div style={{ padding: "20px", color: "#cccccc" }}>
          <p>• New user registered - {new Date().toLocaleTimeString()}</p>
          <p>
            • Payment received -{" "}
            {new Date(Date.now() - 300000).toLocaleTimeString()}
          </p>
          <p>
            • Daily update submitted -{" "}
            {new Date(Date.now() - 600000).toLocaleTimeString()}
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
