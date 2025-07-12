import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  Play,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Videos = () => {
  const { API_BASE, token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const accessLevels = ["Free", "Paid", "All"];
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    accessLevel: "All",
    youtubeLink: "",
    videoFile: null,
    thumbnailFile: null,
  });

  useEffect(() => {
    loadVideos();
    loadCategories();
  }, []);

  useEffect(() => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(
        (video) => video.category?.categoryId === categoryFilter
      );
    }

    if (accessFilter) {
      filtered = filtered.filter((video) => video.accessLevel === accessFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "category") {
          aValue = a.category?.name || "";
          bValue = b.category?.name || "";
        } else if (sortConfig.key === "createdAt") {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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

    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [videos, searchTerm, categoryFilter, accessFilter, sortConfig]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(response.data.videos || []);
      setFilteredVideos(response.data.videos || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/video-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load categories. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.videoFile && !formData.youtubeLink) {
      alert("Please provide either a video file or YouTube link");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("categoryId", formData.categoryId || "");
      formDataToSend.append("accessLevel", formData.accessLevel);
      formDataToSend.append("youtubeLink", formData.youtubeLink || "");
      if (formData.videoFile) {
        formDataToSend.append("video", formData.videoFile);
      }
      if (formData.thumbnailFile) {
        formDataToSend.append("thumbnail", formData.thumbnailFile);
      }
      formDataToSend.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      setIsUploading(true);
      setUploadProgress(0);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      };

      if (editingVideo) {
        await axios.put(
          `${API_BASE}/videos/${editingVideo._id}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(`${API_BASE}/videos`, formDataToSend, config);
      }

      setShowModal(false);
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        accessLevel: "All",
        youtubeLink: "",
        videoFile: null,
        thumbnailFile: null,
      });
      loadVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      alert(
        error.response?.data?.message || "Error saving video. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      categoryId: video.category?.categoryId || "",
      accessLevel: video.accessLevel,
      youtubeLink: video.youtubeLink || "",
      videoFile: null,
      thumbnailFile: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await axios.delete(`${API_BASE}/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loadVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
        alert(
          error.response?.data?.message ||
            "Error deleting video. Please try again."
        );
      }
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description || "",
      };

      if (editingCategory) {
        await axios.put(
          `${API_BASE}/video-categories/update/${editingCategory.categoryId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE}/video-categories/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        error.response?.data?.message ||
          "Error saving category. Please try again."
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(`Are you sure you want to delete this category?`)) {
      try {
        await axios.delete(
          `${API_BASE}/video-categories/delete/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(
          error.response?.data?.message ||
            "Error deleting category. Please try again."
        );
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(
    indexOfFirstVideo,
    indexOfLastVideo
  );
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  if (loading) {
    return <div className="loading">Loading videos...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Video Management</h1>
        <div className="filter-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingVideo(null);
              setFormData({
                title: "",
                description: "",
                categoryId: "",
                accessLevel: "All",
                youtubeLink: "",
                videoFile: null,
                thumbnailFile: null,
              });
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Add Video
          </button>
          {/* <button
            className="btn btn-secondary"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: "", description: "" });
              setShowCategoryModal(true);
            }}
          >
            <Edit size={16} />
            Manage Categories
          </button> */}
          <button className="btn btn-secondary" onClick={loadVideos}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="filter-controls"
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
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
            placeholder="Search videos..."
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            color: "var(--text-white)",
            minWidth: "150px",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            color: "var(--text-white)",
            minWidth: "150px",
          }}
        >
          <option value="">All Access Levels</option>
          {accessLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Videos Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {currentVideos.map((video) => (
          <div key={video._id} className="chart-card">
            <div style={{ position: "relative", marginBottom: "15px" }}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
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
                  <Play size={48} color="var(--text-gray)" />
                </div>
              )}
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <span
                  className={`flag-badge flag-${
                    video.accessLevel === "All"
                      ? "green"
                      : video.accessLevel === "Free"
                      ? "yellow"
                      : "red"
                  }`}
                >
                  {video.accessLevel}
                </span>
              </div>
            </div>

            <h3
              style={{
                color: "var(--primary-gold)",
                marginBottom: "8px",
                fontSize: "1.1rem",
                cursor: "pointer",
              }}
              onClick={() => handleSort("title")}
            >
              {video.title}{" "}
              {sortConfig.key === "title" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </h3>

            <p
              style={{
                color: "var(--text-gray)",
                marginBottom: "10px",
                fontSize: "0.9rem",
              }}
            >
              {video.description || "No description available"}
            </p>

            <div style={{ marginBottom: "15px" }}>
              <span
                className="flag-badge flag-green"
                style={{ marginRight: "8px", cursor: "pointer" }}
                onClick={() => handleSort("category")}
              >
                {video.category?.name || "No Category"}{" "}
                {sortConfig.key === "category" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </span>
              <span
                style={{
                  color: "var(--text-gray)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("createdAt")}
              >
                {formatDate(video.createdAt)}{" "}
                {sortConfig.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="action-btn btn-edit"
                onClick={() => handleEdit(video)}
              >
                <Edit size={14} />
              </button>
              <button
                className="action-btn btn-delete"
                onClick={() => handleDelete(video._id)}
              >
                <Trash2 size={14} />
              </button>
              {video.youtubeLink && (
                <a
                  href={video.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn btn-view"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  title="Play on YouTube"
                >
                  <Play size={14} />
                </a>
              )}
              {video.videoUrl && (
                <button
                  onClick={() => {
                    setCurrentVideoUrl(video.videoUrl);
                    setShowVideoPlayer(true);
                  }}
                  className="action-btn btn-view"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  title="Play uploaded video"
                >
                  <Play size={14} />
                </button>
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

      {/* Add/Edit Video Modal */}
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
              maxWidth: "800px", // Increased width for better display
              border: "1px solid var(--border-color)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ color: "var(--primary-gold)", margin: 0 }}>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-white)",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
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
                  <label>Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
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
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
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
                  <label>Access Level</label>
                  <select
                    value={formData.accessLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, accessLevel: e.target.value })
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
                    {accessLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>YouTube Link</label>
                  <input
                    type="url"
                    value={formData.youtubeLink}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeLink: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "var(--input-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-white)",
                    }}
                  />
                  <small
                    style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
                  >
                    Optional - Provide a YouTube link or upload a video file
                    below
                  </small>
                </div>

                <div className="form-group">
                  <label>Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setFormData({ ...formData, videoFile: e.target.files[0] })
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
                  <small
                    style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
                  >
                    Optional - Upload video file (max 100MB, mp4, webm)
                  </small>
                </div>

                <div className="form-group">
                  <label>Thumbnail Image</label>
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnailFile: e.target.files[0],
                      })
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

                  <small
                    style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
                  >
                    Optional - Upload a thumbnail image (jpg, png, max 5MB)
                  </small>
                </div>
              </div>

              {isUploading && (
                <div style={{ margin: "20px 0" }}>
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
                    : editingVideo
                    ? "Update"
                    : "Create"}{" "}
                  Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
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
              Manage Video Categories
            </h2>

            {/* Add/Edit Category Form */}
            <div style={{ marginBottom: "30px" }}>
              <div className="form-group">
                <label>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="Category name"
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
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Category description (optional)"
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
                  onClick={handleCategorySubmit}
                  className="btn btn-primary"
                  disabled={!categoryForm.name.trim()}
                  style={{ marginTop: "10px" }}
                >
                  {editingCategory ? "Update" : "Add"}
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "var(--text-white)", marginBottom: "15px" }}>
                Existing Categories
              </h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {categories.map((category) => (
                  <div
                    key={category.categoryId}
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
                        {category.name}
                      </span>
                      <p
                        style={{
                          color: "var(--text-gray)",
                          fontSize: "0.8rem",
                          margin: "5px 0 0 0",
                        }}
                      >
                        {category.description || "No description"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({
                            name: category.name,
                            description: category.description || "",
                          });
                        }}
                        className="action-btn btn-edit"
                        style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCategory(category.categoryId)
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
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "" });
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{videos.length}</h3>
            <p>Total Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{videos.filter((v) => v.accessLevel === "All").length}</h3>
            <p>All Users Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{videos.filter((v) => v.accessLevel === "Free").length}</h3>
            <p>Freemium Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{videos.filter((v) => v.accessLevel === "Paid").length}</h3>
            <p>Premium Videos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{categories.length}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowVideoPlayer(false)}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90%",
              backgroundColor: "#000",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: "var(--card-bg)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: "var(--text-white)", margin: 0 }}>
                Video Player
              </h3>
              <button
                onClick={() => setShowVideoPlayer(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-white)",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <video
              src={currentVideoUrl}
              controls
              autoPlay
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                display: "block",
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;

// import React, { useState, useEffect } from "react";
// import {
//   RefreshCw,
//   Plus,
//   Play,
//   Edit,
//   Trash2,
//   Search,
//   Filter,
// } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Videos = () => {
//   const { API_BASE, token } = useAuth();
//   const [videos, setVideos] = useState([]);
//   const [filteredVideos, setFilteredVideos] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [editingVideo, setEditingVideo] = useState(null);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [accessFilter, setAccessFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [videosPerPage] = useState(10);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showVideoPlayer, setShowVideoPlayer] = useState(false);
//   const [currentVideoUrl, setCurrentVideoUrl] = useState("");
//   const accessLevels = ["Free", "Paid"];
//   const [categoryForm, setCategoryForm] = useState({
//     name: "",
//     description: "",
//   });

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     categoryId: "",
//     accessLevel: "Free",
//     youtubeLink: "",
//     videoFile: null,
//     thumbnailFile: null,
//   });

//   useEffect(() => {
//     loadVideos();
//     loadCategories();
//   }, []);

//   useEffect(() => {
//     let filtered = videos;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (video) =>
//           video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           video.description?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (categoryFilter) {
//       filtered = filtered.filter(
//         (video) => video.category?.categoryId === categoryFilter
//       );
//     }

//     if (accessFilter) {
//       filtered = filtered.filter((video) => video.accessLevel === accessFilter);
//     }

//     // Apply sorting
//     if (sortConfig.key) {
//       filtered = [...filtered].sort((a, b) => {
//         let aValue, bValue;
//         if (sortConfig.key === "category") {
//           aValue = a.category?.name || "";
//           bValue = b.category?.name || "";
//         } else if (sortConfig.key === "createdAt") {
//           aValue = new Date(a.createdAt).getTime();
//           bValue = new Date(b.createdAt).getTime();
//         } else {
//           aValue = a[sortConfig.key] || "";
//           bValue = b[sortConfig.key] || "";
//         }
//         if (typeof aValue === "number") {
//           return sortConfig.direction === "asc"
//             ? aValue - bValue
//             : bValue - aValue;
//         }
//         return sortConfig.direction === "asc"
//           ? aValue.toString().localeCompare(bValue.toString())
//           : bValue.toString().localeCompare(aValue.toString());
//       });
//     }

//     setFilteredVideos(filtered);
//     setCurrentPage(1);
//   }, [videos, searchTerm, categoryFilter, accessFilter, sortConfig]);

//   const loadVideos = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/videos`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setVideos(response.data.videos || []);
//       setFilteredVideos(response.data.videos || []);
//     } catch (error) {
//       console.error("Error loading videos:", error);
//       alert(
//         error.response?.data?.message ||
//           "Failed to load videos. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCategories = async () => {
//     try {
//       const response = await axios.get(`${API_BASE}/video-categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCategories(response.data.data || []);
//     } catch (error) {
//       console.error("Error loading categories:", error);
//       alert(
//         error.response?.data?.message ||
//           "Failed to load categories. Please try again."
//       );
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.videoFile && !formData.youtubeLink) {
//       alert("Please provide either a video file or YouTube link");
//       return;
//     }

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("title", formData.title);
//       formDataToSend.append("description", formData.description || "");
//       formDataToSend.append("categoryId", formData.categoryId || "");
//       formDataToSend.append("accessLevel", formData.accessLevel);
//       formDataToSend.append("youtubeLink", formData.youtubeLink || "");
//       if (formData.videoFile) {
//         formDataToSend.append("video", formData.videoFile);
//       }
//       if (formData.thumbnailFile) {
//         formDataToSend.append("thumbnail", formData.thumbnailFile);
//       }

//       // Log FormData for debugging
//       for (let pair of formDataToSend.entries()) {
//         console.log(`${pair[0]}: ${pair[1]}`);
//       }

//       setIsUploading(true);
//       setUploadProgress(0);

//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadProgress(progress);
//         },
//       };

//       if (editingVideo) {
//         await axios.put(
//           `${API_BASE}/videos/${editingVideo._id}`,
//           formDataToSend,
//           config
//         );
//       } else {
//         await axios.post(`${API_BASE}/videos`, formDataToSend, config);
//       }

//       setShowModal(false);
//       setEditingVideo(null);
//       setFormData({
//         title: "",
//         description: "",
//         categoryId: "",
//         accessLevel: "Free",
//         youtubeLink: "",
//         videoFile: null,
//         thumbnailFile: null,
//       });
//       loadVideos();
//     } catch (error) {
//       console.error("Error saving video:", error);
//       alert(
//         error.response?.data?.message || "Error saving video. Please try again."
//       );
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleEdit = (video) => {
//     setEditingVideo(video);
//     setFormData({
//       title: video.title,
//       description: video.description || "",
//       categoryId: video.category?.categoryId || "",
//       accessLevel: video.accessLevel,
//       youtubeLink: video.youtubeLink || "",
//       videoFile: null,
//       thumbnailFile: null,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (videoId) => {
//     if (window.confirm("Are you sure you want to delete this video?")) {
//       try {
//         await axios.delete(`${API_BASE}/videos/${videoId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         loadVideos();
//       } catch (error) {
//         console.error("Error deleting video:", error);
//         alert(
//           error.response?.data?.message ||
//             "Error deleting video. Please try again."
//         );
//       }
//     }
//   };

//   const handleCategorySubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         name: categoryForm.name,
//         description: categoryForm.description || "",
//       };

//       if (editingCategory) {
//         await axios.put(
//           `${API_BASE}/video-categories/update/${editingCategory.categoryId}`,
//           payload,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       } else {
//         await axios.post(`${API_BASE}/video-categories/add`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       setShowCategoryModal(false);
//       setEditingCategory(null);
//       setCategoryForm({ name: "", description: "" });
//       loadCategories();
//     } catch (error) {
//       console.error("Error saving category:", error);
//       alert(
//         error.response?.data?.message ||
//           "Error saving category. Please try again."
//       );
//     }
//   };

//   const handleDeleteCategory = async (categoryId) => {
//     if (window.confirm(`Are you sure you want to delete this category?`)) {
//       try {
//         await axios.delete(
//           `${API_BASE}/video-categories/delete/${categoryId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         loadCategories();
//       } catch (error) {
//         console.error("Error deleting category:", error);
//         alert(
//           error.response?.data?.message ||
//             "Error deleting category. Please try again."
//         );
//       }
//     }
//   };

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString();
//   };

//   // Pagination
//   const indexOfLastVideo = currentPage * videosPerPage;
//   const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
//   const currentVideos = filteredVideos.slice(
//     indexOfFirstVideo,
//     indexOfLastVideo
//   );
//   const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

//   if (loading) {
//     return <div className="loading">Loading videos...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Video Management</h1>
//         <div className="filter-controls">
//           <button
//             className="btn btn-primary"
//             onClick={() => {
//               setEditingVideo(null);
//               setFormData({
//                 title: "",
//                 description: "",
//                 categoryId: "",
//                 accessLevel: "Free",
//                 youtubeLink: "",
//                 videoFile: null,
//                 thumbnailFile: null,
//               });
//               setShowModal(true);
//             }}
//           >
//             <Plus size={16} />
//             Add Video
//           </button>
//           <button
//             className="btn btn-secondary"
//             onClick={() => {
//               setEditingCategory(null);
//               setCategoryForm({ name: "", description: "" });
//               setShowCategoryModal(true);
//             }}
//           >
//             <Edit size={16} />
//             Manage Categories
//           </button>
//           <button className="btn btn-secondary" onClick={loadVideos}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div
//         className="filter-controls"
//         style={{ marginBottom: "20px", flexWrap: "wrap" }}
//       >
//         <div
//           className="search-box"
//           style={{ position: "relative", flex: "1", minWidth: "200px" }}
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
//             placeholder="Search videos..."
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

//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           style={{
//             padding: "8px 12px",
//             background: "var(--input-bg)",
//             border: "1px solid var(--border-color)",
//             borderRadius: "6px",
//             color: "var(--text-white)",
//             minWidth: "150px",
//           }}
//         >
//           <option value="">All Categories</option>
//           {categories.map((category) => (
//             <option key={category.categoryId} value={category.categoryId}>
//               {category.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={accessFilter}
//           onChange={(e) => setAccessFilter(e.target.value)}
//           style={{
//             padding: "8px 12px",
//             background: "var(--input-bg)",
//             border: "1px solid var(--border-color)",
//             borderRadius: "6px",
//             color: "var(--text-white)",
//             minWidth: "150px",
//           }}
//         >
//           <option value="">All Access Levels</option>
//           {accessLevels.map((level) => (
//             <option key={level} value={level}>
//               {level}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Videos Grid */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//           gap: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         {currentVideos.map((video) => (
//           <div key={video._id} className="chart-card">
//             <div style={{ position: "relative", marginBottom: "15px" }}>
//               {video.thumbnailUrl ? (
//                 <img
//                   src={video.thumbnailUrl}
//                   alt={video.title}
//                   style={{
//                     width: "100%",
//                     height: "180px",
//                     objectFit: "cover",
//                     borderRadius: "8px",
//                   }}
//                 />
//               ) : (
//                 <div
//                   style={{
//                     width: "100%",
//                     height: "180px",
//                     background: "var(--border-color)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     borderRadius: "8px",
//                   }}
//                 >
//                   <Play size={48} color="var(--text-gray)" />
//                 </div>
//               )}
//               <div style={{ position: "absolute", top: "10px", right: "10px" }}>
//                 <span
//                   className={`flag-badge flag-${
//                     video.accessLevel === "Free" ? "green" : "yellow"
//                   }`}
//                 >
//                   {video.accessLevel}
//                 </span>
//               </div>
//             </div>

//             <h3
//               style={{
//                 color: "var(--primary-gold)",
//                 marginBottom: "8px",
//                 fontSize: "1.1rem",
//                 cursor: "pointer",
//               }}
//               onClick={() => handleSort("title")}
//             >
//               {video.title}{" "}
//               {sortConfig.key === "title" &&
//                 (sortConfig.direction === "asc" ? "↑" : "↓")}
//             </h3>

//             <p
//               style={{
//                 color: "var(--text-gray)",
//                 marginBottom: "10px",
//                 fontSize: "0.9rem",
//               }}
//             >
//               {video.description || "No description available"}
//             </p>

//             <div style={{ marginBottom: "15px" }}>
//               <span
//                 className="flag-badge flag-green"
//                 style={{ marginRight: "8px", cursor: "pointer" }}
//                 onClick={() => handleSort("category")}
//               >
//                 {video.category?.name || "No Category"}{" "}
//                 {sortConfig.key === "category" &&
//                   (sortConfig.direction === "asc" ? "↑" : "↓")}
//               </span>
//               <span
//                 style={{
//                   color: "var(--text-gray)",
//                   fontSize: "0.8rem",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => handleSort("createdAt")}
//               >
//                 {formatDate(video.createdAt)}{" "}
//                 {sortConfig.key === "createdAt" &&
//                   (sortConfig.direction === "asc" ? "↑" : "↓")}
//               </span>
//             </div>

//             <div style={{ display: "flex", gap: "8px" }}>
//               <button
//                 className="action-btn btn-edit"
//                 onClick={() => handleEdit(video)}
//               >
//                 <Edit size={14} />
//               </button>
//               <button
//                 className="action-btn btn-delete"
//                 onClick={() => handleDelete(video._id)}
//               >
//                 <Trash2 size={14} />
//               </button>
//               {video.youtubeLink && (
//                 <a
//                   href={video.youtubeLink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="action-btn btn-view"
//                   style={{
//                     textDecoration: "none",
//                     display: "inline-flex",
//                     alignItems: "center",
//                   }}
//                   title="Play on YouTube"
//                 >
//                   <Play size={14} />
//                 </a>
//               )}
//               {video.videoUrl && (
//                 <button
//                   onClick={() => {
//                     setCurrentVideoUrl(video.videoUrl);
//                     setShowVideoPlayer(true);
//                   }}
//                   className="action-btn btn-view"
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                   }}
//                   title="Play uploaded video"
//                 >
//                   <Play size={14} />
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
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

//       {/* Add/Edit Video Modal */}
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
//               {editingVideo ? "Edit Video" : "Add New Video"}
//             </h2>

//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label>Title *</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
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
//                 <label>Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) =>
//                     setFormData({ ...formData, description: e.target.value })
//                   }
//                   rows={3}
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                     resize: "vertical",
//                   }}
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Category *</label>
//                 <select
//                   value={formData.categoryId}
//                   onChange={(e) =>
//                     setFormData({ ...formData, categoryId: e.target.value })
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
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((category) => (
//                     <option
//                       key={category.categoryId}
//                       value={category.categoryId}
//                     >
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label>Access Level</label>
//                 <select
//                   value={formData.accessLevel}
//                   onChange={(e) =>
//                     setFormData({ ...formData, accessLevel: e.target.value })
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
//                   {accessLevels.map((level) => (
//                     <option key={level} value={level}>
//                       {level}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label>YouTube Link</label>
//                 <input
//                   type="url"
//                   value={formData.youtubeLink}
//                   onChange={(e) =>
//                     setFormData({ ...formData, youtubeLink: e.target.value })
//                   }
//                   placeholder="https://youtube.com/watch?v=..."
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 />
//                 <small
//                   style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
//                 >
//                   Optional - Provide a YouTube link or upload a video file below
//                 </small>
//               </div>

//               <div className="form-group">
//                 <label>Video File</label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) =>
//                     setFormData({ ...formData, videoFile: e.target.files[0] })
//                   }
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 />
//                 <small
//                   style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
//                 >
//                   Optional - Upload video file (max 100MB, mp4, webm)
//                 </small>
//               </div>

//               <div className="form-group">
//                 <label>Thumbnail Image</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       thumbnailFile: e.target.files[0],
//                     })
//                   }
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 />
//                 <small
//                   style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}
//                 >
//                   Optional - Upload a thumbnail image (jpg, png, max 5MB)
//                 </small>
//               </div>

//               {isUploading && (
//                 <div style={{ marginBottom: "20px" }}>
//                   <div
//                     style={{ marginBottom: "8px", color: "var(--text-gray)" }}
//                   >
//                     Upload Progress: {uploadProgress}%
//                   </div>
//                   <div
//                     style={{
//                       width: "100%",
//                       height: "8px",
//                       backgroundColor: "var(--bg-secondary)",
//                       borderRadius: "4px",
//                       overflow: "hidden",
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: `${uploadProgress}%`,
//                         height: "100%",
//                         backgroundColor: "var(--primary-color)",
//                         transition: "width 0.3s ease",
//                       }}
//                     />
//                   </div>
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
//                   disabled={isUploading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn btn-primary"
//                   disabled={isUploading}
//                 >
//                   {isUploading
//                     ? "Uploading..."
//                     : editingVideo
//                     ? "Update"
//                     : "Create"}{" "}
//                   Video
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Category Management Modal */}
//       {showCategoryModal && (
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
//               Manage Video Categories
//             </h2>

//             {/* Add/Edit Category Form */}
//             <div style={{ marginBottom: "30px" }}>
//               <div className="form-group">
//                 <label>
//                   {editingCategory ? "Edit Category" : "Add New Category"}
//                 </label>
//                 <input
//                   type="text"
//                   value={categoryForm.name}
//                   onChange={(e) =>
//                     setCategoryForm({ ...categoryForm, name: e.target.value })
//                   }
//                   placeholder="Category name"
//                   required
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                     marginBottom: "10px",
//                   }}
//                 />
//                 <input
//                   type="text"
//                   value={categoryForm.description}
//                   onChange={(e) =>
//                     setCategoryForm({
//                       ...categoryForm,
//                       description: e.target.value,
//                     })
//                   }
//                   placeholder="Category description (optional)"
//                   style={{
//                     width: "100%",
//                     padding: "12px",
//                     background: "var(--input-bg)",
//                     border: "1px solid var(--border-color)",
//                     borderRadius: "8px",
//                     color: "var(--text-white)",
//                   }}
//                 />
//                 <button
//                   onClick={handleCategorySubmit}
//                   className="btn btn-primary"
//                   disabled={!categoryForm.name.trim()}
//                   style={{ marginTop: "10px" }}
//                 >
//                   {editingCategory ? "Update" : "Add"}
//                 </button>
//               </div>
//             </div>

//             {/* Categories List */}
//             <div style={{ marginBottom: "20px" }}>
//               <h3 style={{ color: "var(--text-white)", marginBottom: "15px" }}>
//                 Existing Categories
//               </h3>
//               <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//                 {categories.map((category) => (
//                   <div
//                     key={category.categoryId}
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
//                     <div>
//                       <span style={{ color: "var(--text-white)" }}>
//                         {category.name}
//                       </span>
//                       <p
//                         style={{
//                           color: "var(--text-gray)",
//                           fontSize: "0.8rem",
//                           margin: "5px 0 0 0",
//                         }}
//                       >
//                         {category.description || "No description"}
//                       </p>
//                     </div>
//                     <div style={{ display: "flex", gap: "5px" }}>
//                       <button
//                         onClick={() => {
//                           setEditingCategory(category);
//                           setCategoryForm({
//                             name: category.name,
//                             description: category.description || "",
//                           });
//                         }}
//                         className="action-btn btn-edit"
//                         style={{ fontSize: "0.8rem", padding: "4px 8px" }}
//                       >
//                         <Edit size={12} />
//                       </button>
//                       <button
//                         onClick={() =>
//                           handleDeleteCategory(category.categoryId)
//                         }
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
//                   setShowCategoryModal(false);
//                   setEditingCategory(null);
//                   setCategoryForm({ name: "", description: "" });
//                 }}
//                 className="btn btn-secondary"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stats */}
//       <div className="stats-grid" style={{ marginTop: "30px" }}>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{videos.length}</h3>
//             <p>Total Videos</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{videos.filter((v) => v.accessLevel === "Free").length}</h3>
//             <p>Free Videos</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{videos.filter((v) => v.accessLevel === "Paid").length}</h3>
//             <p>Premium Videos</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{categories.length}</h3>
//             <p>Categories</p>
//           </div>
//         </div>
//       </div>

//       {/* Video Player Modal */}
//       {showVideoPlayer && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0, 0, 0, 0.9)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//           onClick={() => setShowVideoPlayer(false)}
//         >
//           <div
//             style={{
//               width: "90%",
//               maxWidth: "800px",
//               maxHeight: "90%",
//               backgroundColor: "#000",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div
//               style={{
//                 padding: "10px",
//                 backgroundColor: "var(--card-bg)",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <h3 style={{ color: "var(--text-white)", margin: 0 }}>
//                 Video Player
//               </h3>
//               <button
//                 onClick={() => setShowVideoPlayer(false)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "var(--text-white)",
//                   fontSize: "20px",
//                   cursor: "pointer",
//                 }}
//               >
//                 ×
//               </button>
//             </div>
//             <video
//               src={currentVideoUrl}
//               controls
//               autoPlay
//               style={{
//                 width: "100%",
//                 height: "auto",
//                 maxHeight: "70vh",
//                 display: "block",
//               }}
//             >
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Videos;
