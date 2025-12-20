import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-status cancel">
      <h1>❌ Paiement annulé</h1>
      <p>Vous avez annulé le paiement.</p>
      <button onClick={() => navigate('/pricing')}>
        Retour aux plans
      </button>
    </div>
  );
};

export default PaymentCancel;