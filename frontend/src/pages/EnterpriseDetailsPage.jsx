import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  Layers,
  UserCheck
} from "lucide-react";
import ApiService from "../service/ApiService";
import Layout from "../component/Layout";

const EnterpriseDetailsPage = () => {
  const { enterpriseId } = useParams();
  const navigate = useNavigate();

  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const role = ApiService.getRole();
    if (role !== "SUPER_ADMIN") {
      navigate("/login");
      return;
    }
    fetchEnterpriseDetails();
  }, [enterpriseId]);

  const fetchEnterpriseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getEnterpriseStats(enterpriseId);
      setEnterprise(data.enterprise);
    } catch (err) {
      console.error(err);
    setError("Erreur lors du chargement des données"); // Message d'erreur plus générique
    setEnterprise(null); 
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="enterprise-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="enterprise-details-container">
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h2>Entreprise non trouvée</h2>
          <p>L'entreprise demandée n'existe pas ou a été supprimée</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
    <div className="enterprise-details-container">
      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          {/* <button
            className="btn-back"
            onClick={() => navigate("/super-admin/dashboard")}
          >
            <ArrowLeft size={18} />
            Retour au Dashboard
          </button> */}
        
          <h1>{enterprise.name}</h1>
          <p className="subtitle">
            Statistiques et informations détaillées de l'entreprise
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchEnterpriseDetails}>
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Company Info Card */}
      <div className="info-card">
        <h2>Informations de l'entreprise</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon email">
              <Users size={24} />
            </div>
            <div className="info-details">
              <p className="info-label">Email</p>
              <p className="info-value">{enterprise.email}</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon address">
              <Building2 size={24} />
            </div>
            <div className="info-details">
              <p className="info-label">Adresse</p>
              <p className="info-value">{enterprise.address || "-"}</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon date">
              <TrendingUp size={24} />
            </div>
            <div className="info-details">
              <p className="info-label">Date de création</p>
              <p className="info-value">
                {new Date(enterprise.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon users">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{enterprise.totalUsers || 0}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">
            <Package size={28} />
          </div>
          <div className="stat-info">
            <h3>{enterprise.totalProducts || 0}</h3>
            <p>Produits</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">
            <Layers size={28} />
          </div>
          <div className="stat-info">
            <h3>{enterprise.totalCategories || 0}</h3>
            <p>Catégories</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon transactions">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h3>{enterprise.totalTransactions || 0}</h3>
            <p>Transactions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon partners">
            <UserCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>{enterprise.totalPartners || 0}</h3>
            <p>Partenaires</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon id">
            <Building2 size={28} />
          </div>
          <div className="stat-info">
            <h3>#{enterprise.id}</h3>
            <p>ID Entreprise</p>
          </div>
        </div>
      </div>

      {/* Activity & Overview Cards */}
      <div className="details-grid">
        <div className="detail-card">
          <h2>📊 Indicateurs d'activité</h2>
          <div className="metric-list">
            <div className="metric-item">
              <p className="metric-label">Utilisateurs par produit</p>
              <h3 className="metric-value">
                {enterprise.totalProducts
                  ? (enterprise.totalUsers / enterprise.totalProducts).toFixed(2)
                  : "0"}
              </h3>
            </div>

            <div className="metric-item">
              <p className="metric-label">Transactions par utilisateur</p>
              <h3 className="metric-value">
                {enterprise.totalUsers
                  ? (enterprise.totalTransactions / enterprise.totalUsers).toFixed(2)
                  : "0"}
              </h3>
            </div>

            <div className="metric-item">
              <p className="metric-label">Produits par catégorie</p>
              <h3 className="metric-value">
                {enterprise.totalCategories
                  ? (enterprise.totalProducts / enterprise.totalCategories).toFixed(2)
                  : "0"}
              </h3>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h2>⚡ Aperçu rapide</h2>
          <div className="metric-list">
            <div className="metric-item">
              <p className="metric-label">Équipe</p>
              <h3 className="metric-value">{enterprise.totalUsers} membres</h3>
            </div>

            <div className="metric-item">
              <p className="metric-label">Inventaire</p>
              <h3 className="metric-value">{enterprise.totalProducts} articles</h3>
            </div>

            <div className="metric-item">
              <p className="metric-label">Activité commerciale</p>
              <h3 className="metric-value">{enterprise.totalTransactions} opérations</h3>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .enterprise-details-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }

        /* Message */
        .message {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          font-weight: 500;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

/* Centre le bloc titre */
.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Titre */
.header-content h1 {
  margin: 0;
  font-size: 32px;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
}

/* Sous-titre */
.subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #7f8c8d;
  text-align: center;
}




    
        .btn-back {
          background: white;
          color: #667eea;
          padding: 10px 18px;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-bottom: 10px;
        }

        .btn-back:hover {
          background: #667eea;
          color: white;
          transform: translateX(-4px);
        }

        .btn-refresh {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-refresh:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Info Card */
        .info-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .info-card h2 {
          font-size: 20px;
          color: #2c3e50;
          margin: 0 0 20px 0;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .info-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .info-icon.email {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .info-icon.address {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .info-icon.date {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .info-details {
          flex: 1;
        }

        .info-label {
          margin: 0;
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .info-value {
          margin: 5px 0 0 0;
          font-size: 16px;
          color: #2c3e50;
          font-weight: 600;
        }

        /* Stats Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
        }

        .stat-icon.users {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.products {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-icon.categories {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .stat-icon.transactions {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        .stat-icon.partners {
          background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
        }

        .stat-icon.id {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        }

        .stat-info h3 {
          margin: 0;
          font-size: 28px;
          color: #2c3e50;
          font-weight: 700;
        }

        .stat-info p {
          margin: 5px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .detail-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .detail-card h2 {
          font-size: 20px;
          color: #2c3e50;
          margin: 0 0 20px 0;
          font-weight: 600;
        }

        .metric-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .metric-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          transition: all 0.3s ease;
        }

        .metric-item:hover {
          background: #e9ecef;
          transform: translateX(4px);
        }

        .metric-label {
          margin: 0;
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 500;
        }

        .metric-value {
          margin: 8px 0 0 0;
          font-size: 24px;
          color: #2c3e50;
          font-weight: 700;
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-container p {
          color: #7f8c8d;
          font-size: 16px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h2 {
          font-size: 24px;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .empty-state p {
          color: #7f8c8d;
          font-size: 16px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 15px;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>

    </Layout>
  );
};

export default EnterpriseDetailsPage;