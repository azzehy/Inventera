import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const PartnersPage = () => {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Pagination front-end
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Charger tous les partenaires au montage
  useEffect(() => {
    fetchAllPartners();
  }, []);

  // Recalculer totalPages quand le filtre ou la liste change
  useEffect(() => {
    const filtered = getFilteredPartners();
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    setCurrentPage(1); // reset page si filtre change
  }, [filterType, partners]);

  // Fonction pour récupérer tous les partenaires
  const fetchAllPartners = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await ApiService.getMyEntreprisePartners();
      if (response.status === 200) {
        setPartners(response.businessPartners || []);
      }
    } catch (error) {
      console.error(error);
      setMessage("Impossible de récupérer les partenaires");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un partenaire
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce partenaire ?")) return;
    try {
      const response = await ApiService.deleteBusinessPartner(id);
      if (response.status === 200) {
        setMessage("Partenaire supprimé avec succès");
        setPartners(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  // Appliquer le filtre
  const getFilteredPartners = () => {
    if (!filterType) return partners;
    return partners.filter(p => p.type === filterType);
  };

  // Découper les partenaires pour la page actuelle
  const getCurrentPagePartners = () => {
    const filtered = getFilteredPartners();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filtered.slice(indexOfFirstItem, indexOfLastItem);
  };

  const resetFilter = () => setFilterType("");

  return (
    <Layout>
      {message && <p className="alert-success">{message}</p>}

      <div className="partners-container">
        <div className="page-header">
          <div className="header-content">
            <h1>Mes Partenaires</h1>
            <button className="btn-primary" onClick={() => navigate("/partners/add")}>
              + Créer un Partenaire
            </button>
          </div>

          <div className="filters-section">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tous les partenaires</option>
              <option value="CLIENT">Clients</option>
              <option value="SUPPLIER">Fournisseurs</option>
            </select>

            {filterType && (
              <button className="btn-reset" onClick={resetFilter}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <p>Chargement...</p>
          ) : getCurrentPagePartners().length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>NOM</th>
                  <th>EMAIL</th>
                  <th>TÉLÉPHONE</th>
                  <th>ADRESSE</th>
                  <th>TYPE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPagePartners().map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.numero}</td>
                    <td>{p.address}</td>
                    <td>{p.type === "CLIENT" ? "CLIENT" : "FOURNISSEUR"}</td>
                    <td>
                      <button onClick={() => navigate(`/partners/edit/${p.id}`)}>Modifier</button>
                      <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun partenaire trouvé</p>
          )}
        </div>

        {totalPages > 1 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}


<style>{`

/* --- Container & Layout --- */
.partners-container {
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* --- Buttons --- */
.btn-primary {
  background: linear-gradient(135deg, rgb(7,143,158) 0%, rgb(0,110,120) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(7,143,158,0.6);
}

.btn-reset {
  background: rgba(7,143,158,0.1);
  color: rgb(7,143,158);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-reset:hover {
  background: rgb(7,143,158);
  color: white;
  transform: translateY(-2px);
}

/* --- Filters --- */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.filters-section select {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid rgba(7,143,158,0.3);
  font-weight: 500;
  cursor: pointer;
  background: #f0fdfa;
  color: rgb(7,143,158);
}

/* --- Table --- */
.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  margin-top: 1rem;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table thead {
  background: linear-gradient(135deg, rgb(7,143,158) 0%, rgb(0,110,120) 100%);
  color: white;
}

.modern-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.modern-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.modern-table tbody tr:hover {
  background: #f0fdfa;
  transform: scale(1.01);
}

.modern-table td {
  padding: 1rem 1.5rem;
  color: #4a5568;
  font-size: 0.95rem;
}

/* --- Badges --- */
.badge-client {
  background: rgba(7,143,158,0.2);
  color: rgb(7,143,158);
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-weight: 600;
}

.badge-supplier {
  background: rgba(0,110,120,0.2);
  color: rgb(0,110,120);
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-weight: 600;
}

/* --- Action buttons --- */
.modern-table td button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}

.modern-table td button:hover {
  transform: scale(1.05);
}

/* --- Pagination --- */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-button {
  border: 1px solid rgb(7,143,158);
  background: white;
  color: rgb(7,143,158);
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: rgb(7,143,158);
  color: white;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.active {
  background: rgb(7,143,158);
  color: white;
}

`
  
  }
</style>

      </div>
    </Layout>
  );
};

export default PartnersPage;
