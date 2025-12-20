import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, Users, Package, TrendingUp, Trash2, Eye, Plus, Search, X, AlertCircle, RefreshCw } from 'lucide-react';
import ApiService from '../service/ApiService';
import { useNavigate } from "react-router-dom";
import Layout from "../component/Layout";


const SuperAdminDashboard = () => {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

useEffect(() => {
  fetchEnterprises();
}, []);

const fetchEnterprises = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await ApiService.getAllEnterprises();
    const enterpriseList = data.enterprises || [];

    const enterprisesWithStats = await Promise.all(
      enterpriseList.map(async (enterprise) => {
        try {
          const statsData = await ApiService.getEnterpriseStats(enterprise.id);
          return statsData.enterprise;
        } catch (err) {
          return {
            ...enterprise,
            totalUsers: 0,
            totalProducts: 0,
            totalCategories: 0,
            totalPartners: 0,
            totalTransactions: 0
          };
        }
      })
    );

    setEnterprises(enterprisesWithStats);
  } catch (err) {
    setError(err.response?.data?.message || err.message);
    setEnterprises([]);
  } finally {
    setLoading(false);
  }
};


const handleDeleteEnterprise = async () => {
  if (!selectedEnterprise) return;

  try {
    setLoading(true);
    await ApiService.deleteEnterprise(selectedEnterprise.id);
    await fetchEnterprises();
    setShowDeleteModal(false);
    setSelectedEnterprise(null);
    showMessage('Entreprise supprimée avec succès !', 'success');
  } catch (err) {
    console.error(err);
    showMessage(
      err.response?.data?.message || 'Erreur lors de la suppression',
      'error'
    );
  } finally {
    setLoading(false);
  }
};


