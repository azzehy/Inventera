import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
  Loader,
  Lock,
  CheckCircle
} from "lucide-react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInUsesInfo();
      if (response.status === 200 && response.user) {
        setUser(response.user);
        setFormData({
          name: response.user.name || "",
          email: response.user.email || "",
          phoneNumber: response.user.phoneNumber || "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading profile",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        enterpriseId: user.enterpriseId,
        password: formData.password
      };

      await ApiService.updateUser(user.id, updateData);
      showMessage("Profile updated successfully!", "success");
      setIsEditing(false);
      
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));

      await fetchUserInfo();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    }
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader size={40} className="text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </Layout>
    );
  }

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
        {user ? (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.name}
                    </h1>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeClass(user.role)}`}>
                      <Shield size={16} />
                      {user.role?.replace("_", " ")}
                    </span>
                  </div>
                </div>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                  >
                    <Edit2 size={18} />
                    Modifier le profil
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            {!isEditing ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de profil</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <Mail size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</p>
                      <p className="text-gray-900 font-semibold break-all">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Phone size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Numéro de téléphone</p>
                      <p className="text-gray-900 font-semibold">{user.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <User size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Nom et prénom</p>
                      <p className="text-gray-900 font-semibold">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Building2 size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Entreprise</p>
                      <p className="text-gray-900 font-semibold">
                        {user.enterpriseName || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Shield size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Rôle</p>
                      <p className="text-gray-900 font-semibold">
                        {user.role?.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Calendar size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Membre depuis</p>
                      <p className="text-gray-900 font-semibold">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le profil</h2>
                
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Enter your full name"
                      required
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock size={20} />
                      Changer le mot de passe (Facultatif)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                          placeholder="Saisissez le nouveau mot de passe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                          placeholder="Confirmer le nouveau mot de passe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <Save size={20} />
                      Enregistrer 
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          phoneNumber: user.phoneNumber || "",
                          password: "",
                          confirmPassword: ""
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <X size={20} />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load profile</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;