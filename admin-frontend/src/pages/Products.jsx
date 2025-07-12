import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Plus,
  Package,
  Edit,
  Trash2,
  Search,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Products = () => {
  const { API_BASE } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  const statuses = ["In Stock", "Low Stock", "Out of Stock"];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    stock: "",
    ingredients: "",
    benefits: "",
    image: null,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search and status
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("salePrice", formData.salePrice || "");
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append(
        "ingredients",
        JSON.stringify(
          formData.ingredients
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i)
        )
      );
      formDataToSend.append(
        "benefits",
        JSON.stringify(
          formData.benefits
            .split(",")
            .map((b) => b.trim())
            .filter((b) => b)
        )
      );

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingProduct) {
        await axios.put(
          `${API_BASE}/products/${editingProduct._id}`,
          formDataToSend
        );
      } else {
        await axios.post(`${API_BASE}/products`, formDataToSend);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        salePrice: "",
        stock: "",
        ingredients: "",
        benefits: "",
        image: null,
      });
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      stock: product.stock.toString(),
      ingredients: product.ingredients?.join(", ") || "",
      benefits: product.benefits?.join(", ") || "",
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE}/products/${productId}`);
        loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "flag-green";
      case "Low Stock":
        return "flag-yellow";
      case "Out of Stock":
        return "flag-red";
      default:
        return "flag-gray";
    }
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title-main">Products Management</h1>
        <div className="filter-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: "",
                description: "",
                price: "",
                salePrice: "",
                stock: "",
                ingredients: "",
                benefits: "",
                image: null,
              });
              setShowModal(true);
            }}
          >
            <Plus size={16} />
            Add Product
          </button>
          <button className="btn btn-secondary" onClick={loadProducts}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
            placeholder="Search products..."
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
            padding: "8px 12px",
            background: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            color: "var(--text-white)",
          }}
        >
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginTop: "30px" }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{products.filter((p) => p.status === "In Stock").length}</h3>
            <p>In Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{products.filter((p) => p.status === "Low Stock").length}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>
              {formatCurrency(
                products.reduce((total, p) => total + p.price, 0)
              )}
            </h3>
            <p>Total Value</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {currentProducts.map((product) => (
          <div key={product._id} className="chart-card">
            <div style={{ position: "relative", marginBottom: "15px" }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
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
                  <Package size={48} color="var(--text-gray)" />
                </div>
              )}
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <span
                  className={`flag-badge ${getStatusColor(product.status)}`}
                >
                  {product.status}
                </span>
              </div>
            </div>

            <h3
              style={{
                color: "var(--primary-gold)",
                marginBottom: "8px",
                fontSize: "1.1rem",
              }}
            >
              {product.name}
            </h3>

            <p
              style={{
                color: "var(--text-gray)",
                marginBottom: "10px",
                fontSize: "0.9rem",
                minHeight: "40px",
              }}
            >
              {product.description || "No description available"}
            </p>

            <div style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-white)",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  {formatCurrency(product.price)}
                </span>
                {product.salePrice && (
                  <span
                    style={{
                      color: "var(--text-gray)",
                      fontSize: "1rem",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatCurrency(product.salePrice)}
                  </span>
                )}
              </div>
              <div style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}>
                Stock: {product.stock} units
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="action-btn btn-edit"
                onClick={() => handleEdit(product)}
              >
                <Edit size={14} />
              </button>
              <button
                className="action-btn btn-delete"
                onClick={() => handleDelete(product._id)}
              >
                <Trash2 size={14} />
              </button>
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
                {editingProduct ? "Edit Product" : "Add New Product"}
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
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                  <label>Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
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
                  <label>Sale Price</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    min="0"
                    step="0.01"
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
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
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
                  <label>Ingredients (comma separated)</label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    rows={3}
                    placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
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

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Benefits (comma separated)</label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    rows={3}
                    placeholder="Benefit 1, Benefit 2, Benefit 3"
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

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Product Image {!editingProduct && "*"}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                    required={!editingProduct}
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
                  {editingProduct ? "Update" : "Create"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
// import React, { useState, useEffect } from "react";
// import {
//   RefreshCw,
//   Plus,
//   Package,
//   Edit,
//   Trash2,
//   Search,
//   DollarSign,
// } from "lucide-react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";

// const Products = () => {
//   const { API_BASE } = useAuth();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsPerPage] = useState(8);

//   const statuses = ["In Stock", "Low Stock", "Out of Stock"];

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     salePrice: "",
//     stock: "",
//     ingredients: "",
//     benefits: "",
//     image: null,
//   });

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   useEffect(() => {
//     // Filter products based on search and status
//     let filtered = products;

//     if (searchTerm) {
//       filtered = filtered.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           product.description?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter) {
//       filtered = filtered.filter((product) => product.status === statusFilter);
//     }

//     setFilteredProducts(filtered);
//     setCurrentPage(1);
//   }, [products, searchTerm, statusFilter]);

//   const loadProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE}/products`);
//       setProducts(response.data.products || []);
//       setFilteredProducts(response.data.products || []);
//     } catch (error) {
//       console.error("Error loading products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("name", formData.name);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("price", formData.price);
//       formDataToSend.append("salePrice", formData.salePrice || "");
//       formDataToSend.append("stock", formData.stock);
//       formDataToSend.append(
//         "ingredients",
//         JSON.stringify(
//           formData.ingredients
//             .split(",")
//             .map((i) => i.trim())
//             .filter((i) => i)
//         )
//       );
//       formDataToSend.append(
//         "benefits",
//         JSON.stringify(
//           formData.benefits
//             .split(",")
//             .map((b) => b.trim())
//             .filter((b) => b)
//         )
//       );

//       if (formData.image) {
//         formDataToSend.append("image", formData.image);
//       }

//       if (editingProduct) {
//         // Update product (you'll need to implement this endpoint)
//         await axios.put(
//           `${API_BASE}/products/${editingProduct._id}`,
//           formDataToSend
//         );
//       } else {
//         await axios.post(`${API_BASE}/products`, formDataToSend);
//       }

//       setShowModal(false);
//       setEditingProduct(null);
//       setFormData({
//         name: "",
//         description: "",
//         price: "",
//         salePrice: "",
//         stock: "",
//         ingredients: "",
//         benefits: "",
//         image: null,
//       });
//       loadProducts();
//     } catch (error) {
//       console.error("Error saving product:", error);
//       alert("Error saving product. Please try again.");
//     }
//   };

//   const handleEdit = (product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       description: product.description || "",
//       price: product.price.toString(),
//       salePrice: product.salePrice?.toString() || "",
//       stock: product.stock.toString(),
//       ingredients: product.ingredients?.join(", ") || "",
//       benefits: product.benefits?.join(", ") || "",
//       image: null,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (productId) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       try {
//         await axios.delete(`${API_BASE}/products/${productId}`);
//         loadProducts();
//       } catch (error) {
//         console.error("Error deleting product:", error);
//         alert("Error deleting product. Please try again.");
//       }
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "In Stock":
//         return "flag-green";
//       case "Low Stock":
//         return "flag-yellow";
//       case "Out of Stock":
//         return "flag-red";
//       default:
//         return "flag-gray";
//     }
//   };

