import React, { useState, useEffect } from "react";
import { RefreshCw, Calendar, User, Image, Search, Eye, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DailyUpdates = () => {
  const { API_BASE } = useAuth();
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDailyUpdates();
  }, []);

  useEffect(() => {
    // Filter updates by title and fullName
    let filtered = dailyUpdates;
    if (searchTerm) {
      filtered = filtered.filter((update) => {
        const titleMatch = update.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const nameMatch = (users[update.userId]?.fullName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return titleMatch || nameMatch;
      });
    }
    console.log("Filtered Updates:", filtered); // Debug: Log filtered updates
    setFilteredUpdates(filtered);
  }, [dailyUpdates, users, searchTerm]);

  const loadDailyUpdates = async () => {
    try {
      setLoading(true);
      console.log("Fetching updates from:", `${API_BASE}/daily-updates`); // Debug: Log API URL
      const response = await axios.get(`${API_BASE}/daily-updates`);
      console.log("Raw response:", response.data); // Debug: Log full response
      const updates = response.data.dailyUpdates || [];
      console.log("Parsed updates:", updates); // Debug: Log parsed updates

      // Fetch user details for each unique userId
      const userIds = [
        ...new Set(updates.map((update) => update.userId).filter(Boolean)),
      ];
      console.log("Unique user IDs:", userIds); // Debug: Log user IDs
      const userPromises = userIds.map((userId) =>
        axios.get(`${API_BASE}/user/${userId}`).catch((err) => {
          console.error(`Error fetching user ${userId}:`, err.message); // Debug: Log user fetch errors
          return { data: { user: { _id: userId, fullName: "Unknown User" } } };
        }),
      );
      const userResponses = await Promise.all(userPromises);
      const userMap = userResponses.reduce((acc, res) => {
        if (res.data.user) {
          acc[res.data.user._id] = res.data.user;
        }
        return acc;
      }, {});
      console.log("User map:", userMap); // Debug: Log user map
      setUsers(userMap);

      // Debug: Log image URLs
      console.log("Loaded daily updates with images:");
      updates.forEach((update, index) => {
        console.log(`Update ${index + 1} - ${update.title}:`, {
          imageUrl: update.imageUrl,
          userId: update.userId,
          fullName: userMap[update.userId]?.fullName || "Unknown User",
        });
      });

      setDailyUpdates(updates);
      setFilteredUpdates(updates);
    } catch (error) {
      console.error("Error loading daily updates:", error);
      setDailyUpdates([]);
      setFilteredUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatsForToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredUpdates.filter((update) => {
      const updateDate = new Date(update.createdAt);
      updateDate.setHours(0, 0, 0, 0);
      return updateDate.getTime() === today.getTime();
    }).length;
  };

  const getStatsForWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return filteredUpdates.filter(
      (update) => new Date(update.createdAt) >= weekAgo,
    ).length;
  };

  if (loading) {
    return <div className="loading">Loading daily updates...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Daily Updates Management</h1>
        <div className="filter-controls">
          <button className="btn btn-primary" onClick={loadDailyUpdates}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="filter-controls"
        style={{ marginBottom: "20px", flexWrap: "wrap" }}
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
            placeholder="Search by title or user name..."
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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{getStatsForToday()}</h3>
            <p>Today's Updates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{getStatsForWeek()}</h3>
            <p>This Week</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <User />
          </div>
          <div className="stat-content">
            <h3>{filteredUpdates.length}</h3>
            <p>Total Updates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Image />
          </div>
          <div className="stat-content">
            <h3>{filteredUpdates.filter((u) => u.imageUrl).length}</h3>
            <p>With Images</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>User Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredUpdates.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No daily updates found
                </td>
              </tr>
            ) : (
              filteredUpdates.map((update, index) => (
                <tr key={update._id || index}>
                  <td>
                    <strong>{update.title || "Untitled"}</strong>
                  </td>
                  <td>
                    <div>
                      {users[update.userId]?.fullName || "Unknown User"}
                    </div>
                  </td>
                  <td>
                    <div className="description-text">
                      {update.description?.length > 100
                        ? `${update.description.substring(0, 100)}...`
                        : update.description || "No description"}
                    </div>
                  </td>
                  <td>
                    {update.imageUrl ? (
                      <div
                        style={{
                          position: "relative",
                          width: "50px",
                          height: "50px",
                        }}
                      >
                        <img
                          src={update.imageUrl}
                          alt="Daily update image"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                          onError={(e) => {
                            console.error(
                              "Failed to load daily update image:",
                              update.imageUrl,
                            );
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          style={{
                            display: "none",
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#333",
                            color: "#999",
                            fontSize: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        >
                          Failed to load
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td>{formatDate(update.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyUpdates;
// import React, { useState, useEffect } from "react";
// import { RefreshCw, Calendar, User, Image } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const DailyUpdates = () => {
//   const { API_BASE } = useAuth();
//   const [dailyUpdates, setDailyUpdates] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDailyUpdates();
//   }, []);

//   const loadDailyUpdates = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/daily-updates`);
//       const updates = response.data.dailyUpdates || [];

//       // Debug: Log image URLs to console
//       console.log("Loaded daily updates with images:");
//       updates.forEach((update, index) => {
//         console.log(`Update ${index + 1} - ${update.title}:`, {
//           imageUrl: update.imageUrl,
//         });
//       });

//       setDailyUpdates(updates);
//     } catch (error) {
//       console.error("Error loading daily updates:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString() + " " + date.toLocaleTimeString();
//   };

//   const getStatsForToday = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return dailyUpdates.filter((update) => {
//       const updateDate = new Date(update.createdAt);
//       updateDate.setHours(0, 0, 0, 0);
//       return updateDate.getTime() === today.getTime();
//     }).length;
//   };

//   const getStatsForWeek = () => {
//     const weekAgo = new Date();
//     weekAgo.setDate(weekAgo.getDate() - 7);
//     return dailyUpdates.filter(
//       (update) => new Date(update.createdAt) >= weekAgo
//     ).length;
//   };

//   if (loading) {
//     return <div className="loading">Loading daily updates...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Daily Updates Management</h1>
//         <div className="filter-controls">
//           <button className="btn btn-primary" onClick={loadDailyUpdates}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Calendar />
//           </div>
//           <div className="stat-content">
//             <h3>{getStatsForToday()}</h3>
//             <p>Today's Updates</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Calendar />
//           </div>
//           <div className="stat-content">
//             <h3>{getStatsForWeek()}</h3>
//             <p>This Week</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <User />
//           </div>
//           <div className="stat-content">
//             <h3>{dailyUpdates.length}</h3>
//             <p>Total Updates</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon">
//             <Image />
//           </div>
//           <div className="stat-content">
//             <h3>{dailyUpdates.filter((u) => u.imageUrl).length}</h3>
//             <p>With Images</p>
//           </div>
//         </div>
//       </div>

//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>Title</th>
//               <th>User</th>
//               <th>Description</th>
//               <th>Image</th>
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {dailyUpdates.length === 0 ? (
//               <tr>
//                 <td colSpan="5" style={{ textAlign: "center" }}>
//                   No daily updates found
//                 </td>
//               </tr>
//             ) : (
//               dailyUpdates.map((update) => (
//                 <tr key={update._id}>
//                   <td>
//                     <strong>{update.title}</strong>
//                   </td>
//                   <td>
//                     <div>{update.user?.fullName || "Unknown User"}</div>
//                     <div className="email-text">{update.user?.email}</div>
//                   </td>
//                   <td>
//                     <div className="description-text">
//                       {update.description?.length > 100
//                         ? `${update.description.substring(0, 100)}...`
//                         : update.description}
//                     </div>
//                   </td>
//                   <td>
//                     {update.imageUrl ? (
//                       <div
//                         style={{
//                           position: "relative",
//                           width: "50px",
//                           height: "50px",
//                         }}
//                       >
//                         <img
//                           src={update.imageUrl}
//                           alt="Daily update"
//                           style={{
//                             width: "50px",
//                             height: "50px",
//                             objectFit: "cover",
//                             borderRadius: "4px",
//                           }}
//                           onError={(e) => {
//                             console.error(
//                               "Failed to load daily update image:",
//                               update.imageUrl
//                             );
//                             e.target.style.display = "none";
//                             e.target.nextSibling.style.display = "flex";
//                           }}
//                         />
//                         <div
//                           style={{
//                             display: "none",
//                             width: "50px",
//                             height: "50px",
//                             backgroundColor: "#333",
//                             color: "#999",
//                             fontSize: "10px",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             borderRadius: "4px",
//                             textAlign: "center",
//                           }}
//                         >
//                           Failed to load
//                         </div>
//                       </div>
//                     ) : (
//                       <span style={{ color: "#999" }}>No image</span>
//                     )}
//                   </td>
//                   <td>{formatDate(update.createdAt)}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DailyUpdates;
