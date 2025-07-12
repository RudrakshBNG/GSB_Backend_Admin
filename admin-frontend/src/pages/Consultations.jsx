import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  Search,
  UserPlus,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Consultations = () => {
  const { API_BASE } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [assignFilter, setAssignFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConsultations();
    loadTeamMembers();
  }, []);

  useEffect(() => {
    // Filter consultations by status, assigned/unassigned, and search term
    let filtered = consultations;

    // Apply status filter (if used)
    if (statusFilter) {
      filtered = filtered.filter(
        (consultation) => consultation.status === statusFilter,
      );
    }

    // Apply assigned/unassigned filter
    if (assignFilter === "assigned") {
      filtered = filtered.filter((consultation) => consultation.assignedTo);
    } else if (assignFilter === "unassigned") {
      filtered = filtered.filter((consultation) => !consultation.assignedTo);
    }

    // Apply search filter (firstName, lastName, email, phoneNumber)
    if (searchTerm) {
      filtered = filtered.filter((consultation) => {
        const fullName = `${consultation.firstName || ""} ${
          consultation.lastName || ""
        }`.trim();
        return (
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          consultation.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          consultation.phoneNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    console.log("Filtered Consultations:", filtered); // Debug: Log filtered consultations
    setFilteredConsultations(filtered);
  }, [consultations, statusFilter, assignFilter, searchTerm]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching consultations from:",
        `${API_BASE}/consultancy/all`,
      ); // Debug: Log API URL
      const response = await axios.get(`${API_BASE}/consultancy/all`);
      console.log("Raw response:", response.data); // Debug: Log full response
      const data = response.data.data || [];
      console.log("Parsed consultations:", data); // Debug: Log parsed consultations
      setConsultations(data);
      setFilteredConsultations(data);
    } catch (error) {
      console.error("Error loading consultations:", error);
      setConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const loadTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/teams`);
      setTeamMembers(response.data.data || []);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const assignTeamMember = async (consultationId, teamMemberId) => {
    try {
      await axios.put(`${API_BASE}/consultancy/${consultationId}/assign`, {
        teamMemberId,
      });

      // Update local state
      setConsultations(
        consultations.map((consultation) =>
          consultation._id === consultationId
            ? {
                ...consultation,
                assignedTo: teamMemberId
                  ? teamMembers.find((tm) => tm._id === teamMemberId)
                  : null,
              }
            : consultation,
        ),
      );

      console.log("Team member assigned successfully");
    } catch (error) {
      console.error("Error assigning team member:", error);
      alert("Failed to assign team member. Please try again.");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "flag-green";
      case "in-progress":
        return "flag-yellow";
      case "pending":
        return "flag-red";
      default:
        return "flag-red";
    }
  };

  if (loading) {
    return <div className="loading">Loading consultations...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Consultations Management</h1>
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
              placeholder="Search by name, email, or phone..."
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
            value={assignFilter}
            onChange={(e) => setAssignFilter(e.target.value)}
            style={{
              padding: "8px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-white)",
              minWidth: "150px",
            }}
          >
            <option value="all">All Consultations</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <button className="btn btn-primary" onClick={loadConsultations}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <AlertCircle />
          </div>
          <div className="stat-content">
            <h3>
              {
                filteredConsultations.filter((c) => c.status === "pending")
                  .length
              }
            </h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>
              {
                filteredConsultations.filter((c) => c.status === "in-progress")
                  .length
              }
            </h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <User />
          </div>
          <div className="stat-content">
            <h3>
              {
                filteredConsultations.filter((c) => c.status === "completed")
                  .length
              }
            </h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <User />
          </div>
          <div className="stat-content">
            <h3>{filteredConsultations.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Assigned To</th>
              {/* <th>Status</th> */}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsultations.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No consultation requests found
                </td>
              </tr>
            ) : (
              filteredConsultations.map((consultation) => (
                <tr key={consultation._id}>
                  <td>
                    <strong>
                      {consultation.firstName || ""}{" "}
                      {consultation.lastName || ""}
                    </strong>
                  </td>
                  <td>
                    <span className="email-text">
                      {consultation.email || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="phone-text">
                      {consultation.phoneNumber || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="message-text">
                      {consultation.message?.length > 50
                        ? `${consultation.message.substring(0, 50)}...`
                        : consultation.message || "N/A"}
                    </div>
                  </td>
                  <td>
                    <select
                      value={consultation.assignedTo?._id || ""}
                      onChange={(e) =>
                        assignTeamMember(consultation._id, e.target.value)
                      }
                      style={{
                        padding: "6px 8px",
                        background: "var(--input-bg)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        color: "var(--text-white)",
                        fontSize: "0.85rem",
                        minWidth: "120px",
                      }}
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* <td>
                    <span
                      className={`flag-badge ${getStatusClass(consultation.status)}`}
                    >
                      {consultation.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td> */}
                  <td>{formatDate(consultation.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Consultations;
// import React, { useState, useEffect } from "react";
// import {
//   RefreshCw,
//   Calendar,
//   User,
//   Phone,
//   Mail,
//   AlertCircle,
// } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Consultations = () => {
//   const { API_BASE } = useAuth();
//   const [consultations, setConsultations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState("");

//   useEffect(() => {
//     loadConsultations();
//   }, []);

//   const loadConsultations = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/consultancy/all`);
//       setConsultations(response.data.data || []);
//     } catch (error) {
//       console.error("Error loading consultations:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredConsultations = statusFilter
//     ? consultations.filter(
//         (consultation) => consultation.status === statusFilter
//       )
//     : consultations;

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString() + " " + date.toLocaleTimeString();
//   };

//   const getStatusClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "flag-green";
//       case "in-progress":
//         return "flag-yellow";
//       case "pending":
//         return "flag-red";
//       default:
//         return "flag-red";
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading consultations...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Consultations Management</h1>
//         <div className="filter-controls">
//           <button className="btn btn-primary" onClick={loadConsultations}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">
//             <AlertCircle />
//           </div>
//           <div className="stat-content">
//             <h3>
//               {consultations.filter((c) => c.status === "pending").length}
//             </h3>
//             <p>Pending</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Calendar />
//           </div>
//           <div className="stat-content">
//             <h3>
//               {consultations.filter((c) => c.status === "in-progress").length}
//             </h3>
//             <p>In Progress</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <User />
//           </div>
//           <div className="stat-content">
//             <h3>
//               {consultations.filter((c) => c.status === "completed").length}
//             </h3>
//             <p>Completed</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <User />
//           </div>
//           <div className="stat-content">
//             <h3>{consultations.length}</h3>
//             <p>Total Requests</p>
//           </div>
//         </div>
//       </div>

//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Phone</th>
//               <th>Message</th>
//               <th>Assigned To</th>
//               {/* <th>Status</th> */}
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredConsultations.length === 0 ? (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: "center" }}>
//                   No consultation requests found
//                 </td>
//               </tr>
//             ) : (
//               filteredConsultations.map((consultation) => (
//                 <tr key={consultation._id}>
//                   <td>
//                     <strong>
//                       {consultation.firstName} {consultation.lastName}
//                     </strong>
//                   </td>
//                   <td>
//                     <span className="email-text">{consultation.email}</span>
//                   </td>
//                   <td>
//                     <span className="phone-text">
//                       {consultation.phoneNumber}
//                     </span>
//                   </td>
//                   <td>
//                     <div className="message-text">
//                       {consultation.message?.length > 50
//                         ? `${consultation.message.substring(0, 50)}...`
//                         : consultation.message}
//                     </div>
//                   </td>
//                   <td>{consultation.assignedTo?.fullName || "Unassigned"}</td>
//                   {/* <td>
//                     <span
//                       className={`flag-badge ${getStatusClass(consultation.status)}`}
//                     >
//                       {consultation.status?.toUpperCase() || "PENDING"}
//                     </span>
//                   </td> */}
//                   <td>{formatDate(consultation.createdAt)}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Consultations;
