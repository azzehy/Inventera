import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import { Users, Package, Folder, Handshake, ArrowRight, Edit2, Save, X, Loader, Building2 } from "lucide-react";

const MyEnterprisePage = () => {
  const navigate = useNavigate();
  
  const [enterprise, setEnterprise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: ""
  });

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const fetchEnterpriseData = async () => {
    setIsLoading(true);
    try {
      const enterpriseRes = await ApiService.getMyEnterpriseStats();
      
      if (enterpriseRes.status === 200) {
        setEnterprise(enterpriseRes.enterprise);
        setFormData({
          name: enterpriseRes.enterprise.name || "",
          address: enterpriseRes.enterprise.address || "",
          email: enterpriseRes.enterprise.email || ""
        });
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading enterprise data",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEnterprise = async () => {
    if (!formData.name || !formData.email) {
      showMessage("Name and email are required!", "error");
      return;
    }

    try {
      const response = await ApiService.updateEnterprise(enterprise.id, formData);
      if (response.status === 200) {
        showMessage("Enterprise updated successfully!", "success");
        setIsEditing(false);
        fetchEnterpriseData();
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error updating enterprise",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader size={48} className="text-teal-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading enterprise data...</p>
        </div>
      </Layout>
    );
  }

  if (!enterprise) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Unable to load enterprise data</h2>
          <button 
            onClick={fetchEnterpriseData}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      icon: <Users size={28} />,
      value: enterprise.totalUsers || 0,
      label: "Total Users",
      gradient: "from-purple-500 to-pink-500",
      path: "/UserManagementPage"
    },
    {
      icon: <Package size={28} />,
      value: enterprise.totalProducts || 0,
      label: "Products",
      gradient: "from-teal-500 to-emerald-500",
      path: "/product"
    },
    {
      icon: <Folder size={28} />,
      value: enterprise.totalCategories || 0,
      label: "Categories",
      gradient: "from-orange-500 to-red-500",
      path: "/category"
    },
    {
      icon: <Handshake size={28} />,
      value: enterprise.totalPartners || 0,
      label: "Suppliers",
      gradient: "from-blue-500 to-cyan-500",
      path: "/supplier"
    }
  ];

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
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{enterprise.name}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📅 Created: {formatDate(enterprise.createdAt)}</span>
                  {enterprise.address && (
                    <>
                      <span>•</span>
                      <span>📍 {enterprise.address}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              {isEditing ? (
                <>
                  <X size={20} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 size={20} />
                  Edit Enterprise
                </>
              )}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Enterprise Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enterprise Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter enterprise name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleUpdateEnterprise}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all"
                >
                  <Save size={20} />
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: enterprise.name || "",
                      address: enterprise.address || "",
                      email: enterprise.email || ""
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={() => navigate(stat.path)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Additional Info Card */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                Welcome to your enterprise dashboard. Here you can manage all aspects of your business including users, products, categories, and suppliers. Click on any card above to navigate to the respective management page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyEnterprisePage;