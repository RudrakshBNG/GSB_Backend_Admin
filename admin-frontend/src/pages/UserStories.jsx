import React, { useState, useEffect } from "react";
import { RefreshCw, Image, User, Calendar, Star } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const UserStories = () => {
  const { API_BASE } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/stories`);
      const stories = response.data.stories || [];

      // Debug: Log image URLs to console
      console.log("Loaded stories with images:");
      stories.forEach((story, index) => {
        console.log(`Story ${index + 1} - ${story.title}:`, {
          beforeImageUrl: story.beforeImageUrl,
          afterImageUrl: story.afterImageUrl,
        });
      });

      setStories(stories);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupDemoData = async () => {
    if (
      window.confirm(
        "Are you sure you want to remove all demo stories with broken images? This action cannot be undone."
      )
    ) {
      try {
        const response = await axios.delete(`${API_BASE}/stories/cleanup-demo`);
        alert(response.data.message);
        loadStories(); // Reload the stories after cleanup
      } catch (error) {
        console.error("Error cleaning up demo data:", error);
        alert("Failed to cleanup demo data. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatsForMonth = () => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return stories.filter((story) => new Date(story.createdAt) >= monthAgo)
      .length;
  };

  if (loading) {
    return <div className="loading">Loading user stories...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">User Stories Management</h1>
        <div className="filter-controls">
          <button className="btn btn-primary" onClick={loadStories}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Star />
          </div>
          <div className="stat-content">
            <h3>{stories.length}</h3>
            <p>Total Stories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{getStatsForMonth()}</h3>
            <p>This Month</p>
          </div>
        </div>
      </div>

      <div className="stories-grid">
        {stories.length === 0 ? (
          <div
            className="chart-card"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <p style={{ color: "#cccccc" }}>No user stories found</p>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story._id} className="story-card">
              <div className="story-header">
                <h3>{story.title}</h3>
                <span className="story-date">
                  {formatDate(story.createdAt)}
                </span>
              </div>

              <div className="story-user">
                <User size={16} />
                <span>{story.user?.fullName || "Unknown User"}</span>
              </div>

              <div className="story-description">
                <p>{story.description}</p>
              </div>

              <div className="story-images">
                <div className="image-section">
                  <h4>Before</h4>
                  {story.beforeImageUrl ? (
                    <img
                      src={story.beforeImageUrl}
                      alt="Before"
                      className="story-image"
                      onError={(e) => {
                        console.error(
                          "Failed to load before image:",
                          story.beforeImageUrl
                        );
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <div
                    className="no-image"
                    style={{ display: story.beforeImageUrl ? "none" : "block" }}
                  >
                    {story.beforeImageUrl
                      ? "Image failed to load"
                      : "No before image"}
                  </div>
                </div>

                <div className="image-section">
                  <h4>After</h4>
                  {story.afterImageUrl ? (
                    <img
                      src={story.afterImageUrl}
                      alt="After"
                      className="story-image"
                      onError={(e) => {
                        console.error(
                          "Failed to load after image:",
                          story.afterImageUrl
                        );
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <div
                    className="no-image"
                    style={{ display: story.afterImageUrl ? "none" : "block" }}
                  >
                    {story.afterImageUrl
                      ? "Image failed to load"
                      : "No after image"}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserStories;
