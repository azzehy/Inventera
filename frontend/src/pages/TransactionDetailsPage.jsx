import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import "../styles/TransactionDetailsPages.css";

const TransactionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchTransactionDetails();
  }, []);

  const fetchTransactionDetails = async () => {
    try {
      const response = await ApiService.getTransactionById(id);

      if (response.status === 200) {
        setTransaction(response.transaction);
        setNewStatus(response.transaction.status);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Erreur lors du chargement de la transaction"
      );
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === transaction.status) return;

    setLoading(true);
    try {
      const response = await ApiService.updateTransactionStatus(id, newStatus);

      if (response.status === 200) {
        setMessage("Status mis à jour avec succès");

        // Recharger la transaction depuis le backend
        await fetchTransactionDetails();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Erreur lors de la mise à jour du status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function for status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: "#fef3c7", color: "#92400e", text: "En attente" },
      PROCESSING: { bg: "#dbeafe", color: "#1e40af", text: "En cours" },
      COMPLETED: { bg: "#d1fae5", color: "#065f46", text: "Terminé" },
      CANCELLED: { bg: "#fee2e2", color: "#991b1b", text: "Annulé" }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        {config.text}
      </span>
    );
  };

  // Helper function for transaction type badge
  const getTransactionTypeBadge = (type) => {
    const typeConfig = {
      PURCHASE: { icon: "🛒", text: "Achat", color: "#059669" },
      SALE: { icon: "💰", text: "Vente", color: "#2563eb" },
      RETURN_TO_SUPPLIER: { icon: "↩️", text: "Retour", color: "#dc2626" }
    };

    const config = typeConfig[type] || typeConfig.PURCHASE;
    
    return (
      <span style={{ color: config.color, fontWeight: "600" }}>
        {config.icon} {config.text}
      </span>
    );
  };

  if (!transaction) {
    return (
      <Layout>
        <div className="transaction-details-page">
          <p>Chargement des détails de la transaction...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transaction-details-page">

        <button onClick={() => navigate("/transactions")}>
          ← Retour aux transactions
        </button>

        <h1>Détails Transaction #{transaction.id}</h1>

        {message && <p className="message">{message}</p>}

        {/* Infos générales */}
        <div className="details-card">
          <p>
            <strong>Type :</strong> 
            {getTransactionTypeBadge(transaction.transactionType)}
          </p>
          <p>
            <strong>Status :</strong> 
            {getStatusBadge(transaction.status)}
          </p>
          <p>
            <strong>Partenaire :</strong> 
            <span>{transaction.partnerName || "Aucun partenaire"}</span>
          </p>
          <p>
            <strong>Description :</strong> 
            <span>{transaction.description || "N/A"}</span>
          </p>
          <p>
            <strong>Note :</strong> 
            <span>{transaction.note || "N/A"}</span>
          </p>
          <p>
            <strong>Total :</strong> 
            <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "#059669" }}>
              {transaction.totalPrice?.toFixed(2)} DH
            </span>
          </p>
          <p>
            <strong>Date de création :</strong> 
            <span>{new Date(transaction.createdAt).toLocaleString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}</span>
          </p>
        </div>

        {/* Modifier status */}
        <div className="status-update">
          <h3>Modifier le statut</h3>

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="PENDING">En attente (PENDING)</option>
            <option value="PROCESSING">En cours (PROCESSING)</option>
            <option value="COMPLETED">Terminé (COMPLETED)</option>
            <option value="CANCELLED">Annulé (CANCELLED)</option>
          </select>

          <button
            onClick={handleUpdateStatus}
            disabled={loading || newStatus === transaction.status}
          >
            {loading ? "Mise à jour en cours..." : "Mettre à jour le statut"}
          </button>
        </div>

        {/* Lignes de transaction */}
        <h2>Lignes de Transaction ({transaction.details?.length || 0})</h2>

        <table className="transaction-lines-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>SKU</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transaction.details?.map((line) => (
              <tr key={line.id}>
                <td data-label="Produit">{line.productName}</td>
                <td data-label="SKU">{line.productSku}</td>
                <td data-label="Quantité">{line.quantity}</td>
                <td data-label="Prix Unitaire">{line.unitPrice.toFixed(2)} DH</td>
                <td data-label="Total">{line.lineTotal.toFixed(2)} DH</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;