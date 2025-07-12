import React, { useState, useEffect } from "react";
import { RefreshCw, Plus, Bell, Send, Trash2, Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Notifications = () => {
  const { API_BASE } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipients: "All Users",
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    // Filter notifications based on search
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
    setCurrentPage(1);
  }, [notifications, searchTerm]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications`);
      setNotifications(response.data.data || []);
      setFilteredNotifications(response.data.data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/notifications`, formData);

      setShowModal(false);
      setFormData({
        title: "",
        message: "",
        recipients: "All Users",
      });
      loadNotifications();
      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error sending notification. Please try again.");
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await axios.delete(`${API_BASE}/notifications/${notificationId}`);
        loadNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Error deleting notification. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );
  const totalPages = Math.ceil(
    filteredNotifications.length / notificationsPerPage
  );

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Notifications Management</h1>
        <div className="filter-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                title: "",
                message: "",
                recipients: "All Users",
              });
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Send Notification
          </button>
          <button className="btn btn-secondary" onClick={loadNotifications}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="filter-controls" style={{ marginBottom: "20px" }}>
        <div
          className="search-box"
          style={{ position: "relative", flex: "1", maxWidth: "400px" }}
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
            placeholder="Search notifications..."
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
      </div>
      {/* Notification Stats */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-icon">
            <Bell />
          </div>
          <div className="stat-content">
            <h3>{notifications.length}</h3>
            <p>Total Notifications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {notifications.filter((n) => n.recipients === "All Users").length}
            </h3>
            <p>All Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {
                notifications.filter((n) => n.recipients === "Premium Users")
                  .length
              }
            </h3>
            <p>Premium Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {
                notifications.filter(
                  (n) =>
                    new Date(n.sentAt).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </h3>
            <p>Today</p>
          </div>
        </div>
      </div>
      {/* Notifications List */}
      <div style={{ display: "grid", gap: "15px", marginBottom: "30px" }}>
        {currentNotifications.map((notification) => (
          <div key={notification._id} className="chart-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <Bell size={20} color="var(--primary-gold)" />
                  <h3
                    style={{
                      color: "var(--primary-gold)",
                      fontSize: "1.1rem",
                      margin: 0,
                    }}
                  >
                    {notification.title}
                  </h3>
                </div>

                <p
                  style={{
                    color: "var(--text-white)",
                    marginBottom: "15px",
                    lineHeight: "1.5",
                  }}
                >
                  {notification.message}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <span className="flag-badge flag-green">
                      {notification.recipients}
                    </span>
                    <span
                      style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
                    >
                      {formatDate(notification.sentAt)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Send size={16} color="var(--accent-green)" />
                    <span
                      style={{
                        color: "var(--accent-green)",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {notification.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="action-btn btn-delete"
                onClick={() => handleDelete(notification._id)}
                style={{ marginLeft: "15px" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {currentNotifications.length === 0 && (
        <div
          className="chart-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <Bell
            size={48}
            color="var(--text-gray)"
            style={{ marginBottom: "15px" }}
          />
          <h3 style={{ color: "var(--text-gray)", marginBottom: "10px" }}>
            No notifications found
          </h3>
          <p style={{ color: "var(--text-gray)" }}>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Send your first notification to get started"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn ${
                currentPage === i + 1 ? "btn-primary" : "btn-secondary"
              }`}
              style={{ minWidth: "40px" }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--card-bg)",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
              Send New Notification
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="Enter notification title"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-white)",
                  }}
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={4}
                  placeholder="Enter notification message"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-white)",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="form-group">
                <label>Recipients</label>
                <select
                  value={formData.recipients}
                  onChange={(e) =>
                    setFormData({ ...formData, recipients: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-white)",
                  }}
                >
                  <option value="All Users">All Users</option>
                  <option value="Fremium Users">Fremium Users</option>
                  <option value="Premium Users">Premium Users</option>
                </select>
              </div>

              <div
                style={{
                  background: "var(--background-light)",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <h4
                  style={{
                    color: "var(--primary-gold)",
                    marginBottom: "10px",
                    fontSize: "0.9rem",
                  }}
                >
                  Preview:
                </h4>
                <div
                  style={{
                    background: "var(--background-dark)",
                    padding: "12px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <Bell size={16} color="var(--primary-gold)" />
                    <strong
                      style={{ color: "var(--text-white)", fontSize: "0.9rem" }}
                    >
                      {formData.title || "Notification Title"}
                    </strong>
                  </div>
                  <p
                    style={{
                      color: "var(--text-gray)",
                      fontSize: "0.8rem",
                      margin: 0,
                    }}
                  >
                    {formData.message ||
                      "Your notification message will appear here..."}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} />
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
