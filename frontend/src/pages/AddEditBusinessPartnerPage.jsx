  import React, { useEffect, useState } from "react";
  import Layout from "../component/Layout";
  import ApiService from "../service/ApiService";
  import { useNavigate, useParams } from "react-router-dom";
  import "../styles/CreateTransaction.css";


  const AddEditBusinessPartnerPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" ou "error"

    const [formData, setFormData] = useState({
      name: "",
      numero: "",
      address: "",
      email: "",
      type: "",
      enterpriseId: null,
    });

    useEffect(() => {
      fetchUserEnterprise();
      if (id) fetchPartner();
      else resetForm();
    }, [id]);

    const fetchUserEnterprise = async () => {
      try {
        const profile = await ApiService.getUserProfile();
        if (profile.status === 200) {
          setFormData(prev => ({
            ...prev,
            enterpriseId: profile.user.enterpriseId,
          }));
        }
      } catch (error) {
        console.error("Erreur fetchUserEnterprise:", error);
        setMessage("Impossible de récupérer le profil utilisateur");
        setMessageType("error");
      }
    };


  const fetchPartner = async () => { 
    try { 
      const response = await ApiService.getBusinessPartnerById(id); 
      if (response.status === 200) { 
        console.log("partner from backendddd:", response.businessPartner); 
        setFormData(response.businessPartner); } 
      } catch { setMessage("Erreur lors du chargement du partenaire"); } 
    };


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
      setFormData(prev => ({
        name: "",
        numero: "",
        address: "",
        email: "",
        type: "",
        enterpriseId: prev.enterpriseId,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      const payload = {
        ...formData,
        type: formData.type === "CUSTOMER" ? "CLIENT" : formData.type,
      };

      if (!["CLIENT", "SUPPLIER"].includes(payload.type)) {
        setMessage("Type de partenaire invalide");
        setMessageType("error");
        setLoading(false);
        return;
      }

      try {
        const response = id
          ? await ApiService.updateBusinessPartner(id, payload)
          : await ApiService.addBusinessPartner(payload);

        if (response.status === 200) {
          setMessage(response.message || "Partenaire enregistré avec succès !");
          setMessageType("success");

          if (!id) resetForm();

          setTimeout(() => navigate("/partners"), 1500);
        }
      } catch (error) {
        console.error("Erreur handleSubmit:", error);
        const errorMsg =
          error.response?.data?.message || "Erreur lors de l'enregistrement";
        setMessage(errorMsg);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

return (
  <Layout>
    <div className="create-transaction-page">

      {/* HEADER */}
      <div className="page-header">
        <h1>{id ? "Modifier un partenaire" : "Ajouter un partenaire"}</h1>
        <button
          className="btn-back"
          onClick={() => navigate("/partners")}
        >
          ← Retour
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`message ${
            messageType === "success" ? "message-success" : "message-error"
          }`}
        >
          {message}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="transaction-form">

        <div className="form-section">
          <h2>Informations du partenaire</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Nom *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Numéro</label>
              <input
                name="numero"
                value={formData.numero}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="SUPPLIER">Fournisseur</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Adresse</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/partners")}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Valider"}
          </button>
        </div>

      </form>
    </div>
  </Layout>
);


  };

  export default AddEditBusinessPartnerPage;
