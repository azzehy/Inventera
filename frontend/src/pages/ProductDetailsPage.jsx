import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Package, 
  DollarSign, 
  Hash,
  Layers,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader
} from "lucide-react";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await ApiService.getProductById(productId);
      if (response.status === 200) {
        setProduct(response.product);
      } else {
        showMessage(response.message || "Error loading product", "error");
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading product: " + error.message,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product successfully deleted!", "success");
        setTimeout(() => {
          navigate("/product");
        }, 1500);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error deleting product",
          "error"
        );
      }
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const getStockStatus = () => {
    if (!product) return { label: "", class: "", icon: Package };
    if (product.quantity === 0) return { 
      label: "Out of Stock", 
      class: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      alertClass: "bg-red-50 text-red-800 border-red-200"
    };
    if (product.quantity <= product.stockMinimum) return { 
      label: "Low Stock", 
      class: "bg-amber-100 text-amber-800 border-amber-200",
      icon: AlertTriangle,
      alertClass: "bg-amber-50 text-amber-800 border-amber-200"
    };
    return { 
      label: "In Stock", 
      class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle,
      alertClass: "bg-emerald-50 text-emerald-800 border-emerald-200"
    };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader size={40} className="text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate("/product")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={() => navigate("/product")}
              className="flex items-center gap-2 text-white hover:text-white font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/edit-product/${productId}`)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <img
                src={product.imageUrl || "/placeholder-product.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${stockStatus.class}`}>
                <StockIcon size={16} />
                {stockStatus.label}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{product.name}</h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Hash size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">SKU</p>
                  <p className="text-gray-900 font-semibold">{product.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Price</p>
                  <p className="text-2xl text-emerald-600 font-bold">${product.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-gray-500" />
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Quantity</p>
                  </div>
                  <p className="text-xl text-gray-900 font-bold">{product.quantity}</p>
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-gray-500" />
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Min Stock</p>
                  </div>
                  <p className="text-xl text-gray-900 font-bold">{product.stockMinimum}</p>
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>
              </div>

              {product.categoryName && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Layers size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Category</p>
                    <p className="text-gray-900 font-semibold">{product.categoryName}</p>
                  </div>
                </div>
              )}

              {product.enterpriseName && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Enterprise</p>
                    <p className="text-gray-900 font-semibold">{product.enterpriseName}</p>
                  </div>
                </div>
              )}

              {product.createdAt && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Created At</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(product.createdAt).toLocaleDateString()} at{" "}
                      {new Date(product.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Alert */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${stockStatus.alertClass}`}>
              <StockIcon size={24} className="flex-shrink-0" />
              <div>
                <p className="font-semibold">
                  {product.quantity === 0 
                    ? "This product is out of stock!"
                    : product.quantity <= product.stockMinimum
                    ? `Low stock alert! Only ${product.quantity} units remaining.`
                    : "Product is well stocked."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;