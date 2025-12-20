import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ApiService from "../service/ApiService";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  const hasConfirmed = useRef(false); // ← Empêche les doubles appels

  useEffect(() => {
    if (!hasConfirmed.current) {
      hasConfirmed.current = true;
      confirmPayment();
    }
  }, []);

  const confirmPayment = async () => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      return;
    }

    try {
      const data = await ApiService.confirmPayment(sessionId);

      if (data.status === 200) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="payment-status">
        <h1>⏳ Confirmation du paiement...</h1>
        <p>Veuillez patienter</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="payment-status success">
        <h1>✅ Paiement réussi !</h1>
        <p>Votre abonnement a été activé avec succès.</p>
        <p>Redirection vers le dashboard...</p>
      </div>
    );
  }

  return (
    <div className="payment-status error">
      <h1>❌ Erreur</h1>
      <p>Une erreur est survenue lors de la confirmation du paiement.</p>
      <button onClick={() => navigate('/pricing')}>
        Retour aux plans
      </button>
    </div>
  );
};

export default PaymentSuccess;