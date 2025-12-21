import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../service/ApiService";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterpriseAddress, setEnterpriseAddress] = useState("");
  const [enterpriseEmail, setEnterpriseEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔧 REMPLACEZ CETTE URL PAR VOTRE IMAGE DE FOND
  const backgroundImageUrl = '/images/gestionstock_BG.webp';

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'email doit être valide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis";
    }

    if (!enterpriseName.trim()) {
      newErrors.enterpriseName = "Le nom de l'entreprise est requis";
    }

    if (enterpriseEmail && !/\S+@\S+\.\S+/.test(enterpriseEmail)) {
      newErrors.enterpriseEmail = "L'email de l'entreprise doit être valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name,
        email,
        password,
        phoneNumber,
        enterpriseName,
        enterpriseAddress: enterpriseAddress || null,
        enterpriseEmail: enterpriseEmail || null
      };

      await ApiService.registerUser(registerData);
      showMessage("Inscription réussie! Redirection...", "success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Erreur lors de l'inscription: " + error.message,
        "error"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "error") => {
    setMessage({ text: msg, type });
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <div className="register-container">
      <div className="register-content">
        {/* Section gauche - Bienvenue */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Rejoignez-nous</h1>
            <h2 className="welcome-subtitle">chez Inventory !</h2>
            <p className="welcome-description">
              Créez votre compte professionnel pour accéder à notre plateforme 
              de gestion centralisée. Gérez vos demandes et suivez vos opérations 
              en toute simplicité.
            </p>
            
            {/* Logo OCP */}
            <div className="ocp-logo">
              <div className="logo-icon">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                  <img 
                    src="/images/stock_logo-removebg-preview.png"
                    alt="Logo OCP" 
                    style={{ height: '200px', width: 'auto', transition: 'opacity 0.3s ease' }} 
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="form-section">
          <div className="form-container">
            <h3 className="form-title">Inscription</h3>
            
            {message && (
              <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleRegister}>
              {/* Informations personnelles */}
              <div className="form-subsection">
                <h4 className="subsection-title">Informations personnelles</h4>
                
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom complet"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email personnel *</label>
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe *</label>
                  <input
                    type="password"
                    id="password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>
              </div>

              {/* Informations de l'entreprise */}
              <div className="form-subsection">
                <h4 className="subsection-title">Informations de l'entreprise</h4>
                
                <div className="form-group">
                  <label htmlFor="enterpriseName">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    id="enterpriseName"
                    className={`form-input ${errors.enterpriseName ? 'input-error' : ''}`}
                    value={enterpriseName}
                    onChange={(e) => setEnterpriseName(e.target.value)}
                    placeholder="Nom de votre entreprise"
                  />
                  {errors.enterpriseName && <span className="error-text">{errors.enterpriseName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="enterpriseAddress">Adresse de l'entreprise</label>
                  <input
                    type="text"
                    id="enterpriseAddress"
                    className="form-input"
                    value={enterpriseAddress}
                    onChange={(e) => setEnterpriseAddress(e.target.value)}
                    placeholder="Adresse complète (optionnel)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="enterpriseEmail">Email de l'entreprise</label>
                  <input
                    type="email"
                    id="enterpriseEmail"
                    className={`form-input ${errors.enterpriseEmail ? 'input-error' : ''}`}
                    value={enterpriseEmail}
                    onChange={(e) => setEnterpriseEmail(e.target.value)}
                    placeholder="contact@entreprise.com (optionnel)"
                  />
                  {errors.enterpriseEmail && <span className="error-text">{errors.enterpriseEmail}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>
            
            <div className="form-footer">
              <p className="info-text">
                Vous avez déjà un compte?{' '}
                <Link to="/login" className="terms-link">Se connecter</Link>
              </p>
              <p className="terms-text">
                En cliquant sur "S'inscrire", vous acceptez nos{' '}
                <button type="button" className="terms-link" onClick={() => {}}>Conditions d'utilisation</button> et notre{' '}
                <button type="button" className="terms-link" onClick={() => {}}>Politique de confidentialité</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ocp-logo {
          display: flex;
          justify-content: center;
        }

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
  align-items: flex-start;
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
export default RegisterPage;