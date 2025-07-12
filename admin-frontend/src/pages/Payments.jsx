import React, { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, Users, ShoppingCart } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Payments = () => {
  const { API_BASE } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/payments`);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments by category (subscription vs order payments)
  const subscriptionPayments = payments.filter(
    (p) =>
      p.subscriptionType ||
      p.type === "subscription" ||
      p.category === "subscription",
  );

  const orderPayments = payments.filter(
    (p) => p.orderId || p.type === "order" || p.category === "order",
  );

  const filteredPayments =
    categoryFilter === "subscription"
      ? subscriptionPayments
      : categoryFilter === "order"
        ? orderPayments
        : payments;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "flag-green";
      case "pending":
        return "flag-yellow";
      case "failed":
        return "flag-red";
      default:
        return "flag-red";
    }
  };

  const subscriptionRevenue = subscriptionPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const orderRevenue = orderPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const totalRevenue = subscriptionRevenue + orderRevenue;

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Payment Analytics</h1>
        <div className="filter-controls">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="subscription">Subscription Payments</option>
            <option value="order">Order Payments</option>
          </select>
          <button className="btn btn-primary" onClick={loadPayments}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Payment Categories - Only Two */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{subscriptionPayments.length}</h3>
            <p>Subscription Payments</p>
            <div style={{ fontSize: "0.9rem", color: "#999" }}>
              {formatCurrency(subscriptionRevenue)}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingCart />
          </div>
          <div className="stat-content">
            <h3>{orderPayments.length}</h3>
            <p>Order Payments</p>
            <div style={{ fontSize: "0.9rem", color: "#999" }}>
              {formatCurrency(orderRevenue)}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
            <div style={{ fontSize: "0.9rem", color: "#999" }}>
              {payments.length} payments
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{payments.filter((p) => p.status === "completed").length}</h3>
            <p>Successful Payments</p>
            <div style={{ fontSize: "0.9rem", color: "#999" }}>
              {(
                (payments.filter((p) => p.status === "completed").length /
                  payments.length) *
                100
              ).toFixed(1)}
              % success rate
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Method</th>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <strong>{payment.user?.fullName || "Unknown User"}</strong>
                    <br />
                    <span className="email-text">{payment.user?.email}</span>
                  </td>
                  <td>
                    <strong>{formatCurrency(payment.amount)}</strong>
                  </td>
                  <td>
                    <span
                      className={`flag-badge ${payment.subscriptionType ? "flag-blue" : "flag-orange"}`}
                    >
                      {payment.subscriptionType ? "SUBSCRIPTION" : "ORDER"}
                    </span>
                    {payment.subscriptionType && (
                      <div style={{ fontSize: "0.8rem", color: "#999" }}>
                        {payment.subscriptionType}
                      </div>
                    )}
                  </td>
                  <td>{payment.paymentMethod}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {payment.transactionId}
                  </td>
                  <td>
                    {formatDate(payment.paymentDate || payment.createdAt)}
                  </td>
                  <td>
                    <span
                      className={`flag-badge ${getStatusClass(payment.status)}`}
                    >
                      {payment.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
