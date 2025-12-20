import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",
    stockMinimum: "0",
    categoryId: "",
    enterpriseId: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch user info to get enterpriseId
        const userInfo = await ApiService.getLoggedInUsesInfo();
        if (userInfo.status === 200) {
          setFormData(prev => ({
            ...prev,
            enterpriseId: userInfo.user.enterpriseId
          }));
        }

        // ✅ FIX: Use getMyEnterpriseCategories instead of getAllCategory
        const categoriesData = await ApiService.getMyEnterpriseCategories();
        if (categoriesData.status === 200) {
          setCategories(categoriesData.categories || []);
        }

        // If editing, fetch product data
        if (productId) {
          setIsEditing(true);
          const productData = await ApiService.getProductById(productId);
          if (productData.status === 200) {
            const product = productData.product;
            setFormData({
              name: product.name || "",
              sku: product.sku || "",
              price: product.price || "",
              quantity: product.quantity || "",
              stockMinimum: product.stockMinimum || "0",
              categoryId: product.categoryId || "",
              enterpriseId: product.enterpriseId || "",
              description: product.description || "",
            });
            setImagePreview(product.imageUrl || "");
          } else {
            showMessage(productData.message || "Error loading product");
          }
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error loading data: " + error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [productId]);



  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      showMessage("Product name is required");
      return false;
    }
    if (!formData.sku.trim()) {
      showMessage("SKU is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      showMessage("Please enter a valid price");
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      showMessage("Please enter a valid quantity");
      return false;
    }
    if (!formData.categoryId) {
      showMessage("Please select a category");
      return false;
    }
    if (!formData.enterpriseId) {
      showMessage("Enterprise ID is missing. Please log in again.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = new FormData();
    submitData.append("name", formData.name.trim());
    submitData.append("sku", formData.sku.trim());
    submitData.append("price", formData.price);
    submitData.append("quantity", formData.quantity);
    submitData.append("categoryId", formData.categoryId);
    submitData.append("enterpriseId", formData.enterpriseId);
    submitData.append("description", formData.description.trim());
    submitData.append("stockMinimum", formData.stockMinimum || "0");
    
    
    if (imageFile) {
      submitData.append("imageFile", imageFile);
    }

    try {
      let response;
      if (isEditing) {
        response = await ApiService.updateProduct(productId, submitData);
        showMessage("Product successfully updated! 🎉");
      } else {
        response = await ApiService.addProduct(submitData);
        showMessage("Product successfully added! 🤩");
      }
      
      // Navigate after short delay to show message
      setTimeout(() => {
        navigate("/product");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Error saving product";
      showMessage(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/product");
  };

  if (isLoading && !formData.enterpriseId) {
    return (
      <Layout>
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {message && <div className="message">{message}</div>}

      <div className="product-form-page">
        <h1>{isEditing ? "Edit Product" : "Add Product"}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sku">SKU *</label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Enter SKU code"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                required
                min="0"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stockMinimum">Stock Minimum</label>
              <input
                id="stockMinimum"
                name="stockMinimum"
                type="number"
                value={formData.stockMinimum}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
              min="0"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="4"
              disabled={isLoading}
            />
          </div>



          <div className="form-group">
            <label htmlFor="imageFile">Product Image</label>
            <input
              id="imageFile"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              disabled={isLoading}
            />
            <small>Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF, WEBP</small>
            
            {imagePreview && (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="image-preview" 
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading 
                ? "Processing..." 
                : isEditing 
                  ? "Update Product" 
                  : "Add Product"
              }
            </button>
            
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;