import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  Users,
  Edit,
  Trash2,
  Search,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Team = () => {
  const { API_BASE } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    departmentId: "",
    password: "gsbpathy123", // Default password for new members
  });

  useEffect(() => {
    loadTeamMembers();
    loadDepartments();
  }, []);

  useEffect(() => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.department.some((dept) =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "department") {
          aValue = a.department.length ? a.department[0].name : "";
          bValue = b.department.length ? b.department[0].name : "";
        } else if (sortConfig.key === "assignedChats") {
          aValue = a.assignedChats?.length || 0;
          bValue = b.assignedChats?.length || 0;
        } else {
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
        }
        if (typeof aValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        return sortConfig.direction === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [teamMembers, searchTerm, sortConfig]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/teams`);
      setTeamMembers(response.data.data || []);
      setFilteredMembers(response.data.data || []);
    } catch (error) {
      console.error("Error loading team members:", error);
      alert("Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dept`);
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
      alert("Failed to load departments. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        departmentId: formData.departmentId || undefined, // Send undefined if no department selected
        ...(editingMember ? {} : { password: formData.password }), // Only send password for new members
      };

      if (editingMember) {
        await axios.put(
          `${API_BASE}/teams/update/${editingMember._id}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE}/teams/add-member`, payload);
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData({
        fullName: "",
        email: "",
        departmentId: "",
        password: "gsbpathy123",
      });
      loadTeamMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      alert(
        error.response?.data?.message ||
          "Error saving team member. Please try again."
      );
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      departmentId: member.department.length
        ? member.department[0].departmentId
        : "",
      password: "gsbpathy123",
    });
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await axios.delete(`${API_BASE}/teams/${memberId}`);
        loadTeamMembers();
      } catch (error) {
        console.error("Error deleting team member:", error);
        alert(
          error.response?.data?.message ||
            "Error deleting team member. Please try again."
        );
      }
    }
  };

  // Department Management Functions
  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: departmentForm.name,
        description: departmentForm.description || "",
      };

      if (editingDepartment) {
        await axios.put(
          `${API_BASE}/dept/update/${editingDepartment.departmentId}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE}/dept/add`, payload);
      }

      setShowDepartmentModal(false);
      setEditingDepartment(null);
      setDepartmentForm({ name: "", description: "" });
      loadDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      alert(
        error.response?.data?.message ||
          "Error saving department. Please try again."
      );
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm(`Are you sure you want to delete this department?`)) {
      try {
        await axios.delete(`${API_BASE}/dept/delete/${departmentId}`);
        loadDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
        alert(
          error.response?.data?.message ||
            "Error deleting department. Please try again."
        );
      }
    }
  };

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  if (loading) {
    return <div className="loading">Loading team members...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Team Management</h1>
        <div className="filter-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingMember(null);
              setFormData({
                fullName: "",
                email: "",
                departmentId: "",
                password: "gsbpathy123",
              });
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Add Team Member
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setEditingDepartment(null);
              setDepartmentForm({ name: "", description: "" });
              setShowDepartmentModal(true);
            }}
          >
            <Edit size={16} />
            Manage Departments
          </button>
          <button className="btn btn-secondary" onClick={loadTeamMembers}>
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
            placeholder="Search team members..."
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

      {/* Team Stats */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{teamMembers.length}</h3>
            <p>Total Team Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {teamMembers.filter((m) => m.assignedChats?.length > 0).length}
            </h3>
            <p>Active Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {teamMembers.reduce(
                (total, m) => total + (m.assignedChats?.length || 0),
                0
              )}
            </h3>
            <p>Total Assigned Chats</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {
                [
                  ...new Set(
                    teamMembers
                      .flatMap((m) => m.department.map((d) => d.name))
                      .filter((d) => d)
                  ),
                ].length
              }
            </h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("fullName")}>
                Name{" "}
                {sortConfig.key === "fullName" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("email")}>
                Email{" "}
                {sortConfig.key === "email" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("department")}>
                Department{" "}
                {sortConfig.key === "department" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("assignedChats")}>
                Assigned Chats{" "}
                {sortConfig.key === "assignedChats" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No team members found
                </td>
              </tr>
            ) : (
              currentMembers.map((member) => (
                <tr key={member._id}>
                  <td>{member.fullName}</td>
                  <td>{member.email}</td>
                  <td>
                    {member.department.length
                      ? member.department.map((dept) => dept.name).join(", ")
                      : "Not specified"}
                  </td>
                  <td>
                    <span className="flag-badge flag-green">
                      {member.assignedChats?.length || 0} chats
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn btn-edit"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="action-btn btn-delete"
                      onClick={() => handleDelete(member._id)}
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

      {/* Add/Edit Team Member Modal */}
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
              {editingMember ? "Edit Team Member" : "Add New Team Member"}
            </h2>

            <form onSubmit={handleSubmit}>
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
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
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
                <label>Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
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
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingMember && (
                <div
                  style={{
                    background: "var(--background-light)",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-gray)",
                      fontSize: "0.9rem",
                      margin: 0,
                    }}
                  >
                    <strong>Default Password:</strong> gsbpathy123
                    <br />
                    Team member can change this after first login.
                  </p>
                </div>
              )}

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
                  {editingMember ? "Update" : "Add"} Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Management Modal */}
      {showDepartmentModal && (
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
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
              Manage Departments
            </h2>

            {/* Add/Edit Department Form */}
            <div style={{ marginBottom: "30px" }}>
              <div className="form-group">
                <label>
                  {editingDepartment ? "Edit Department" : "Add New Department"}
                </label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) =>
                    setDepartmentForm({
                      ...departmentForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Department name"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-white)",
                    marginBottom: "10px",
                  }}
                />
                <input
                  type="text"
                  value={departmentForm.description}
                  onChange={(e) =>
                    setDepartmentForm({
                      ...departmentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Department description (optional)"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-white)",
                  }}
                />
                <button
                  onClick={handleDepartmentSubmit}
                  className="btn btn-primary"
                  disabled={!departmentForm.name.trim()}
                  style={{ marginTop: "10px" }}
                >
                  {editingDepartment ? "Update" : "Add"}
                </button>
              </div>
            </div>

            {/* Departments List */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-white)", marginBottom: "15px" }}>
                Existing Departments
              </h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {departments.map((dept) => (
                  <div
                    key={dept.departmentId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      background: "var(--background-dark)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-white)" }}>
                        {dept.name}
                      </span>
                      <p
                        style={{
                          color: "var(--text-gray)",
                          fontSize: "0.8rem",
                          margin: "5px 0 0 0",
                        }}
                      >
                        {dept.description || "No description"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => {
                          setEditingDepartment(dept);
                          setDepartmentForm({
                            name: dept.name,
                            description: dept.description || "",
                          });
                        }}
                        className="action-btn btn-edit"
                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteDepartment(dept.departmentId)
                        }
                        className="action-btn btn-delete"
                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowDepartmentModal(false);
                  setEditingDepartment(null);
                  setDepartmentForm({ name: "", description: "" });
                }}
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

export default Team;
// import React, { useState, useEffect } from "react";
// import {
//   RefreshCw,
//   Plus,
//   Users,
//   Edit,
//   Trash2,
//   Search,
//   MessageSquare,
// } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Team = () => {
//   const { API_BASE } = useAuth();
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [filteredMembers, setFilteredMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showDepartmentModal, setShowDepartmentModal] = useState(false);
//   const [editingMember, setEditingMember] = useState(null);
//   const [editingDepartment, setEditingDepartment] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [departments, setDepartments] = useState([
//     "Customer Support",
//     "Technical Support",
//     "Sales",
//     "Marketing",
//     "Management",
//   ]);
//   const [departmentForm, setDepartmentForm] = useState({ name: "" });

//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     department: "",
//   });

//   useEffect(() => {
//     loadTeamMembers();
//   }, []);

//   useEffect(() => {
//     // Filter members based on search
//     let filtered = teamMembers;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (member) =>
//           member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           member.department?.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }

//     setFilteredMembers(filtered);
//   }, [teamMembers, searchTerm]);

//   const loadTeamMembers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/teamss`);
//       setTeamMembers(response.data.data || []);
//       setFilteredMembers(response.data.data || []);
//     } catch (error) {
//       console.error("Error loading team members:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingMember) {
//         // Update member (you'll need to implement this endpoint)
//         await axios.put(`${API_BASE}/teamss/${editingMember._id}`, formData);
//       } else {
//         await axios.post(`${API_BASE}/teamss`, formData);
//       }

//       setShowModal(false);
//       setEditingMember(null);
//       setFormData({
//         fullName: "",
//         email: "",
//         department: "",
//       });
//       loadTeamMembers();
//     } catch (error) {
//       console.error("Error saving team member:", error);
//       alert("Error saving team member. Please try again.");
//     }
//   };

//   const handleEdit = (member) => {
//     setEditingMember(member);
//     setFormData({
//       fullName: member.fullName,
//       email: member.email,
//       department: member.department || "",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (memberId) => {
//     if (window.confirm("Are you sure you want to delete this team member?")) {
//       try {
//         await axios.delete(`${API_BASE}/teamss/${memberId}`);
//         loadTeamMembers();
//       } catch (error) {
//         console.error("Error deleting team member:", error);
//         alert("Error deleting team member. Please try again.");
//       }
//     }
//   };

//   // Department Management Functions
//   const handleAddDepartment = () => {
//     if (departmentForm.name && !departments.includes(departmentForm.name)) {
//       setDepartments([...departments, departmentForm.name]);
//       setDepartmentForm({ name: "" });
//       setShowDepartmentModal(false);
//     }
//   };

//   const handleEditDepartment = (oldDepartment) => {
//     if (departmentForm.name && !departments.includes(departmentForm.name)) {
//       const updatedDepartments = departments.map((dept) =>
//         dept === oldDepartment ? departmentForm.name : dept,
//       );
//       setDepartments(updatedDepartments);
//       setDepartmentForm({ name: "" });
//       setEditingDepartment(null);
//       setShowDepartmentModal(false);
//     }
//   };

//   const handleDeleteDepartment = (departmentToDelete) => {
//     if (
//       window.confirm(
//         `Are you sure you want to delete the department "${departmentToDelete}"?`,
//       )
//     ) {
//       setDepartments(departments.filter((dept) => dept !== departmentToDelete));
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading team members...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Team Management</h1>
//         <div className="filter-controls">
//           <button
//             className="btn btn-primary"
//             onClick={() => {
//               setEditingMember(null);
//               setFormData({
//                 fullName: "",
//                 email: "",
//                 department: "",
//               });
//               setShowModal(true);
//             }}
//           >
//             <Plus size={16} />
//             Add Team Member
//           </button>
//           <button
//             className="btn btn-secondary"
//             onClick={() => {
//               setEditingDepartment(null);
//               setDepartmentForm({ name: "" });
//               setShowDepartmentModal(true);
//             }}
//           >
//             <Edit size={16} />
//             Manage Departments
//           </button>
//           <button className="btn btn-secondary" onClick={loadTeamMembers}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="filter-controls" style={{ marginBottom: "20px" }}>
//         <div
//           className="search-box"
//           style={{ position: "relative", flex: "1", maxWidth: "400px" }}
//         >
//           <Search
//             size={16}
//             style={{
//               position: "absolute",
//               left: "10px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               color: "var(--text-gray)",
//             }}
//           />
//           <input
//             type="text"
//             placeholder="Search team members..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               width: "100%",
//               padding: "8px 8px 8px 35px",
//               background: "var(--input-bg)",
//               border: "1px solid var(--border-color)",
//               borderRadius: "6px",
//               color: "var(--text-white)",
//             }}
//           />
//         </div>
//       </div>

//       {/* Team Members Table */}
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Department</th>
//               <th>Assigned Chats</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredMembers.length === 0 ? (
//               <tr>
//                 <td colSpan="5" style={{ textAlign: "center" }}>
//                   No team members found
//                 </td>
//               </tr>
//             ) : (
//               filteredMembers.map((member) => (
//                 <tr key={member._id}>
//                   <td>{member.fullName}</td>
//                   <td>{member.email}</td>
//                   <td>{member.department || "Not specified"}</td>
//                   <td>
//                     <span className="flag-badge flag-green">
//                       {member.assignedChats?.length || 0} chats
//                     </span>
//                   </td>
//                   <td>
//                     <button
//                       className="action-btn btn-edit"
//                       onClick={() => handleEdit(member)}
//                     >
//                       <Edit size={14} />
//                     </button>
//                     <button
//                       className="action-btn btn-delete"
//                       onClick={() => handleDelete(member._id)}
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
//               maxWidth: "500px",
//               border: "1px solid var(--border-color)",
//             }}
//           >
//             <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
//               {editingMember ? "Edit Team Member" : "Add New Team Member"}
//             </h2>

//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label>Full Name *</label>
//                 <input
//                   type="text"
//                   value={formData.fullName}
//                   onChange={(e) =>
//                     setFormData({ ...formData, fullName: e.target.value })
//                   }
//                   required
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

//               <div className="form-group">
//                 <label>Email *</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   required
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

//               <div className="form-group">
//                 <label>Department</label>
//                 <select
//                   value={formData.department}
//                   onChange={(e) =>
//                     setFormData({ ...formData, department: e.target.value })
//                   }
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map((dept) => (
//                     <option key={dept} value={dept}>
//                       {dept}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {!editingMember && (
//                 <div
//                   style={{
//                     background: "var(--background-light)",
//                     padding: "15px",
//                     borderRadius: "8px",
//                     marginBottom: "15px",
//                   }}
//                 >
//                   <p
//                     style={{
//                       color: "var(--text-gray)",
//                       fontSize: "0.9rem",
//                       margin: 0,
//                     }}
//                   >
//                     <strong>Default Password:</strong> gsbpathy123
//                     <br />
//                     Team member can change this after first login.
//                   </p>
//                 </div>
//               )}

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
//                   {editingMember ? "Update" : "Add"} Team Member
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Department Management Modal */}
//       {showDepartmentModal && (
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
//               maxWidth: "500px",
//               border: "1px solid var(--border-color)",
//               maxHeight: "80vh",
//               overflowY: "auto",
//             }}
//           >
//             <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
//               Manage Departments
//             </h2>

//             {/* Add/Edit Department Form */}
//             <div style={{ marginBottom: "30px" }}>
//               <div className="form-group">
//                 <label>
//                   {editingDepartment ? "Edit Department" : "Add New Department"}
//                 </label>
//                 <div style={{ display: "flex", gap: "10px" }}>
//                   <input
//                     type="text"
//                     value={departmentForm.name}
//                     onChange={(e) =>
//                       setDepartmentForm({ name: e.target.value })
//                     }
//                     placeholder="Department name"
//                     style={{
//                       flex: 1,
//                       padding: "12px",
//                       background: "var(--input-bg)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "8px",
//                       color: "var(--text-white)",
//                     }}
//                   />
//                   <button
//                     onClick={() =>
//                       editingDepartment
//                         ? handleEditDepartment(editingDepartment)
//                         : handleAddDepartment()
//                     }
//                     className="btn btn-primary"
//                     disabled={!departmentForm.name.trim()}
//                   >
//                     {editingDepartment ? "Update" : "Add"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Departments List */}
//             <div style={{ marginBottom: "20px" }}>
//               <h3 style={{ color: "var(--text-white)", marginBottom: "15px" }}>
//                 Existing Departments
//               </h3>
//               <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//                 {departments.map((dept, index) => (
//                   <div
//                     key={index}
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       padding: "10px",
//                       background: "var(--background-dark)",
//                       border: "1px solid var(--border-color)",
//                       borderRadius: "6px",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     <span style={{ color: "var(--text-white)" }}>{dept}</span>
//                     <div style={{ display: "flex", gap: "5px" }}>
//                       <button
//                         onClick={() => {
//                           setEditingDepartment(dept);
//                           setDepartmentForm({ name: dept });
//                         }}
//                         className="action-btn btn-edit"
//                         style={{ fontSize: "0.8rem", padding: "4px 8px" }}
//                       >
//                         <Edit size={12} />
//                       </button>
//                       <button
//                         onClick={() => handleDeleteDepartment(dept)}
//                         className="action-btn btn-delete"
//                         style={{ fontSize: "0.8rem", padding: "4px 8px" }}
//                       >
//                         <Trash2 size={12} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 gap: "10px",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <button
//                 onClick={() => {
//                   setShowDepartmentModal(false);
//                   setEditingDepartment(null);
//                   setDepartmentForm({ name: "" });
//                 }}
//                 className="btn btn-secondary"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Team Stats */}
//       <div className="stats-grid" style={{ marginTop: "30px" }}>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Users />
//           </div>
//           <div className="stat-content">
//             <h3>{teamMembers.length}</h3>
//             <p>Total Team Members</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>
//               {teamMembers.filter((m) => m.assignedChats?.length > 0).length}
//             </h3>
//             <p>Active Members</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>
//               {teamMembers.reduce(
//                 (total, m) => total + (m.assignedChats?.length || 0),
//                 0,
//               )}
//             </h3>
//             <p>Total Assigned Chats</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>
//               {
//                 [
//                   ...new Set(
//                     teamMembers.map((m) => m.department).filter((d) => d),
//                   ),
//                 ].length
//               }
//             </h3>
//             <p>Departments</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Team;
