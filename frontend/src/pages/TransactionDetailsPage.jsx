import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Calendar,
  FileText,
  User,
  ShoppingCart,
  Loader,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";

const TransactionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchTransactionDetails();
  }, []);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getTransactionById(id);

      if (response.status === 200) {
        setTransaction(response.transaction);
        setNewStatus(response.transaction.status);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
        "Erreur lors du chargement de la transaction",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === transaction.status) return;

    setLoading(true);
    try {
      const response = await ApiService.updateTransactionStatus(id, newStatus);

      if (response.status === 200) {
        showMessage("Status mis à jour avec succès", "success");
        await fetchTransactionDetails();
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
        "Erreur lors de la mise à jour du status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      PENDING: { 
        bg: "bg-gradient-to-r from-yellow-400 to-orange-400",
        icon: <Clock size={18} />,
        text: "En attente"
      },
      PROCESSING: { 
        bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
        icon: <AlertCircle size={18} />,
        text: "En cours"
      },
      COMPLETED: { 
        bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
        icon: <CheckCircle size={18} />,
        text: "Terminé"
      },
      CANCELLED: { 
        bg: "bg-gradient-to-r from-red-500 to-pink-500",
        icon: <XCircle size={18} />,
        text: "Annulé"
      }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const getTransactionTypeConfig = (type) => {
    const typeConfig = {
      PURCHASE: { 
        icon: "🛒",
        text: "Achat",
        color: "text-purple-600",
        bg: "bg-purple-100"
      },
      SALE: { 
        icon: "💰",
        text: "Vente",
        color: "text-teal-600",
        bg: "bg-teal-100"
      },
      RETURN_TO_SUPPLIER: { 
        icon: "↩️",
        text: "Retour",
        color: "text-orange-600",
        bg: "bg-orange-100"
      }
    };
    return typeConfig[type] || typeConfig.PURCHASE;
  };

  if (loading && !transaction) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader size={40} className="text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des détails...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Transaction introuvable</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = getStatusConfig(transaction.status);
  const typeConfig = getTransactionTypeConfig(transaction.transactionType);

  return (
    <Layout>
      {/* Success/Error Message */}
      {message && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500'
            : 'bg-red-50 text-red-800 border-l-4 border-red-500'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-2 text-white-600 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} /> Retour aux transactions
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                 Détails de la Transaction
              </h1>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${statusConfig.bg} flex items-center gap-2`}>
                  {statusConfig.icon}
                  {statusConfig.text}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${typeConfig.color} ${typeConfig.bg}`}>
                  {typeConfig.icon} {typeConfig.text}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Montant Total</p>
              <p className="text-3xl font-bold text-teal-600">
                {transaction.totalPrice?.toFixed(2)} DH
              </p>
            </div>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={24} className="text-teal-600" />
              Informations Générales
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <User size={18} />
                  Partenaire
                </span>
                <span className="font-semibold text-gray-900">
                  {transaction.partnerName || "Aucun partenaire"}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Package size={18} />
                  Qté Produits
                </span>
                <span className="font-semibold text-gray-900">
                  {transaction.details?.length || 0}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar size={18} />
                  Date de création
                </span>
                <span className="font-semibold text-gray-900">
                  {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock size={18} />
                  Heure
                </span>
                <span className="font-semibold text-gray-900">
                  {new Date(transaction.createdAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Notes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={24} className="text-teal-600" />
              Description & Notes
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800">
                  {transaction.description || "Aucune description"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note
                </label>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-800">
                  {transaction.note || "Aucune note"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Modifier le Statut
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full appearance-none px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 transition-colors bg-white pr-10"
              >
                <option value="PENDING">En attente (PENDING)</option>
                <option value="PROCESSING">En cours (PROCESSING)</option>
                <option value="COMPLETED">Terminé (COMPLETED)</option>
                <option value="CANCELLED">Annulé (CANCELLED)</option>
              </select>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={loading || newStatus === transaction.status}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le statut"
              )}
            </button>
          </div>
        </div>

        {/* Transaction Lines Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={24} className="text-teal-600" />
              Lignes de Transaction ({transaction.details?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Produit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Quantité</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Prix Unitaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transaction.details?.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{line.productName}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {line.productSku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {line.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {line.unitPrice.toFixed(2)} DH
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-teal-600">
                        {line.lineTotal.toFixed(2)} DH
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-900">
                    Total Général:
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-teal-600">
                      {transaction.totalPrice?.toFixed(2)} DH
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;