import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Grid3x3,
  List,
  Filter,
  RotateCcw,
  ChevronDown
} from "lucide-react";

const ProductPage = () => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 12;

  // View mode
  const [viewMode, setViewMode] = useState("grid");

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy, currentPage]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const productData = await ApiService.getMyEnterpriseProducts();
      if (productData.status === 200) {
        setProducts(productData.products || []);
      }

      const categoryData = await ApiService.getMyEnterpriseCategories();
      if (categoryData.status === 200) {
        setCategories(categoryData.categories || []);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading data: " + error.message,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.categoryId === parseInt(selectedCategory)
      );
    }

    if (stockFilter === "low") {
      filtered = filtered.filter((p) => p.quantity <= p.stockMinimum);
    } else if (stockFilter === "available") {
      filtered = filtered.filter((p) => p.quantity > p.stockMinimum);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return parseFloat(b.price) - parseFloat(a.price);
        case "quantity":
          return b.quantity - a.quantity;
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredProducts(filtered.slice(startIndex, endIndex));
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const searchData = await ApiService.searchProduct(searchTerm);
        if (searchData.status === 200) {
          setProducts(searchData.products || []);
          setCurrentPage(1);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error searching products",
          "error"
        );
      }
    } else {
      fetchInitialData();
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product successfully deleted!", "success");
        fetchInitialData();
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error deleting product",
          "error"
        );
      }
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product-details/${productId}`);
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setStockFilter("all");
    setSortBy("name");
    setCurrentPage(1);
    fetchInitialData();
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { label: "Out of Stock", class: "out", icon: XCircle };
    if (product.quantity <= product.stockMinimum) return { label: "Low Stock", class: "low", icon: AlertTriangle };
    return { label: "In Stock", class: "available", icon: CheckCircle };
  };

  const adminCount = products.filter(p => p.quantity > p.stockMinimum).length;
  const lowStockCount = products.filter(p => p.quantity <= p.stockMinimum && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  return (
    <Layout>
      {/* Success/Error Message */}
      {message && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500'
            : 'bg-red-50 text-red-800 border-l-4 border-red-500'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
              <p className="text-gray-600 text-sm">Manage your inventory and products</p>
            </div>
            <button
              onClick={() => navigate("/add-product")}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
                <CheckCircle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
                <p className="text-gray-600 text-sm">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <AlertTriangle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{lowStockCount}</h3>
                <p className="text-gray-600 text-sm">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                <XCircle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{outOfStockCount}</h3>
                <p className="text-gray-600 text-sm">Out of Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 sm:flex-none">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white cursor-pointer pr-10"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white cursor-pointer pr-10"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="available">Available</option>
                  <option value="low">Low Stock</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white cursor-pointer pr-10"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    viewMode === "grid"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-500"
                  }`}
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    viewMode === "list"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-500"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const StockIcon = stockStatus.icon;
              
              return viewMode === "grid" ? (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.imageUrl || "/placeholder-product.png"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      stockStatus.class === "available" ? "bg-emerald-100 text-emerald-800" :
                      stockStatus.class === "low" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      <StockIcon size={14} />
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">SKU: {product.sku}</p>
                    
                    {product.categoryName && (
                      <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium mb-3">
                        {product.categoryName}
                      </span>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-sm font-bold text-emerald-600">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                        <p className="text-sm font-bold text-gray-900">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Min Stock</p>
                        <p className="text-sm font-bold text-gray-900">{product.stockMinimum}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-6">
                    <div className="relative w-40 h-40 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={product.imageUrl || "/placeholder-product.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          stockStatus.class === "available" ? "bg-emerald-100 text-emerald-800" :
                          stockStatus.class === "low" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          <StockIcon size={14} />
                          {stockStatus.label}
                        </span>
                      </div>

                      {product.categoryName && (
                        <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium mb-3">
                          {product.categoryName}
                        </span>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="text-lg font-bold text-emerald-600">${product.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Quantity</p>
                          <p className="text-lg font-bold text-gray-900">{product.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Min Stock</p>
                          <p className="text-lg font-bold text-gray-900">{product.stockMinimum}</p>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(product.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || stockFilter !== "all"
                ? "Try adjusting your filters or search term"
                : "Start by adding your first product"}
            </p>
            <button
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductPage;