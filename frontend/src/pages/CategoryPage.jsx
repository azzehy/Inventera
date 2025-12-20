import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader,
  Folder,
  Search
} from "lucide-react";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [enterpriseId, setEnterpriseId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUserAndCategories();
  }, []);

  const getUserAndCategories = async () => {
    setIsLoading(true);
    try {
      const userInfo = await ApiService.getLoggedInUsesInfo();
      if (userInfo.status === 200) {
        setEnterpriseId(userInfo.user.enterpriseId);
      }

      const response = await ApiService.getMyEnterpriseCategories();
      if (response.status === 200) {
        setCategories(response.categories);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Loading Categories: " + error,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("Category name cannot be empty", "error");
      return;
    }

    if (!enterpriseId) {
      showMessage("Enterprise ID is required. Please log in again.", "error");
      return;
    }

    try {
      await ApiService.createCategory({ 
        name: categoryName,
        enterpriseId: enterpriseId 
      });
      showMessage("Category successfully added", "success");
      setCategoryName("");
      getUserAndCategories();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Adding Category: " + error,
        "error"
      );
    }
  };

  const editCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("Category name cannot be empty", "error");
      return;
    }

    try {
      await ApiService.updateCategory(editingCategoryId, {
        name: categoryName,
        enterpriseId: enterpriseId
      });
      showMessage("Category successfully updated", "success");
      setIsEditing(false);
      setCategoryName("");
      setEditingCategoryId(null);
      getUserAndCategories();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Updating Category: " + error,
        "error"
      );
    }
  };

  const handleEditCategory = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setCategoryName("");
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        showMessage("Category successfully deleted", "success");
        getUserAndCategories();
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Deleting Category: " + error,
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Catégories</h1>
              <p className="text-gray-600 text-sm">Gérez vos catégories de produits</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Category Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isEditing ? "Modifier la catégorie" : "Ajouter une nouvelle catégorie"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={categoryName}
              type="text"
              placeholder="Saisissez le nom de la catégorie"
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (isEditing ? editCategory() : addCategory())}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
            />

            {!isEditing ? (
              <button 
                onClick={addCategory}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                <Plus size={20} />
                Ajouter une catégorie
              </button>
            ) : (
              <>
                <button 
                  onClick={editCategory}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                >
                  <Save size={20} />
                  Mise à jour
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  <X size={20} />
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Section */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Chercher des catégories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Categories List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <Loader size={40} className="text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Chargement des catégories...</p>
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nom de la catégorie</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <Folder size={20} className="text-white" />
                          </div>
                          <span className="text-gray-900 font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 size={16} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                            Supprimer
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
              <Folder size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune catégorie trouvée</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search term" 
                : "Add your first category to get started"}
            </p>
          </div>
        )}

        {/* Stats */}
        {categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Folder size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-sm text-gray-600">Total des catégories</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;