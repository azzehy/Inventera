  import React, { useState, useEffect } from "react";
  import Layout from "../component/Layout";
  import ApiService from "../service/ApiService";
  import { useNavigate } from "react-router-dom";
  import PaginationComponent from "../component/PaginationComponent";
 // import '../styles/Transactions.css';


  const TransactionsPage = () => {
      console.log("🎯 TransactionsPage montée !");

    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Filtres
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [isFiltered, setIsFiltered] = useState(false);

    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState("");


    useEffect(() => {
  fetchPartners();
}, []);


    useEffect(() => {
     
  if (!isFiltered) {
    getMyTransactions();
  }
}, [currentPage, isFiltered]);


    const fetchPartners = async () => {
      try {
        const response = await ApiService.getMyEntreprisePartners();
        if (response.status === 200) {
          setPartners(response.businessPartners || []);
        }
      } catch (error) {
        showMessage("Erreur lors du chargement des partenaires");
      }
    };



const applyMonthYearFilter = async () => {
  try {
    let response;

    // 🔵 PRIORITÉ AU PARTENAIRE
    if (selectedPartner) {
      response = await ApiService.getTransactionsByPartner(
        selectedPartner,
        currentPage - 1,
        itemsPerPage
      );
    }
    // 🟢 Mois + Année
    else if (selectedMonth && selectedYear) {
      response = await ApiService.getTransactionsByMonthAndYear(
        selectedMonth,
        selectedYear
      );
    }
    else {
      showMessage("Veuillez sélectionner un filtre");
      return;
    }

    if (response.status === 200) {
      setTransactions(response.transactions || []);
      setTotalPages(response.totalPages || 0);
      setIsFiltered(true);
    }
  } catch (error) {
    showMessage("Erreur lors du filtrage des transactions");
  }
};


const resetFilter = () => {
  setSelectedMonth("");
  setSelectedYear("");
  setSelectedPartner("");
  setIsFiltered(false);
  setCurrentPage(1);
  getMyTransactions();
};


    const getMyTransactions = async () => {
          console.log("📞 Début de getMyTransactions");

      try {
              console.log("🌐 Appel API...");

        // Le manager voit SEULEMENT les transactions de son entreprise
        const response = await ApiService.getMyEnterpriseTransactions(
          currentPage - 1,
          itemsPerPage
        );
        console.log("✅ Réponse:", response);

        if (response.status === 200) {
          setTransactions(response.transactions || []);
          setTotalPages(response.totalPages || 0);
        }
      } catch (error) {
              console.error("❌ Erreur complète:", error);

        showMessage(
          error.response?.data?.message || "Erreur lors du chargement des transactions"
        );
      }
    };

    const showMessage = (msg) => {
      setMessage(msg);
      setTimeout(() => setMessage(""), 4000);
    };



    const handleDeleteTransaction = async (transactionId) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    );

    if (!confirmDelete) return;

    try {
      const response = await ApiService.deleteTransaction(transactionId);

      if (response.status === 200) {
        showMessage("Transaction supprimée avec succès ✅");

        // 🔄 Mise à jour de la liste sans recharger la page
        setTransactions(prev =>
          prev.filter(tx => tx.id !== transactionId)
        );
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
        "Erreur lors de la suppression de la transaction"
      );
    }
  };



    const navigateToTransactionDetails = (transactionId) => {
      navigate(`/transaction/${transactionId}`);
    };

    const navigateToCreateTransaction = () => {
      navigate("/transaction/create");
    };

    const getStatusBadgeClass = (status) => {
      const badges = {
        PENDING: "status-badge status-pending",
        PROCESSING: "status-badge status-processing",
        COMPLETED: "status-badge status-completed",
        CANCELLED: "status-badge status-cancelled"
      };
      return badges[status] || "status-badge";
    };

    const getTypeBadgeClass = (type) => {
      const badges = {
        PURCHASE: "type-badge type-purchase",
        SALE: "type-badge type-sale",
        RETURN_TO_SUPPLIER: "type-badge type-return"
      };
      return badges[type] || "type-badge";
    };

    return (
      <Layout>
      <h1>TEST - Page Transactions</h1>
        {message && <p className="message message-error">{message}</p>}

        <div className="transactions-page">
          <div className="transactions-header">
            <h1>Mes Transactions</h1>
            <button 
              className="btn-create-transaction" 
              onClick={navigateToCreateTransaction}
            >
              + Créer une Transaction
            </button>
          </div>




          <div className="transactions-filters">

            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
            >
              <option value="">Tous les partenaires</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Mois</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("fr", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Année</option>
              {[2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button onClick={applyMonthYearFilter}>
              Filtrer
            </button>

            {isFiltered && (
              <button onClick={resetFilter}>
                Réinitialiser
              </button>
            )}
          </div>


          {transactions && transactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TYPE</th>
                  <th>STATUS</th>
                  <th>PARTENAIRE</th>
                  <th>QTÉ PRODUITS</th>
                  <th>PRIX TOTAL</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>#{transaction.id}</td>
                    <td>
                      <span className={getTypeBadgeClass(transaction.transactionType)}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.partnerName || "N/A"}</td>
                    <td>{transaction.qtyProducts}</td>
                    <td>{transaction.totalPrice?.toFixed(2)} DH</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-view-details"
                        onClick={() => navigateToTransactionDetails(transaction.id)}
                      >
                        Voir Détails
                      </button>

                      <button
                        className="btn-delete-transaction"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        Supprimer
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-transactions">
              <p>Aucune transaction trouvée</p>
              <button 
                className="btn-create-first"
                onClick={navigateToCreateTransaction}
              >
                Créer votre première transaction
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && !isFiltered && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Layout>
    );
  };

  export default TransactionsPage;