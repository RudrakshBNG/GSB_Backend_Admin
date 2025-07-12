import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Search,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const { API_BASE } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Filter orders by status and search term
    let filtered = orders;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter (name, email, orderId)
    if (searchTerm) {
      filtered = filtered.filter((order) => {
        const nameMatch = order.contactInfo?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const emailMatch = order.userId?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const orderIdMatch = order._id
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch || emailMatch || orderIdMatch;
      });
    }

    console.log("Filtered Orders:", filtered); // Debug: Log filtered orders
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders from:", `${API_BASE}/orders`); // Debug: Log API URL
      const response = await axios.get(`${API_BASE}/orders`);
      console.log("Raw response:", response.data); // Debug: Log full response
      const ordersData = response.data.orders || [];
      console.log("Parsed orders:", ordersData); // Debug: Log parsed orders
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );
  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "pending",
  ).length;
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "delivered",
  ).length;
  const avgOrderValue = filteredOrders.length
    ? totalRevenue / filteredOrders.length
    : 0;

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`); // Debug: Log status update
      await axios.put(`${API_BASE}/orders/${orderId}/status`, {
        status: newStatus,
      });
      loadOrders(); // Reload orders to show updated status
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.error || "Failed to update order status");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "flag-green";
      case "shipped":
        return "flag-yellow";
      case "pending":
        return "flag-red";
      default:
        return "flag-red";
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Orders Management</h1>
        <div
          className="filter-controls"
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <div
            className="search-box"
            style={{ position: "relative", flex: "1", minWidth: "200px" }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-gray)",
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 8px 8px 35px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                color: "var(--text-white)",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-white)",
              minWidth: "150px",
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={loadOrders}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingCart />
          </div>
          <div className="stat-content">
            <h3>{totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Package />
          </div>
          <div className="stat-content">
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(avgOrderValue)}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {order._id?.slice(-8) || "N/A"}
                  </td>
                  <td>
                    <strong>{order.contactInfo?.name || "Unknown"}</strong>
                    <br />
                    <span className="email-text">
                      {order.userId?.email || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div>{order.contactInfo?.name || "Unknown"}</div>
                    <div className="phone-text">
                      {order.contactInfo?.phone || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className="items-list">
                      {order.items?.length || 0} item(s)
                      {order.items && order.items.length > 0 && (
                        <div style={{ fontSize: "0.8rem", color: "#999" }}>
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index}>{item.name || "Unnamed item"}</div>
                          ))}
                          {order.items.length > 2 && (
                            <div>...and {order.items.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{formatCurrency(order.total)}</strong>
                  </td>
                  <td>{order.paymentMethod || "N/A"}</td>
                  <td>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--input-bg)",
                        color: "var(--text-white)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <option value="pending">PENDING</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="delivered">DELIVERED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
