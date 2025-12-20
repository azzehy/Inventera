import React, { useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import ApiService from "../service/ApiService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await ApiService.forgotPassword(email);
      setMessage(response.message || "Lien de réinitialisation envoyé !");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la demande de mot de passe oublié.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Mot de passe oublié</h1>
            <h2 className="welcome-subtitle">Ne vous inquiétez pas !</h2>
            <p className="welcome-description">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>

        <div className="form-section">
          <div className="form-container">
            {message && <div className="message success-message">{message}</div>}
            {error && <div className="message error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </form>

            

            <div className="form-footer">
                                  <Link to="/login" className="terms-link">Retour à la connexion</Link>
                                  
            </div>
          </div>
        </div>
      </div>

      <style>{`
       /* Conteneur principal */
.register-container {
  min-height: 100vh;
  background-image: 
    linear-gradient(135deg, rgba(32, 180, 194, 0.8), rgba(7, 144, 158, 0.6)),
    url('/images/gestionstock_BG.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Conteneur interne */
.register-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Section gauche - Welcome */
.welcome-section {
  flex: 1;
  background: linear-gradient(135deg, rgb(32, 180, 194), rgb(7, 144, 158));
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  position: relative;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.1"/><circle cx="60" cy="70" r="1" fill="white" opacity="0.1"/><circle cx="30" cy="80" r="1.5" fill="white" opacity="0.1"/><path d="M10 50 Q50 30 90 50 Q50 70 10 50" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></svg>');
  background-size: 200px 200px;
}

.welcome-content { position: relative; z-index: 1; }
.welcome-title { font-size: 3.5rem; font-weight: 700; margin-bottom: 0; line-height: 1.1; }
.welcome-subtitle { font-size: 3.5rem; font-weight: 700; margin-bottom: 1.5rem; line-height: 1.1; opacity: 0.9; }
.welcome-description { font-size: 1.1rem; line-height: 1.6; opacity: 0.9; margin-bottom: 2rem; max-width: 400px; }

.logo-icon { display: flex; align-items: center; gap: 0.5rem; }
.ocp-logo { display: flex; justify-content: center; margin-top: 2rem; }

/* Section droite - Formulaire */
.form-section {
  flex: 1.2;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  max-height: 100vh;
}

.form-container { width: 100%; max-width: 500px; }
.form-title { font-size: 2rem; font-weight: 700; color: rgb(32, 180, 194); margin-bottom: 1.5rem; text-align: center; }

/* Messages */
.message { padding: 12px 16px; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.9rem; }
.error-message { background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); color: #721c24; }
.success-message { background: rgba(32, 180, 194, 0.1); border: 1px solid rgba(32, 180, 194, 0.3); color: rgb(7, 144, 158); }

/* Formulaire */
.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; color: rgb(32, 180, 194); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
.form-input {
  width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;
  background: white; transition: all 0.3s ease; box-sizing: border-box; color: #333;
}
.form-input::placeholder { color: #aaa; }
.form-input:focus { outline: none; border-color: rgb(32, 180, 194); box-shadow: 0 0 0 3px rgba(32, 180, 194, 0.2); }

/* Bouton */
.submit-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, rgb(32, 180, 194), rgb(7, 144, 158));
  color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer;
  transition: all 0.3s ease; position: relative; overflow: hidden; margin-top: 1rem;
}
.submit-btn::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s ease;
}
.submit-btn:hover::before { left: 100%; }
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(32,180,194,0.3); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

/* Footer */
.form-footer { margin-top: 1.5rem; text-align: center; }
.info-text { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
.terms-link { color: rgb(32, 180, 194); text-decoration: none; font-weight: 600; background: none; border: none; padding: 0; font-family: inherit; font-size: inherit; cursor: pointer; }
.terms-link:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 968px) {
  .register-content { flex-direction: column; max-width: 600px; }
  .welcome-section { padding: 40px 30px; text-align: center; }
  .welcome-title, .welcome-subtitle { font-size: 2.5rem; }
  .form-section { padding: 40px 30px; max-height: none; }
}
@media (max-width: 480px) {
  .register-container { padding: 10px; }
  .welcome-section { padding: 30px 20px; }
  .form-section { padding: 30px 20px; }
  .welcome-title, .welcome-subtitle { font-size: 2rem; }
  .form-group { margin-bottom: 1rem; }
}

      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;
