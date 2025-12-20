import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  Loader, 
  FileText, 
  Calendar,
  DollarSign,
  Package,
  Users,
  ChevronDown,
  X
} from "lucide-react";

const TransactionsPage = () => {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Filters
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
      showMessage("Erreur lors du chargement des partenaires", "error");
    }
  };

  const applyMonthYearFilter = async () => {
    setIsLoading(true);
    try {
      let response;

      if (selectedPartner) {
        response = await ApiService.getTransactionsByPartner(
          selectedPartner,
          currentPage - 1,
          itemsPerPage
        );
      } else if (selectedMonth && selectedYear) {
        response = await ApiService.getTransactionsByMonthAndYear(
          selectedMonth,
          selectedYear
        );
      } else {
        showMessage("Veuillez sélectionner un filtre", "error");
        return;
      }

      if (response.status === 200) {
        setTransactions(response.transactions || []);
        setTotalPages(response.totalPages || 0);
        setIsFiltered(true);
      }
    } catch (error) {
      showMessage("Erreur lors du filtrage des transactions", "error");
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const response = await ApiService.getMyEnterpriseTransactions(
        currentPage - 1,
        itemsPerPage
      );

      if (response.status === 200) {
        setTransactions(response.transactions || []);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      showMessage("Erreur lors du chargement des transactions", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.deleteTransaction(transactionId);
      if (response.status === 200) {
        showMessage("Transaction supprimée avec succès", "success");
        setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
      }
    } catch (error) {
      showMessage("Erreur lors de la suppression de la transaction", "error");
    } finally {
      setIsLoading(false);
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
      PENDING: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white",
      PROCESSING: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
      COMPLETED: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
      CANCELLED: "bg-gradient-to-r from-red-500 to-pink-500 text-white"
    };
    return badges[status] || "bg-gray-200 text-gray-800";
  };

  const getTypeBadgeClass = (type) => {
    const badges = {
      PURCHASE: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
      SALE: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white",
      RETURN_TO_SUPPLIER: "bg-gradient-to-r from-orange-500 to-red-500 text-white"
    };
    return badges[type] || "bg-gray-200 text-gray-800";
  };

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, tx) => sum + (tx.totalPrice || 0), 0);
  const completedCount = transactions.filter(tx => tx.status === "COMPLETED").length;

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Transactions</h1>
              <p className="text-gray-600 text-sm">Gérez vos achats, ventes et retours</p>
            </div>
            <button
              onClick={navigateToCreateTransaction}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              <Plus size={20} /> Créer une Transaction
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{totalTransactions}</h3>
                <p className="text-gray-600 text-sm">Total Transactions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <DollarSign size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{totalAmount.toFixed(2)} DH</h3>
                <p className="text-gray-600 text-sm">Montant Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{completedCount}</h3>
                <p className="text-gray-600 text-sm">Complétées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={selectedPartner}
                  onChange={(e) => setSelectedPartner(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white pr-10"
                >
                  <option value="">Tous les partenaires</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white pr-10"
                >
                  <option value="">Mois</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("fr", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white pr-10"
                >
                  <option value="">Année</option>
                  {[2023, 2024, 2025].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={applyMonthYearFilter}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  Filtrer
                </button>

                {isFiltered && (
                  <button
                    onClick={resetFilter}
                    className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
            <Loader size={40} className="text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Chargement des transactions...</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Partenaire</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Qté Produits</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Prix Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                     
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeClass(transaction.transactionType)}`}>
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{transaction.partnerName || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{transaction.qtyProducts}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{transaction.totalPrice?.toFixed(2)} DH</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigateToTransactionDetails(transaction.id)}
                            className="p-2 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
                            title="Voir Détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
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
              <FileText size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune transaction trouvée</h2>
            <p className="text-gray-600 mb-6">
              {isFiltered
                ? "Essayez d'ajuster vos filtres"
                : "Commencez par créer votre première transaction"}
            </p>
            <button
              onClick={navigateToCreateTransaction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Plus size={20} /> Créer votre première transaction
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionsPage;