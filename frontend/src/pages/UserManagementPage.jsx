import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";
import Layout from "../component/Layout";
import { ChevronDown, Search, Plus, Edit2, Trash2, X, Loader, Users, Shield, UserCircle } from "lucide-react";

const UserManagementPage = () => {
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "MANAGER",
    enterpriseId: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [currentUserEnterprise, setCurrentUserEnterprise] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchCurrentUserInfo();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter]);

  const fetchCurrentUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInUsesInfo();
      if (response.status === 200) {
        const enterpriseId = response.user.enterpriseId;
        setCurrentUserEnterprise(enterpriseId);

        setFormData(prev => ({
          ...prev,
          enterpriseId: enterpriseId
        }));

        fetchUsers(enterpriseId);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading user info",
        "error"
      );
    }
  };

  const fetchUsers = async (enterpriseId) => {
    setIsLoading(true);
    try {
      const response = await ApiService.getUsersByEnterprise(enterpriseId);
      if (response.status === 200) {
        setUsers(response.users || []);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading users",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.phoneNumber.includes(search)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formData.enterpriseId) {
      showMessage("Enterprise ID is missing. Please reload the page.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.createManager({
        ...formData,
        role: "MANAGER"
      });

      showMessage(response.message || "Manager created successfully", "success");
      setShowCreateModal(false);
      resetForm();
      if (currentUserEnterprise) {
        fetchUsers(currentUserEnterprise);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error creating manager",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await ApiService.updateUser(selectedUser.id, updateData);
      showMessage(response.message || "User updated successfully", "success");
      setShowEditModal(false);
      resetForm();
      if (currentUserEnterprise) {
        fetchUsers(currentUserEnterprise);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error updating user",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        const response = await ApiService.deleteUser(userId);
        showMessage(response.message || "User deleted successfully", "success");
        if (currentUserEnterprise) {
          fetchUsers(currentUserEnterprise);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error deleting user",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = async (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: "",
      role: user.role,
      enterpriseId: user.enterpriseId
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "MANAGER",
      enterpriseId: currentUserEnterprise
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-gradient-to-r from-pink-500 to-yellow-400 text-white";
      case "ADMIN":
        return "bg-gradient-to-r from-pink-400 to-red-500 text-white";
      case "MANAGER":
        return "bg-gradient-to-r from-teal-500 to-cyan-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const adminCount = users.filter(u => u.role === "ADMIN").length;
  const managerCount = users.filter(u => u.role === "MANAGER").length;

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600 text-sm">Manage your team members and their roles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              <Plus size={20} /> Create Manager
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
                <p className="text-gray-600 text-sm">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-md">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
                <p className="text-gray-600 text-sm">Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                <UserCircle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{managerCount}</h3>
                <p className="text-gray-600 text-sm">Managers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:flex-none">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white cursor-pointer pr-10"
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <Loader size={40} className="text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Enterprise</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{user.phoneNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{user.enterpriseName}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No users found</h2>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your filters"
                : "Start by creating your first manager"}
            </p>
          </div>
        )}
      </div>

      {/* Create Manager Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Manager</h2>
              <button onClick={closeModal} className="text-white-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateManager} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.name && <span className="text-red-600 text-sm mt-1 block">{formErrors.name}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.email && <span className="text-red-600 text-sm mt-1 block">{formErrors.email}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.phoneNumber && <span className="text-red-600 text-sm mt-1 block">{formErrors.phoneNumber}</span>}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
                This user will be created as <span className="font-semibold">Manager</span>.
              </div>


              <div className="flex gap-3 pt-4 items-center">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 !h-12 px-4 rounded-lg font-semibold
                bg-red-500 text-white
                hover:bg-red-600
                transition-colors
                flex items-center justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="!w-auto flex-1 !h-12 px-4  bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? "Creating..." : "Create Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button onClick={closeModal} className="text-white-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.name && <span className="text-red-600 text-sm mt-1 block">{formErrors.name}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.email && <span className="text-red-600 text-sm mt-1 block">{formErrors.email}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                />
                {formErrors.phoneNumber && <span className="text-red-600 text-sm mt-1 block">{formErrors.phoneNumber}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white pr-10"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 items-center">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 !h-12 px-4 rounded-lg font-semibold
                bg-red-500 text-white
                hover:bg-red-600
                transition-colors
                flex items-center justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 px-4 py-3 rounded-lg font-semibold
                            bg-red-500 text-white
                            hover:bg-red-600
                            transition-colors"
                >
                  {isLoading ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagementPage;