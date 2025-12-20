import React, { useState, useEffect } from 'react';
import Layout from '../component/Layout';
import ApiService from '../service/ApiService';
import {
  CreditCard,
  Calendar,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  Loader,
  Crown,
  Zap,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiService.getMySubscription();
      if (response.status === 200) {
        setSubscription(response.subscription || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'abonnement");
      console.error("Erreur:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPlanIcon = (planName) => {
    if (planName?.toLowerCase().includes('enterprise')) return Crown;
    if (planName?.toLowerCase().includes('pro')) return Zap;
    return Package;
  };

  const getPlanGradient = (planName) => {
    if (planName?.toLowerCase().includes('enterprise')) return "from-pink-500 to-yellow-400";
    if (planName?.toLowerCase().includes('pro')) return "from-teal-500 to-cyan-500";
    return "from-gray-500 to-gray-600";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader size={40} className="text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement de votre abonnement...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={fetchSubscription}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <RefreshCw size={18} />
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!subscription) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* No Subscription Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun abonnement actif
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Vous n'avez pas encore d'abonnement actif. Choisissez un plan pour commencer à utiliser toutes les fonctionnalités.
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <TrendingUp size={20} />
                Voir les plans
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const PlanIcon = getPlanIcon(subscription.planName);
  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mon Abonnement
              </h1>
              <p className="text-gray-600">
                Gérez et consultez les détails de votre abonnement
              </p>
            </div>
            <button
              onClick={fetchSubscription}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <RefreshCw size={18} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {isExpiringSoon && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Votre abonnement expire bientôt
                </h3>
                <p className="text-yellow-800">
                  Il vous reste {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} d'abonnement. Pensez à renouveler pour continuer à profiter de tous les avantages.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  Abonnement expiré
                </h3>
                <p className="text-red-800">
                  Votre abonnement a expiré. Veuillez renouveler pour continuer à utiliser les fonctionnalités premium.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Subscription Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Plan Header */}
          <div className={`bg-gradient-to-r ${getPlanGradient(subscription.plan?.planName)} p-8 text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <PlanIcon size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{subscription.planName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle size={18} />
                  <span className="text-white/90 font-medium">Actif</span>
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold">
              {subscription.plan?.priceMonthly} MAD
              <span className="text-xl font-normal text-white/80"> / mois</span>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Détails de l'abonnement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Date de début
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(subscription.startDate)}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Date de fin
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(subscription.endDate)}
                  </p>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({daysRemaining} jours restants)
                    </p>
                  )}
                </div>
              </div>

              {/* Max Products */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Package size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Produits maximum
                  </p>
                  <p className="text-gray-900 font-semibold text-2xl">
                    {subscription.plan?.maxProducts}

                  </p>
                </div>
              </div>

              {/* Max Users */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Utilisateurs maximum
                  </p>
                  <p className="text-gray-900 font-semibold text-2xl">
                    {subscription.plan?.maxUsers}

                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Méthode de paiement
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {subscription.paymentMethod || "Carte bancaire"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-700 uppercase tracking-wide font-semibold mb-1">
                    Statut
                  </p>
                  <p className="text-emerald-900 font-semibold text-lg">
                    {subscription.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="/pricing"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <TrendingUp size={20} />
              Changer de plan
            </a>
            {/* <button
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <CreditCard size={20} />
              Historique des paiements
            </button> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;