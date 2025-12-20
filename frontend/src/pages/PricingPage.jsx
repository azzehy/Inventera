import React, { useState, useEffect } from 'react';
import { Check, Zap, Users, Package, Loader, Crown, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from "../service/ApiService";
import Layout from '../component/Layout';

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les plans et l'abonnement actuel en parallèle
      const [plansData, subscriptionData] = await Promise.all([
        ApiService.getPaymentPlans(),
        ApiService.getMySubscription()
      ]);
      
      setPlans(plansData.planList);
      
      // Vérifier si l'utilisateur a un abonnement actif
      if (subscriptionData.subscription && subscriptionData.subscription.status === 'ACTIVE') {
        setCurrentSubscription(subscriptionData.subscription);
      }
    } catch (error) {
      console.error("Erreur chargement données :", error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleBuyPlan = async (planId) => {
    // 🔹 Vérification 1 : Vérifier si l'utilisateur a déjà un abonnement actif
    if (currentSubscription) {
      // Si c'est le même plan
      if (currentSubscription.plan.id === planId) {
        setAlertMessage(`Vous avez déjà un abonnement actif au plan ${currentSubscription.plan.name}. Il expire le ${new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}.`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        return;
      }
      
      // Si c'est un plan différent
      const confirmed = window.confirm(
        `Vous avez déjà un abonnement actif au plan ${currentSubscription.plan.name}. Voulez-vous vraiment changer de plan ? (Cette action peut entraîner des frais supplémentaires)`
      );
      
      if (!confirmed) {
        return;
      }
    }

    // 🔹 Vérification 2 : Ne pas permettre d'acheter le plan Free
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan && selectedPlan.priceMonthly === 0) {
      setAlertMessage("Le plan gratuit est déjà actif par défaut.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    // Procéder au paiement
    setLoading(true);
    setLoadingPlanId(planId);
    try {
      const data = await ApiService.checkout(planId);
      const checkoutUrl = data.checkoutResponse.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erreur:', error);
      setAlertMessage('Erreur lors de la création du paiement. Veuillez réessayer.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setLoading(false);
      setLoadingPlanId(null);
    }
  };

  const getPlanIcon = (index) => {
    if (index === 0) return Package;
    if (index === 1) return Zap;
    return Crown;
  };

  const getPlanGradient = (index) => {
    if (index === 0) return "from-gray-500 to-gray-600";
    if (index === 1) return "from-teal-500 to-cyan-500";
    return "from-pink-500 to-yellow-400";
  };

  const getPlanBorder = (index) => {
    if (index === 0) return "border-gray-200";
    if (index === 1) return "border-teal-200";
    return "border-pink-200";
  };

  const isCurrentPlan = (planId) => {
    return currentSubscription && currentSubscription.plan.id === planId;
  };

  if (isLoadingPlans) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader size={40} className="text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des plans...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Alert Message */}
          {showAlert && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-400 mr-3 flex-shrink-0" size={24} />
                <p className="text-yellow-800 font-medium">{alertMessage}</p>
              </div>
            </div>
          )}

          {/* Current Subscription Banner */}
          {currentSubscription && (
            <div className="mb-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Abonnement actif</h3>
                    <p className="text-white/90">
                      Plan {currentSubscription.plan.name} • Expire le {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      {currentSubscription.daysRemaining} jours restants
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Choisissez votre plan
            </h1>
            <p className="text-sm text-gray-600">
              Sélectionnez le plan qui correspond le mieux à vos besoins
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => {
              const Icon = getPlanIcon(index);
              const isPopular = index === 1;
              const isFree = plan.priceMonthly === 0;
              const isActive = isCurrentPlan(plan.id);
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative bg-white rounded-2xl shadow-sm border-2 ${getPlanBorder(index)} p-8 transition-all hover:shadow-xl hover:-translate-y-1 ${
                    isPopular ? 'ring-2 ring-teal-500 ring-offset-4' : ''
                  } ${isActive ? 'ring-2 ring-green-500 ring-offset-4' : ''}`}
                >
                  {/* Popular Badge */}
                  {isPopular && !isActive && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ POPULAIRE
                      </span>
                    </div>
                  )}

                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <CheckCircle size={14} /> PLAN ACTUEL
                      </span>
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPlanGradient(index)} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon size={28} className="text-white" />
                  </div>

                  {/* Plan Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>

                  {/* Price */}
                  <div className="mb-6">
                    {isFree ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">Gratuit</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">{plan.priceMonthly}</span>
                        <span className="text-gray-600 ml-2">MAD / mois</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-semibold text-gray-900">{plan.maxProducts}</span> produits maximum
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-semibold text-gray-900">{plan.maxUsers}</span> utilisateur{plan.maxUsers > 1 ? 's' : ''} maximum
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-gray-700">Support client prioritaire</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-gray-700">Mises à jour gratuites</span>
                    </li>
                  </ul>

                  {/* CTA Button */}
                  {isActive ? (
                    <button 
                      disabled 
                      className="w-full py-3 px-6 bg-green-100 text-green-700 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Plan actif
                    </button>
                  ) : isFree ? (
                    <button 
                      disabled 
                      className="w-full py-3 px-6 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Plan gratuit
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuyPlan(plan.id)}
                      disabled={loading && loadingPlanId === plan.id}
                      className={`w-full py-3 px-6 bg-gradient-to-r ${getPlanGradient(index)} hover:opacity-90 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {loading && loadingPlanId === plan.id ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        'Choisir ce plan'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Check size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Paiement sécurisé</h3>
                  <p className="text-sm text-gray-600">Transactions cryptées via Stripe</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Support 24/7</h3>
                  <p className="text-sm text-gray-600">Assistance disponible à tout moment</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Activation immédiate</h3>
                  <p className="text-sm text-gray-600">Accès instantané après paiement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;