//   // Pagination
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(
//     indexOfFirstProduct,
//     indexOfLastProduct
//   );
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

//   if (loading) {
//     return <div className="loading">Loading products...</div>;
//   }

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1 className="page-title-main">Products Management</h1>
//         <div className="filter-controls">
//           <button
//             className="btn btn-primary"
//             onClick={() => {
//               setEditingProduct(null);
//               setFormData({
//                 name: "",
//                 description: "",
//                 price: "",
//                 salePrice: "",
//                 stock: "",
//                 ingredients: "",
//                 benefits: "",
//                 image: null,
//               });
//               setShowModal(true);
//             }}
//           >
//             <Plus size={16} />
//             Add Product
//           </button>
//           <button className="btn btn-secondary" onClick={loadProducts}>
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
//             placeholder="Search products..."
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
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           style={{
//             padding: "8px 12px",
//             background: "var(--input-bg)",
//             border: "1px solid var(--border-color)",
//             borderRadius: "6px",
//             color: "var(--text-white)",
//           }}
//         >
//           <option value="">All Status</option>
//           {statuses.map((status) => (
//             <option key={status} value={status}>
//               {status}
//             </option>
//           ))}
//         </select>
//       </div>
//       {/* Stats */}
//       <div className="stats-grid" style={{ marginTop: "30px" }}>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{products.length}</h3>
//             <p>Total Products</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{products.filter((p) => p.status === "In Stock").length}</h3>
//             <p>In Stock</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>{products.filter((p) => p.status === "Low Stock").length}</h3>
//             <p>Low Stock</p>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-content">
//             <h3>
//               {formatCurrency(
//                 products.reduce((total, p) => total + p.price, 0)
//               )}
//             </h3>
//             <p>Total Value</p>
//           </div>
//         </div>
//       </div>
//       {/* Products Grid */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//           gap: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         {currentProducts.map((product) => (
//           <div key={product._id} className="chart-card">
//             <div style={{ position: "relative", marginBottom: "15px" }}>
//               {product.imageUrl ? (
//                 <img
//                   src={product.imageUrl}
//                   alt={product.name}
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
//                   <Package size={48} color="var(--text-gray)" />
//                 </div>
//               )}
//               <div style={{ position: "absolute", top: "10px", right: "10px" }}>
//                 <span
//                   className={`flag-badge ${getStatusColor(product.status)}`}
//                 >
//                   {product.status}
//                 </span>
//               </div>
//             </div>

//             <h3
//               style={{
//                 color: "var(--primary-gold)",
//                 marginBottom: "8px",
//                 fontSize: "1.1rem",
//               }}
//             >
//               {product.name}
//             </h3>

//             <p
//               style={{
//                 color: "var(--text-gray)",
//                 marginBottom: "10px",
//                 fontSize: "0.9rem",
//                 minHeight: "40px",
//               }}
//             >
//               {product.description || "No description available"}
//             </p>

//             <div style={{ marginBottom: "15px" }}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                   marginBottom: "8px",
//                 }}
//               >
//                 <span
//                   style={{
//                     color: "var(--text-white)",
//                     fontSize: "1.2rem",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {formatCurrency(product.price)}
//                 </span>
//                 {product.salePrice && (
//                   <span
//                     style={{
//                       color: "var(--text-gray)",
//                       fontSize: "1rem",
//                       textDecoration: "line-through",
//                     }}
//                   >
//                     {formatCurrency(product.salePrice)}
//                   </span>
//                 )}
//               </div>
//               <div style={{ color: "var(--text-gray)", fontSize: "0.8rem" }}>
//                 Stock: {product.stock} units
//               </div>
//             </div>

//             <div style={{ display: "flex", gap: "8px" }}>
//               <button
//                 className="action-btn btn-edit"
//                 onClick={() => handleEdit(product)}
//               >
//                 <Edit size={14} />
//               </button>
//               <button
//                 className="action-btn btn-delete"
//                 onClick={() => handleDelete(product._id)}
//               >
//                 <Trash2 size={14} />
//               </button>
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
//               {editingProduct ? "Edit Product" : "Add New Product"}
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
//                   <label>Product Name *</label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
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
//                   <label>Price *</label>
//                   <input
//                     type="number"
//                     value={formData.price}
//                     onChange={(e) =>
//                       setFormData({ ...formData, price: e.target.value })
//                     }
//                     required
//                     min="0"
//                     step="0.01"
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
//                   <label>Sale Price</label>
//                   <input
//                     type="number"
//                     value={formData.salePrice}
//                     onChange={(e) =>
//                       setFormData({ ...formData, salePrice: e.target.value })
//                     }
//                     min="0"
//                     step="0.01"
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
//                   <label>Stock *</label>
//                   <input
//                     type="number"
//                     value={formData.stock}
//                     onChange={(e) =>
//                       setFormData({ ...formData, stock: e.target.value })
//                     }
//                     required
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
//                 <label>Ingredients (comma separated)</label>
//                 <textarea
//                   value={formData.ingredients}
//                   onChange={(e) =>
//                     setFormData({ ...formData, ingredients: e.target.value })
//                   }
//                   rows={2}
//                   placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
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
//                 <label>Benefits (comma separated)</label>
//                 <textarea
//                   value={formData.benefits}
//                   onChange={(e) =>
//                     setFormData({ ...formData, benefits: e.target.value })
//                   }
//                   rows={2}
//                   placeholder="Benefit 1, Benefit 2, Benefit 3"
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
//                 <label>Product Image {!editingProduct && "*"}</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setFormData({ ...formData, image: e.target.files[0] })
//                   }
//                   required={!editingProduct}
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
//                   {editingProduct ? "Update" : "Create"} Product
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Products;