const handleViewDetails = (enterpriseId) => {
  navigate(`/super-admin/enterprise/${enterpriseId}`);
};


  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Le nom est requis';
    if (!formData.email.trim()) errors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalide';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

 
  const handleCreateEnterprise = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      address: formData.address
    };

    //  APPEL BACKEND
    await ApiService.createEnterprise(payload);

    //  RECHARGER LES DONNÉES DEPUIS LA DB
    await fetchEnterprises();

    //  UI
    setShowCreateModal(false);
    setFormData({ name: '', email: '', address: '' });
    setFormErrors({});
    showMessage('Entreprise créée avec succès !', 'success');

  } catch (err) {
    console.error(err);
    showMessage(
      err.response?.data?.message || 'Erreur lors de la création',
      'error'
    );
  } finally {
    setLoading(false);
  }
};



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setSelectedEnterprise(null);
    setFormData({ name: '', email: '', address: '' });
    setFormErrors({});
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const totalEnterprises = enterprises.length;
  const totalUsers = enterprises.reduce((sum, e) => sum + (e.totalUsers || 0), 0);
  const totalProducts = enterprises.reduce((sum, e) => sum + (e.totalProducts || 0), 0);
  const totalTransactions = enterprises.reduce((sum, e) => sum + (e.totalTransactions || 0), 0);

  const usersPerEnterpriseData = enterprises.map(e => ({
    name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
    users: e.totalUsers || 0
  }));

  const productsPerEnterpriseData = enterprises
    .filter(e => (e.totalProducts || 0) > 0)
    .map(e => ({
      name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
      produits: e.totalProducts || 0
    }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  const filteredEnterprises = enterprises.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && enterprises.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <Layout>
    <div className="dashboard-container">
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Dashboard Super Admin</h1>
          <p className="subtitle">Gestion et supervision des entreprises en temps réel</p>
        </div>
        <div className="header-actions">
         <button className="btn-secondary" onClick={fetchEnterprises}>
  <RefreshCw className="icon" size={16} />
  Actualiser
</button>

         
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <Building2 size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalEnterprises}</h3>
            <p>Total Entreprises</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalUsers}</h3>
            <p>Total Utilisateurs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon manager">
            <Package size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalProducts}</h3>
            <p>Total Produits</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon transactions">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h3>{totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {enterprises.length > 0 && (
        <div className="charts-section">
          <div className="chart-card">
            <h3>Utilisateurs par Entreprise</h3>
            {usersPerEnterpriseData.some(e => e.users > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usersPerEnterpriseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#667eea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Aucune donnée utilisateur disponible</p>
              </div>
            )}
          </div>

          <div className="chart-card">
            <h3>Produits par Entreprise</h3>
            {productsPerEnterpriseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productsPerEnterpriseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.produits}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="produits"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {productsPerEnterpriseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Aucun produit enregistré</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enterprises Table */}
      <div className="table-section">
        <div className="table-header">
          <div className="table-title">
            <Building2 size={24} />
            <h2>Liste des Entreprises</h2>
          </div>
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Nouvelle Entreprise
          </button>
        </div>

        {enterprises.length > 0 && (
          <div className="search-section">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {filteredEnterprises.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Contact</th>
                  <th>Localisation</th>
                  <th>Création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnterprises.map((enterprise) => (
                  <tr key={enterprise.id}>
                    <td>
                      <div className="enterprise-cell">
                        <div className="enterprise-avatar">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="enterprise-name">{enterprise.name}</div>
                          <div className="enterprise-id">ID: #{enterprise.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{enterprise.email}</td>
                    <td>{enterprise.address || '-'}</td>
                    <td>{formatDate(enterprise.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetails(enterprise.id)}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => {
                            setSelectedEnterprise(enterprise);
                            setShowDeleteModal(true);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Building2 size={80} />
            </div>
            <h2>Aucune entreprise trouvée</h2>
            <p>
              {searchTerm
                ? 'Essayez d\'ajuster vos filtres'
                : 'Commencez par créer votre première entreprise'}
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle Entreprise</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleCreateEnterprise}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: TechCorp Solutions"
                />
                {formErrors.name && <span className="error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@entreprise.com"
                />
                {formErrors.email && <span className="error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Casablanca, Maroc"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEnterprise && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="alert-icon">
                <AlertCircle size={60} />
              </div>
              <p>
                Êtes-vous sûr de vouloir supprimer l'entreprise{' '}
                <strong>{selectedEnterprise.name}</strong> ?
                <br />
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>
                Annuler
              </button>
              <button className="btn-submit btn-danger-action" onClick={handleDeleteEnterprise} disabled={loading}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
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

        .message.success {
          background: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
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

        .header-content h1 {
          font-size: 32px;
          color: #2c3e50;
          margin: 0;
          font-weight: 600;
        }

        .subtitle {
          color: #7f8c8d;
          font-size: 14px;
          margin: 5px 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          color: #2c3e50;
        }

        .btn-secondary:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .btn-danger {
          padding: 10px 20px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .icon {
          width: 16px;
          height: 16px;
        }

        /* Stats Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
          color: white;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.admin {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-icon.manager {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-icon.transactions {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

        /* Charts */
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
        }

        .empty-chart {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7f8c8d;
        }

        /* Table Section */
        .table-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .table-header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .table-title h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .btn-create {
          background: white;
          color: #667eea;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Search */
        .search-section {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
        }

        /* Table */
        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead {
          background: #f8f9fa;
        }

        .data-table th {
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2c3e50;
        }

        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 14px;
          color: #2c3e50;
        }

        .data-table tbody tr:hover {
          background: #f8f9fa;
        }

        .enterprise-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .enterprise-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .enterprise-name {
          font-weight: 600;
          color: #2c3e50;
        }

        .enterprise-id {
          font-size: 12px;
          color: #7f8c8d;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-view {
          background: #3498db;
          color: white;
        }

        .btn-view:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }

        .btn-action.btn-delete {
          background: #e74c3c;
          color: white;
        }

        .btn-action.btn-delete:hover {
          background: #c0392b;
          transform: translateY(-2px);
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
        }

        .empty-icon {
          color: #e0e0e0;
          margin-bottom: 20px;
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #2c3e50;
          font-weight: 600;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 32px;
          color: #7f8c8d;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .btn-close:hover {
          color: #2c3e50;
        }

        .modal-body {
          text-align: center;
          margin-bottom: 24px;
        }

        .alert-icon {
          color: #e74c3c;
          margin-bottom: 16px;
        }

        .modal-body p {
          color: #2c3e50;
          font-size: 16px;
          line-height: 1.6;
        }

        .modal-body strong {
          font-weight: 600;
          color: #e74c3c;
        }

        /* Form */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group .error {
          display: block;
          color: #e74c3c;
          font-size: 12px;
          margin-top: 4px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
            align-items: center; /* Alignement vertical */
        }

        .btn-cancel {
          flex: 1;
          padding: 12px 24px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #2c3e50;
        }

        .btn-cancel:hover {
          background: #f8f9fa;
          border-color: #7f8c8d;
        }

        .btn-submit {
          flex: 1;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-danger-action {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }

        .btn-danger-action:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .header-actions button {
            width: 100%;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .table-header {
            flex-direction: column;
            gap: 15px;
          }

          .btn-create {
            width: 100%;
            justify-content: center;
          }

          .data-table {
            font-size: 12px;
          }

          .data-table th,
          .data-table td {
            padding: 12px 8px;
          }
        }

        @media (max-width: 480px) {
          .stats-cards {
            grid-template-columns: 1fr;
          }

          .modal-content {
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>

    </Layout>
  );
};

export default SuperAdminDashboard;