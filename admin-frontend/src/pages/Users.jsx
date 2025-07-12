import React, { useState, useEffect } from "react";
import { RefreshCw, Eye, Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Users = () => {
  const { API_BASE } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flagFilter, setFlagFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    photo: null,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply flag filter
    if (flagFilter) {
      filtered = filtered.filter((user) => user.flag === flagFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, flagFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/user/all/scores`);
      const usersData = response.data.users || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("age", formData.age || "");
      formDataToSend.append("weight", formData.weight || "");
      formDataToSend.append("height", formData.height || "");
      formDataToSend.append("goal", formData.goal || "");
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      if (editingUser) {
        await axios.put(
          `${API_BASE}/user/update-user/${editingUser._id}`,
          formDataToSend
        );
      } else {
        await axios.post(`${API_BASE}/user/create-user`, formDataToSend);
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({
        fullName: "",
        phoneNumber: "",
        age: "",
        weight: "",
        height: "",
        goal: "",
        photo: null,
      });
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Please try again.");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      age: user.age?.toString() || "",
      weight: user.weight?.toString() || "",
      height: user.height?.toString() || "",
      goal: user.goal || "",
      photo: null,
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE}/user/delete-user/${userId}`);
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  const handleViewUser = (user) => {
    setViewUser(user);
  };

  const handleUpdateFlag = async (userId, newFlag) => {
    try {
      await axios.put(`${API_BASE}/user/update-user/${userId}`, {
        flag: newFlag,
      });
      loadUsers();
    } catch (error) {
      console.error("Error updating user flag:", error);
      alert("Error updating user flag. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getFlagClass = (flag) => {
    switch (flag) {
      case "green":
        return "flag-green";
      case "yellow":
        return "flag-yellow";
      case "red":
        return "flag-red";
      default:
        return "flag-red";
    }
  };

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      if (
        key === "score" ||
        key === "age" ||
        key === "weight" ||
        key === "height"
      ) {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return direction === "asc"
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
    setFilteredUsers(sortedUsers);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Users Management</h1>
        <div
          className="filter-controls"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-white)",
            }}
          >
            <option value="">All Flags</option>
            <option value="green">Green Flag</option>
            <option value="yellow">Yellow Flag</option>
            <option value="red">Red Flag</option>
          </select>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-white)",
              width: "200px",
            }}
          />
          <button className="btn btn-secondary" onClick={loadUsers}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{users.filter((u) => u.flag === "green").length}</h3>
            <p>Green Flag Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{users.filter((u) => u.flag === "yellow").length}</h3>
            <p>Yellow Flag Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{users.filter((u) => u.flag === "red").length}</h3>
            <p>Red Flag Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {Math.round(
                users.reduce((acc, user) => acc + (user.score || 0), 0) /
                  users.length
              ) || 0}
            </h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("fullName")}>
                Name{" "}
                {sortConfig.key === "fullName" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("phoneNumber")}>
                Phone{" "}
                {sortConfig.key === "phoneNumber" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Flag</th>
              <th onClick={() => handleSort("subscribed")}>
                Subscription{" "}
                {sortConfig.key === "subscribed" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td
                    onClick={() => handleViewUser(user)}
                    style={{ cursor: "pointer", color: "var(--primary-gold)" }}
                    className="link-btn"
                  >
                    {user.fullName || "N/A"}
                  </td>
                  <td>{user.phoneNumber || "N/A"}</td>
                  <td className="color-white">
                    <p
                      style={{
                        backgroundColor: `${user.flag}`,
                        padding: "4px",
                        borderRadius: "4px",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {user.flag || "N/A"}
                    </p>
                  </td>
                  <td>{user.subscribed ? "Subscribed" : "Not Subscribed"}</td>
                  <td>
                    <button
                      className="action-btn btn-view"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="action-btn btn-delete"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {/* Add/Edit Modal */}
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
              maxWidth: "600px",
              border: "1px solid var(--border-color)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
              {editingUser ? "Edit User" : "Add New User"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
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
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    required
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
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    min="0"
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
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    min="0"
                    step="0.1"
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
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    min="0"
                    step="0.1"
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
                  <label>Goal</label>
                  <input
                    type="text"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
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
              </div>

              <div className="form-group">
                <label>Photo {!editingUser && "*"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.files[0] })
                  }
                  required={!editingUser}
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
                  {editingUser ? "Update" : "Create"} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
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
              width: " border: 1px solid var(--border-color)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
              User Details
            </h2>
            <div style={{ display: "grid", gap: "15px" }}>
              {viewUser.photo ? (
                <img
                  src={viewUser.photo}
                  alt={viewUser.fullName}
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: "var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                >
                  <Eye size={48} color="var(--text-gray)" />
                </div>
              )}
              <div>
                <strong>Full Name:</strong> {viewUser.fullName || "N/A"}
              </div>
              <div>
                <strong>Phone Number:</strong> {viewUser.phoneNumber || "N/A"}
              </div>
              <div>
                <strong>Age:</strong> {viewUser.age || "N/A"}
              </div>
              <div>
                <strong>Weight:</strong> {viewUser.weight || "N/A"} kg
              </div>
              <div>
                <strong>Height:</strong> {viewUser.height || "N/A"} cm
              </div>
              <div>
                <strong>Goal:</strong> {viewUser.goal || "N/A"}
              </div>
              <div>
                <strong>Score:</strong> {viewUser.score || 0}
              </div>
              <div>
                <strong>Flag:</strong> {viewUser.flag || "red"}
              </div>
              <div>
                <strong>Subscribed:</strong>{" "}
                {viewUser.subscribed ? "Subscribed" : "Not Subscribed"}
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
                onClick={() => setViewUser(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
// import React, { useState, useEffect } from "react";
// import { RefreshCw, Eye, Edit, Trash2, Plus } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Users = () => {
//   const { API_BASE } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [flagFilter, setFlagFilter] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [viewUser, setViewUser] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(8);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

//   const [formData, setFormData] = useState({
//     fullName: "",
//     phoneNumber: "",
//     age: "",
//     weight: "",
//     height: "",
//     goal: "",
//     photo: null,
//   });

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   useEffect(() => {
//     let filtered = users;

//     if (flagFilter) {
//       filtered = filtered.filter((user) => user.flag === flagFilter);
//     }

//     setFilteredUsers(filtered);
//     setCurrentPage(1);
//   }, [users, flagFilter]);

//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/user/all/scores`);
//       const usersData = response.data.users || [];
//       setUsers(usersData);
//       setFilteredUsers(usersData);
//     } catch (error) {
//       console.error("Error loading users:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("fullName", formData.fullName);
//       formDataToSend.append("phoneNumber", formData.phoneNumber);
//       formDataToSend.append("age", formData.age || "");
//       formDataToSend.append("weight", formData.weight || "");
//       formDataToSend.append("height", formData.height || "");
//       formDataToSend.append("goal", formData.goal || "");
//       if (formData.photo) {
//         formDataToSend.append("photo", formData.photo);
//       }

//       if (editingUser) {
//         await axios.put(
//           `${API_BASE}/user/update-user/${editingUser._id}`,
//           formDataToSend
//         );
//       } else {
//         await axios.post(`${API_BASE}/user/create-user`, formDataToSend);
//       }

//       setShowModal(false);
//       setEditingUser(null);
//       setFormData({
//         fullName: "",
//         phoneNumber: "",
//         age: "",
//         weight: "",
//         height: "",
//         goal: "",
//         photo: null,
//       });
//       loadUsers();
//     } catch (error) {
//       console.error("Error saving user:", error);
//       alert("Error saving user. Please try again.");
//     }
//   };

//   const handleEditUser = (user) => {
//     setEditingUser(user);
//     setFormData({
//       fullName: user.fullName || "",
//       phoneNumber: user.phoneNumber || "",
//       age: user.age?.toString() || "",
//       weight: user.weight?.toString() || "",
//       height: user.height?.toString() || "",
//       goal: user.goal || "",
//       photo: null,
//     });
//     setShowModal(true);
//   };

//   const handleDeleteUser = async (userId) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         await axios.delete(`${API_BASE}/user/delete-user/${userId}`);
//         loadUsers();
//       } catch (error) {
//         console.error("Error deleting user:", error);
//         alert("Error deleting user. Please try again.");
//       }
//     }
//   };

//   const handleViewUser = (user) => {
//     setViewUser(user);
//   };

//   const handleUpdateFlag = async (userId, newFlag) => {
//     try {
//       await axios.put(`${API_BASE}/user/update-user/${userId}`, {
//         flag: newFlag,
//       });
//       loadUsers();
//     } catch (error) {
//       console.error("Error updating user flag:", error);
//       alert("Error updating user flag. Please try again.");
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString() + " " + date.toLocaleTimeString();
//   };

//   const getFlagClass = (flag) => {
//     switch (flag) {
//       case "green":
//         return "flag-green";
//       case "yellow":
//         return "flag-yellow";
//       case "red":
//         return "flag-red";
//       default:
//         return "flag-red";
//     }
//   };

//   // Sorting
//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });

//     const sortedUsers = [...filteredUsers].sort((a, b) => {
//       const aValue = a[key] || "";
//       const bValue = b[key] || "";
//       if (
//         key === "score" ||
//         key === "age" ||
//         key === "weight" ||
//         key === "height"
//       ) {
//         return direction === "asc" ? aValue - bValue : bValue - aValue;
//       }
//       return direction === "asc"
//         ? aValue.toString().localeCompare(bValue.toString())
//         : bValue.toString().localeCompare(aValue.toString());
//     });
//     setFilteredUsers(sortedUsers);
//   };

//   // Pagination
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//   if (loading) {
//     return <div className="loading">Loading users...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Users Management</h1>
//         <div className="filter-controls">
//           <select
//             value={flagFilter}
//             onChange={(e) => setFlagFilter(e.target.value)}
//             style={{
//               padding: "8px 12px",
//               background: "var(--input-bg)",
//               border: "1px solid var(--border-color)",
//               borderRadius: "6px",
//               color: "var(--text-white)",
//             }}
//           >
//             <option value="">All Flags</option>
//             <option value="green">Green Flag</option>
//             <option value="yellow">Yellow Flag</option>
//             <option value="red">Red Flag</option>
//           </select>
//           <button className="btn btn-secondary" onClick={loadUsers}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* User Statistics */}
//       <div className="stats-grid" style={{ marginTop: "30px" }}>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{users.filter((u) => u.flag === "green").length}</h3>
//             <p>Green Flag Users</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{users.filter((u) => u.flag === "yellow").length}</h3>
//             <p>Yellow Flag Users</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{users.filter((u) => u.flag === "red").length}</h3>
//             <p>Red Flag Users</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>
//               {Math.round(
//                 users.reduce((acc, user) => acc + (user.score || 0), 0) /
//                   users.length
//               ) || 0}
//             </h3>
//             <p>Average Score</p>
//           </div>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th onClick={() => handleSort("fullName")}>
//                 Name{" "}
//                 {sortConfig.key === "fullName" &&
//                   (sortConfig.direction === "asc" ? "↑" : "↓")}
//               </th>
//               <th onClick={() => handleSort("phoneNumber")}>
//                 Phone{" "}
//                 {sortConfig.key === "phoneNumber" &&
//                   (sortConfig.direction === "asc" ? "↑" : "↓")}
//               </th>
//               <th>Flag</th>
//               <th onClick={() => handleSort("subscribed")}>
//                 Subscription{" "}
//                 {sortConfig.key === "subscribed" &&
//                   (sortConfig.direction === "asc" ? "↑" : "↓")}
//               </th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentUsers.length === 0 ? (
//               <tr>
//                 <td colSpan="10" style={{ textAlign: "center" }}>
//                   No users found
//                 </td>
//               </tr>
//             ) : (
//               currentUsers.map((user) => (
//                 <tr key={user._id}>
//                   <td
//                     onClick={() => handleViewUser(user)}
//                     style={{ cursor: "pointer", color: "var(--primary-gold)" }}
//                     className="link-btn"
//                   >
//                     {user.fullName || "N/A"}
//                   </td>
//                   <td>{user.phoneNumber || "N/A"}</td>
//                   <td className="color-white">
//                     <p
//                       style={{
//                         backgroundColor: `${user.flag}`,
//                         padding: "4px",
//                         borderRadius: "4px",
//                         color: "#fff",
//                         textAlign: "center",
//                       }}
//                     >
//                       {user.flag || "N/A"}
//                     </p>
//                   </td>
//                   <td>{user.subscribed ? "Subscribed" : "Not Subscribed"}</td>
//                   <td>
//                     <button
//                       className="action-btn btn-view"
//                       onClick={() => handleViewUser(user)}
//                     >
//                       <Eye size={14} />
//                     </button>
//                     <button
//                       className="action-btn btn-delete"
//                       onClick={() => handleDeleteUser(user._id)}
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "10px",
//             marginTop: "20px",
//           }}
//         >
//           {Array.from({ length: totalPages }, (_, i) => (
//             <button
//               key={i + 1}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`btn ${
//                 currentPage === i + 1 ? "btn-primary" : "btn-secondary"
//               }`}
//               style={{ minWidth: "40px" }}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0, 0, 0, 0.7)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               background: "var(--card-bg)",
//               padding: "30px",
//               borderRadius: "12px",
//               width: "90%",
//               maxWidth: "600px",
//               border: "1px solid var(--border-color)",
//               maxHeight: "90vh",
//               overflowY: "auto",
//             }}
//           >
//             <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
//               {editingUser ? "Edit User" : "Add New User"}
//             </h2>

//             <form onSubmit={handleSubmit}>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "15px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Full Name *</label>
//                   <input
//                     type="text"
//                     value={formData.fullName}
//                     onChange={(e) =>
//                       setFormData({ ...formData, fullName: e.target.value })
//                     }
//                     required
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Phone Number *</label>
//                   <input
//                     type="text"
//                     value={formData.phoneNumber}
//                     onChange={(e) =>
//                       setFormData({ ...formData, phoneNumber: e.target.value })
//                     }
//                     required
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "15px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Age</label>
//                   <input
//                     type="number"
//                     value={formData.age}
//                     onChange={(e) =>
//                       setFormData({ ...formData, age: e.target.value })
//                     }
//                     min="0"
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Weight (kg)</label>
//                   <input
//                     type="number"
//                     value={formData.weight}
//                     onChange={(e) =>
//                       setFormData({ ...formData, weight: e.target.value })
//                     }
//                     min="0"
//                     step="0.1"
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "15px",
//                 }}
//               >
//                 <div className="form-group">
//                   <label>Height (cm)</label>
//                   <input
//                     type="number"
//                     value={formData.height}
//                     onChange={(e) =>
//                       setFormData({ ...formData, height: e.target.value })
//                     }
//                     min="0"
//                     step="0.1"
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Goal</label>
//                   <input
//                     type="text"
//                     value={formData.goal}
//                     onChange={(e) =>
//                       setFormData({ ...formData, goal: e.target.value })
//                     }
//                     style={{
//                       width: "100%",
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>Photo {!editingUser && "*"}</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setFormData({ ...formData, photo: e.target.files[0] })
//                   }
//                   required={!editingUser}
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   gap: "10px",
//                   justifyContent: "flex-end",
//                   marginTop: "20px",
//                 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary">
//                   {editingUser ? "Update" : "Create"} User
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* View User Modal */}
//       {viewUser && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0, 0, 0, 0.7)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               background: "var(--card-bg)",
//               padding: "30px",
//               borderRadius: "12px",
//               width: "90%",
//               maxWidth: "600px",
//               border: "1px solid var(--border-color)",
//               maxHeight: "90vh",
//               overflowY: "auto",
//             }}
//           >
//             <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
//               User Details
//             </h2>
//             <div style={{ display: "grid", gap: "15px" }}>
//               {viewUser.photo ? (
//                 <img
//                   src={viewUser.photo}
//                   alt={viewUser.fullName}
//                   style={{
//                     width: "100%",
//                     maxHeight: "200px",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                   }}
//                 />
//               ) : (
//                 <div
//                   style={{
//                     width: "100%",
//                     height: "200px",
//                     background: "var(--border-color)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     borderRadius: "8px",
//                   }}
//                 >
//                   <Eye size={48} color="var(--text-gray)" />
//                 </div>
//               )}
//               <div>
//                 <strong>Full Name:</strong> {viewUser.fullName || "N/A"}
//               </div>
//               <div>
//                 <strong>Phone Number:</strong> {viewUser.phoneNumber || "N/A"}
//               </div>
//               <div>
//                 <strong>Age:</strong> {viewUser.age || "N/A"}
//               </div>
//               <div>
//                 <strong>Weight:</strong> {viewUser.weight || "N/A"} kg
//               </div>
//               <div>
//                 <strong>Height:</strong> {viewUser.height || "N/A"} cm
//               </div>
//               <div>
//                 <strong>Goal:</strong> {viewUser.goal || "N/A"}
//               </div>
//               <div>
//                 <strong>Score:</strong> {viewUser.score || 0}
//               </div>
//               <div>
//                 <strong>Flag:</strong> {viewUser.flag || "red"}
//               </div>
//               <div>
//                 <strong>Subscribed:</strong>{" "}
//                 {viewUser.subscribed ? "Subscribed" : "Not Subscribed"}
//               </div>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 gap: "10px",
//                 justifyContent: "flex-end",
//                 marginTop: "20px",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={() => setViewUser(null)}
//                 className="btn btn-secondary"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Users;
