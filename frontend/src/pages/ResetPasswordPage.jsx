import React, { useState, useEffect } from "react";
import { useNavigate,Link, useSearchParams } from "react-router-dom";
import ApiService from "../service/ApiService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // récupère le token depuis l’URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Token invalide ou manquant.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation frontend
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.resetPassword(token, newPassword);
      setMessage(response.message || "Mot de passe réinitialisé avec succès !");
      // Redirection après 2 secondes
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Section gauche */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Réinitialisation</h1>
            <h2 className="welcome-subtitle">du mot de passe</h2>
            <p className="welcome-description">
              Entrez votre nouveau mot de passe pour accéder à votre compte.
            </p>
            <div className="ocp-logo">
              <div className="logo-icon">
                <img 
                  src="/images/stock_logo-removebg-preview.png"
                  alt="Logo OCP" 
                  style={{ height: '150px', width: 'auto' }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="form-section">
          <div className="form-container">
            {error && <div className="message error-message">{error}</div>}
            {message && <div className="message success-message">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nouveau mot de passe :</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmer mot de passe :</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  required
                />
              </div>
<div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Réinitialisation..." : "Réinitialiser"}
              </button>
              <div className="form-footer">
                            
                              <Link to="/login" className="terms-link">Retour à la connexion</Link>
                      
                           
                          </div>
                </div>

              
            </form>
          </div>
        </div>
      </div>

      {/* CSS copié du style LoginPage */}
      <style>{`
        .register-container { min-height: 100vh; background-image: linear-gradient(135deg, rgba(32,180,194,0.8), rgba(7,144,158,0.6)), url('/images/gestionstock_BG.webp'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .register-content { display: flex; width: 100%; max-width: 1200px; min-height: 600px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); overflow: hidden; }
        .welcome-section { flex: 1; background: linear-gradient(135deg, rgb(32,180,194), rgb(7,144,158)); color: white; padding: 60px 40px; display: flex; align-items: center; position: relative; text-align: center; }
        .welcome-content { position: relative; z-index: 1; }
        .welcome-title { font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem; }
        .welcome-subtitle { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; opacity: 0.9; }
        .welcome-description { font-size: 1rem; line-height: 1.6; opacity: 0.9; margin-bottom: 2rem; max-width: 400px; margin-left:auto; margin-right:auto; }
        .ocp-logo { display: flex; justify-content: center; margin-top: 2rem; }
        .form-section { flex: 1.2; padding: 40px; display: flex; align-items: center; justify-content: center; overflow-y: auto; max-height: 100vh; }
        .form-container { width: 100%; max-width: 500px; }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; color: rgb(32,180,194); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; background: white; transition: all 0.3s ease; box-sizing: border-box; color: #333; }
        .form-input::placeholder { color: #aaa; }
        .form-input:focus { outline: none; border-color: rgb(32,180,194); box-shadow: 0 0 0 3px rgba(32,180,194,0.2); }
        .submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, rgb(32,180,194), rgb(7,144,158)); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-top: 1rem; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .message { padding: 12px 16px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; }
        .error-message { background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.3); color: #721c24; }
        .success-message { background: rgba(32,180,194,0.1); border: 1px solid rgba(32,180,194,0.3); color: rgb(7,144,158); }
        .info-text { color: #666; font-size: 0.9rem; margin-top: 1rem; text-align: center; }
        .terms-link { color: rgba(255, 255, 255, 1); text-decoration: none; font-weight: 600; cursor: pointer; }
        .terms-link:hover { text-decoration: underline; }
        .form-footer {
  color: #007b8a;  /* Bleu foncé */
  background-color: rgba(255, 255, 255, 0.8);  /* Fond semi-transparent */
  padding: 10px;
  margin-top: 20px;
  border-radius: 8px;
  text-align: center;  /* Centrer le texte */
}

.terms-link {
  color: #007b8a;  /* Lien en bleu foncé */
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
  color: #005f6a;  /* Lien plus foncé au survol */
}


        @media (max-width: 968px) {
          .register-content { flex-direction: column; max-width: 600px; }
          .welcome-section { padding: 40px 30px; }
          .welcome-title, .welcome-subtitle { font-size: 2rem; }
          .form-section { padding: 40px 30px; max-height: none; }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
