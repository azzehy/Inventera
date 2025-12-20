  import React, { useState, useEffect } from "react";
  import Layout from "../component/Layout";
  import ApiService from "../service/ApiService";
  import { useNavigate } from "react-router-dom";
  import '../styles/CreateTransaction.css';

  const CreateTransactionPage = () => {
    const navigate = useNavigate();
    
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    
    // Form data
    const [formData, setFormData] = useState({
      transactionType: "PURCHASE",
      enterpriseId: null,
      partnerId: "",
      description: "",
      note: "",
      items: []
    });

    // Product selection
    const [products, setProducts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState("");

    // Loading state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetchInitialData();
    }, []);

    // Fetch products and partners
    const fetchInitialData = async () => {
      try {
        const [productsRes, partnersRes, userProfile] = await Promise.all([
          ApiService.getMyEntrepriseProducts(),
          ApiService.getMyEntreprisePartners(),
          ApiService.getUserProfile()
        ]);
            console.log("Partners:", partnersRes);  // Ajouter ce log pour vérifier les données


        if (productsRes.status === 200) {
          setProducts(productsRes.products || []);
        }

        if (partnersRes.status === 200) {
          setPartners(partnersRes.businessPartners || []);
        }

        if (userProfile.status === 200) {
          setFormData(prev => ({
            ...prev,
            enterpriseId: userProfile.user.enterpriseId
          }));
        }
      } catch (error) {
        showMessage("Erreur lors du chargement des données", "error");
      }
    };

    const showMessage = (msg, type = "error") => {
      setMessage(msg);
      setMessageType(type);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    };

    // Add transaction line
    const addTransactionLine = () => {
      if (!selectedProduct) {
        showMessage("Veuillez sélectionner un produit", "error");
        return;
      }

      if (quantity <= 0) {
        showMessage("La quantité doit être supérieure à 0", "error");
        return;
      }

      const product = products.find(p => p.id === parseInt(selectedProduct));
      
      if (!product) {
        showMessage("Produit non trouvé", "error");
        return;
      }

      // Check if product already exists in items
      const existingItemIndex = formData.items.findIndex(
        item => item.productId === product.id
      );

      if (existingItemIndex !== -1) {
        showMessage("Ce produit est déjà dans la liste", "error");
        return;
      }

      const price = unitPrice ? parseFloat(unitPrice) : product.price;

      const newLine = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: parseInt(quantity),
        unitPrice: price,
        lineTotal: price * parseInt(quantity)
      };

      setFormData({
        ...formData,
        items: [...formData.items, newLine]
      });

      // Reset fields
      setSelectedProduct("");
      setQuantity(1);
      setUnitPrice("");
      showMessage("Ligne ajoutée avec succès", "success");
    };

    // Remove transaction line
    const removeTransactionLine = (index) => {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
      showMessage("Ligne supprimée", "success");
    };

    // Calculate totals
    const calculateTotals = () => {
      const totalQuantity = formData.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = formData.items.reduce((sum, item) => sum + item.lineTotal, 0);
      return { totalQuantity, totalPrice };
    };

    // Submit transaction
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.items.length === 0) {
        showMessage("Veuillez ajouter au moins un produit", "error");
        return;
      }

      setLoading(true);

      try {
        const requestData = {
          transactionType: formData.transactionType,
          enterpriseId: formData.enterpriseId,
          partnerId: formData.partnerId ? parseInt(formData.partnerId) : null,
          description: formData.description,
          note: formData.note,
          items: formData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        };

        let response;
        

        response = await ApiService.createTransaction(requestData);
        

        if (response.status === 200) {
          showMessage("Transaction créée avec succès !", "success");
          setTimeout(() => {
            navigate("/transactions");
          }, 1500);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Erreur lors de la création de la transaction",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    // Handle product selection change
    const handleProductChange = (e) => {
      const productId = e.target.value;
      setSelectedProduct(productId);
      
      if (productId) {
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
          setUnitPrice(product.price);
        }
      } else {
        setUnitPrice("");
      }
    };

    const { totalQuantity, totalPrice } = calculateTotals();

    return (
      <Layout>
        <div className="create-transaction-page">
          <div className="page-header">
            <h1>Créer une Nouvelle Transaction</h1>
            <button className="btn-back" onClick={() => navigate("/transactions")}>
              ← Retour
            </button>
          </div>

          {message && (
            <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="transaction-form">
            {/* General Information */}
            <div className="form-section">
              <h2>Informations Générales</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Type de Transaction *</label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                    required
                  >
                    <option value="PURCHASE">Achat (PURCHASE)</option>
                    <option value="SALE">Vente (SALE)</option>
                    <option value="RETURN_TO_SUPPLIER">Retour Fournisseur (RETURN)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Partenaire</label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                  >
                    <option value="">Aucun partenaire</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name} - {partner.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la transaction"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Note</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Notes additionnelles"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Add Product Lines */}
            <div className="form-section">
              <h2>Ajouter des Produits</h2>
              <div className="add-product-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Produit *</label>
                    <select
                      value={selectedProduct}
                      onChange={handleProductChange}
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.sku} (Stock: {product.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantité *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      placeholder="Quantité"
                    />
                  </div>

                  <div className="form-group">
                    <label>Prix Unitaire (DH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="Prix unitaire"
                    />
                  </div>

                  <div className="form-group">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn-add-line"
                      onClick={addTransactionLine}
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Lines Table */}
            {formData.items.length > 0 && (
              <div className="form-section">
                <h2>Lignes de Transaction ({formData.items.length})</h2>
                <table className="transaction-lines-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>SKU</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.productSku}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unitPrice.toFixed(2)} DH</td>
                        <td>{item.lineTotal.toFixed(2)} DH</td>
                        <td>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => removeTransactionLine(index)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary */}
                <div className="transaction-summary">
                  <div className="summary-item">
                    <span>Total Produits:</span>
                    <strong>{totalQuantity}</strong>
                  </div>
                  <div className="summary-item total-price">
                    <span>Prix Total:</span>
                    <strong>{totalPrice.toFixed(2)} DH</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/transactions")}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || formData.items.length === 0}
              >
                {loading ? "Création en cours..." : "Valider la Transaction"}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    );
  };

  export default CreateTransactionPage;