import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  FileText,
  Edit,
  Trash2,
  Search,
  Download,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DietPlans = () => {
  const { API_BASE } = useAuth();
  const [dietPlans, setDietPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [plansPerPage] = useState(8);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pdfFile: null,
    thumbnail: null,
  });

  useEffect(() => {
    loadDietPlans();
  }, []);

  useEffect(() => {
    // Filter plans based on search
    let filtered = dietPlans;

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredPlans(filtered);
    setCurrentPage(1);
  }, [dietPlans, searchTerm]);

  const loadDietPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/dietplans`);
      setDietPlans(response.data.data || []);
      setFilteredPlans(response.data.data || []);
    } catch (error) {
      console.error("Error loading diet plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      if (formData.pdfFile) {
        formDataToSend.append("pdfFile", formData.pdfFile);
      }
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      setIsUploading(true);
      setUploadProgress(0);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(progress);
        },
      };

      if (editingPlan) {
        // Update plan (you'll need to implement this endpoint)
        await axios.put(
          `${API_BASE}/dietplans/${editingPlan._id}`,
          formDataToSend,
          config,
        );
      } else {
        await axios.post(`${API_BASE}/dietplans`, formDataToSend, config);
      }

      setShowModal(false);
      setEditingPlan(null);
      setFormData({
        title: "",
        description: "",
        pdfFile: null,
        thumbnail: null,
      });
      loadDietPlans();
    } catch (error) {
      console.error("Error saving diet plan:", error);
      alert("Error saving diet plan. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description || "",
      pdfFile: null,
      thumbnail: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this diet plan?")) {
      try {
        await axios.delete(`${API_BASE}/dietplans/${planId}`);
        loadDietPlans();
      } catch (error) {
        console.error("Error deleting diet plan:", error);
        alert("Error deleting diet plan. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination
  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = filteredPlans.slice(indexOfFirstPlan, indexOfLastPlan);
  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  if (loading) {
    return <div className="loading">Loading diet plans...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Diet Plans Management</h1>
        <div className="filter-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingPlan(null);
              setFormData({
                title: "",
                description: "",
                pdfFile: null,
                thumbnail: null,
              });
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Add Diet Plan
          </button>
          <button className="btn btn-secondary" onClick={loadDietPlans}>
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
            placeholder="Search diet plans..."
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

      {/* Diet Plans Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {currentPlans.map((plan) => (
          <div key={plan._id} className="chart-card">
            <div style={{ position: "relative", marginBottom: "15px" }}>
              {plan.thumbnailUrl ? (
                <img
                  src={plan.thumbnailUrl}
                  alt={plan.title}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    background: "var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                >
                  <FileText size={48} color="var(--text-gray)" />
                </div>
              )}
            </div>

            <h3
              style={{
                color: "var(--primary-gold)",
                marginBottom: "8px",
                fontSize: "1.1rem",
              }}
            >
              {plan.title}
            </h3>

            <p
              style={{
                color: "var(--text-gray)",
                marginBottom: "15px",
                fontSize: "0.9rem",
              }}
            >
              {plan.description || "No description available"}
            </p>

            <div style={{ marginBottom: "15px" }}>
              <span style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}>
                Created: {formatDate(plan.createdAt)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="action-btn btn-edit"
                onClick={() => handleEdit(plan)}
              >
                <Edit size={14} />
              </button>
              <button
                className="action-btn btn-delete"
                onClick={() => handleDelete(plan._id)}
              >
                <Trash2 size={14} />
              </button>
              {plan.pdfUrl && (
                <a
                  href={plan.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn btn-view"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
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
              className={`btn ${currentPage === i + 1 ? "btn-primary" : "btn-secondary"}`}
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
              maxWidth: "500px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h2 style={{ color: "var(--primary-gold)", marginBottom: "20px" }}>
              {editingPlan ? "Edit Diet Plan" : "Add New Diet Plan"}
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
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
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
                <label>PDF File {!editingPlan && "*"}</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, pdfFile: e.target.files[0] })
                  }
                  required={!editingPlan}
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
                <label>Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.files[0] })
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

              {isUploading && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{ marginBottom: "8px", color: "var(--text-gray)" }}
                  >
                    Upload Progress: {uploadProgress}%
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: "100%",
                        backgroundColor: "var(--primary-color)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
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
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUploading}
                >
                  {isUploading
                    ? "Uploading..."
                    : editingPlan
                      ? "Update"
                      : "Create"}{" "}
                  Diet Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dietPlans.length}</h3>
            <p>Total Diet Plans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dietPlans.filter((p) => p.thumbnailUrl).length}</h3>
            <p>With Thumbnails</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{dietPlans.filter((p) => p.description).length}</h3>
            <p>With Descriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{new Date().getMonth() + 1}</h3>
            <p>This Month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlans;
