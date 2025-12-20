import axios from "axios";
import CryptoJS from "crypto-js";

export default class ApiService {

    static BASE_URL = "http://localhost:5051/api";
    static ENCRYPTION_KEY = "phegon-dev-inventory";


    //encrypt data using cryptoJs
    static encrypt(data) {
        return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY.toString());
    }

    //decrypt data using cryptoJs
    static decrypt(data) {
        const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    //save token with encryption
    static saveToken(token) {
        const encryptedToken = this.encrypt(token);
        localStorage.setItem("token", encryptedToken)
    }

    // retreive the token
    static getToken() {
        const encryptedToken = localStorage.getItem("token");
        if (!encryptedToken) return null;
        return this.decrypt(encryptedToken);
    }

    //save Role with encryption
    static saveRole(role) {
        const encryptedRole = this.encrypt(role);
        localStorage.setItem("role", encryptedRole)
    }

    // retreive the role
    static getRole() {
        const encryptedRole = localStorage.getItem("role");
        if (!encryptedRole) return null;
        return this.decrypt(encryptedRole);
    }

    static clearAuth() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }


    static getHeader() {
        const token = this.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    /**  AUTH && USERS API */

    static async registerUser(registerData) {
        const response = await axios.post(`${this.BASE_URL}/auth/register/admin`, registerData)
        return response.data;
    }


    static async loginUser(loginData) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginData)
        return response.data;
    }











    /**AUTHENTICATION CHECKER */
    static logout(){
        this.clearAuth()
    }

    static isAuthenticated(){
        const token = this.getToken();
        return !!token;
    }

    static isAdmin(){
        const role = this.getRole();
        return role === "ADMIN";
    }

    static isSuperAdmin(){
        const role = this.getRole();
        return role === "SUPER_ADMIN";
    }



    static isManager() {
        const role = this.getRole();
        return role === "MANAGER";
    }
















    
    ///////////transaction/////////////////

  // ✅ APRÈS (token déchiffré - correct)
    static async getMyEnterpriseTransactions(page = 0, size = 10) {
        const response = await axios.get(
            `${this.BASE_URL}/transactions/my-transactions?page=${page}&size=${size}`,
            {
                headers: this.getHeader() // ✅ Utilise getHeader() qui déchiffre
            }
        );
        return response.data;
    }


    // ✅ Transactions par mois et année
      static async getTransactionsByMonthAndYear(month, year) {
        const response = await axios.get(
          `${this.BASE_URL}/transactions/month/${month}/year/${year}`,
          {
            headers: this.getHeader()
          }
        );
        return response.data;
      }

      static async getTransactionsByPartner(partnerId, page = 0, size = 10) {
        const response = await axios.get(
          `${this.BASE_URL}/transactions/partner/${partnerId}?page=${page}&size=${size}`,
          {
            headers: this.getHeader()
          }
        );
        return response.data;
      }


    // ✅ Supprimer une transaction
    static async deleteTransaction(transactionId) {
      const response = await axios.delete(
        `${this.BASE_URL}/transactions/delete/${transactionId}`,
        {
          headers: this.getHeader()
        }
      );
      return response.data;
    }


    // ✅ Détails d'une transaction par ID
    static async getTransactionById(transactionId) {
      const response = await axios.get(
        `${this.BASE_URL}/transactions/${transactionId}`,
        {
          headers: this.getHeader()
        }
      );
      return response.data;
    }

    // ✅ Modifier le status d'une transaction
    static async updateTransactionStatus(transactionId, status) {
      const response = await axios.put(
        `${this.BASE_URL}/transactions/${transactionId}/status`,
        null,
        {
          params: { status },
          headers: this.getHeader()
        }
      );
      return response.data;
    }


      // ✅ CORRIGÉ - Utilise getHeader()
    static async getMyEntrepriseProducts() {
        const response = await axios.get(
            `${this.BASE_URL}/products/my-products`,
            {
                headers: this.getHeader()
            }
        );
        return response.data;
    }

     // ✅ CORRIGÉ - Utilise getHeader()
    static async getMyEntreprisePartners() {
        const response = await axios.get(
            `${this.BASE_URL}/business-partners/my-partners`,
            {
                headers: this.getHeader()
            }
        );
        return response.data;
    }


          
    // ✅ CORRIGÉ - Utilise getHeader()
    static async createTransaction(transactionData) {
        const response = await axios.post(
            `${this.BASE_URL}/transactions/create`,
            transactionData,
            {
                headers: this.getHeader()
            }
        );
        return response.data;
    }


   // ✅ CORRIGÉ - Utilise getHeader()
    static async getUserProfile() {
        const response = await axios.get(
            `${this.BASE_URL}/users/current`,
            {
                headers: this.getHeader()
            }
        );
        return response.data;
    }

/////////////////Business Partner ///////////////

    // Ajouter partenaire
    static async addBusinessPartner(data) {
      const response = await axios.post(
        `${this.BASE_URL}/business-partners/addBusnissPartner`,
        data,
        { headers: this.getHeader() }
      );
      return response.data;
    }


    //  Modifier partenaire
    static async updateBusinessPartner(id, data) {
      const response = await axios.put(
        `${this.BASE_URL}/business-partners/update/${id}`,
        data,
        { headers: this.getHeader() }
      );
      return response.data;
    }

    //  Détail partenaire (pour edit)
    static async getBusinessPartnerById(id) {
      const response = await axios.get(
        `${this.BASE_URL}/business-partners/${id}`,
        { headers: this.getHeader() }
      );
      return response.data;
    }


    

// Supprimer partenaire
static async deleteBusinessPartner(id) {
  const response = await axios.delete(
    `${this.BASE_URL}/business-partners/${id}`,
    { headers: this.getHeader() }
  );
  return response.data;
}

// Récupérer tous les partenaires de l'entreprise
static async getMyEnterprisePartners() {
  const response = await axios.get(
    `${this.BASE_URL}/business-partners/my-partners`,
    { headers: this.getHeader() }
  );
  return response.data;
}

// Récupérer les partenaires par type
static async getMyEnterprisePartnersByType(type) {
  const response = await axios.get(
    `${this.BASE_URL}/business-partners/my-partners/type/${type}`,
    { headers: this.getHeader() }
  );
  return response.data;
}





  // -----------------------------------
  // Auth / Mot de passe
  // -----------------------------------

  static async forgotPassword(email) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/forgot-password`,
      { email }
      
    );
    return response.data;
  }

  static async resetPassword(token, newPassword) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/reset-password`,
      { token, newPassword }
     
    );
    return response.data;
  }










  
// -----------------------------------
// Enterprise Management (SUPER_ADMIN)
// -----------------------------------

// Récupérer toutes les entreprises (SUPER_ADMIN uniquement)
static async getAllEnterprises() {
  const response = await axios.get(
    `${this.BASE_URL}/enterprises/all`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Récupérer une entreprise par ID
static async getEnterpriseById(id) {
  const response = await axios.get(
    `${this.BASE_URL}/enterprises/${id}`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Récupérer les statistiques d'une entreprise
static async getEnterpriseStats(id) {
  const response = await axios.get(
    `${this.BASE_URL}/enterprises/${id}/stats`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Créer une nouvelle entreprise (SUPER_ADMIN uniquement)
static async createEnterprise(enterpriseData) {
  const response = await axios.post(
    `${this.BASE_URL}/enterprises/create`,
    enterpriseData,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Mettre à jour une entreprise
static async updateEnterprise(id, enterpriseData) {
  const response = await axios.put(
    `${this.BASE_URL}/enterprises/${id}`,
    enterpriseData,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Supprimer une entreprise (SUPER_ADMIN uniquement)
static async deleteEnterprise(id) {
  const response = await axios.delete(
    `${this.BASE_URL}/enterprises/${id}`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Récupérer son entreprise (pour ADMIN, MANAGER)
static async getMyEnterprise() {
  const response = await axios.get(
    `${this.BASE_URL}/enterprises/my-enterprise`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}

// Récupérer les stats de son entreprise (pour ADMIN, MANAGER)
static async getMyEnterpriseStats() {
  const response = await axios.get(
    `${this.BASE_URL}/enterprises/my-enterprise/stats`,
    {
      headers: this.getHeader()
    }
  );
  return response.data;
}








































    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/users/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUsersByRole(role) {
        const response = await axios.get(`${this.BASE_URL}/users/all/role`, {
            params: { role },
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUsersByEnterpriseAndRole(enterpriseId, role) {
        const response = await axios.get(`${this.BASE_URL}/users/all/enterprise/${enterpriseId}/role`, {
            params: { role },
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getLoggedInUsesInfo() {
        const response = await axios.get(`${this.BASE_URL}/users/current`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserById(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUsersByEnterprise(enterpriseId) {
        const response = await axios.get(`${this.BASE_URL}/users/enterprise/${enterpriseId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateUser(userId, userData) {
    const response = await axios.put(`${this.BASE_URL}/users/update/${userId}`, userData, {
        headers: this.getHeader()
    });
    return response.data;
}

    static async deleteUser(userId) {
        const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserTransactions(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/transactions/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async createManager(managerData) {
        const response = await axios.post(`${this.BASE_URL}/users/admin/create-manager`, managerData, {
            headers: this.getHeader()
        });
        return response.data;
    }


    /**PRODUCT ENDPOINTS - ✅ CORRECTED */

    static async addProduct(formData) {
        const response = await axios.post(`${this.BASE_URL}/products/add`, formData, {
            headers: {
                Authorization: `Bearer ${this.getToken()}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    static async updateProduct(productId, formData) {
        const response = await axios.put(`${this.BASE_URL}/products/update/${productId}`, formData, {
            headers: {
                Authorization: `Bearer ${this.getToken()}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    // ✅ For SUPER_ADMIN only
    static async getAllProducts() {
        const response = await axios.get(`${this.BASE_URL}/products/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getProductById(productId) {
        const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async searchProduct(searchValue) {
        const response = await axios.get(`${this.BASE_URL}/products/search`, {
            params: { input: searchValue },
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteProduct(productId) {
        const response = await axios.delete(`${this.BASE_URL}/products/delete/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }




    
    // ✅ Get products by specific enterprise (for SUPER_ADMIN viewing other enterprises)
    static async getProductsByEnterprise(enterpriseId) {
        const response = await axios.get(`${this.BASE_URL}/products/enterprise/${enterpriseId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getProductsByCategory(categoryId) {
        const response = await axios.get(`${this.BASE_URL}/products/category/${categoryId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // ✅ Get low stock products for specific enterprise
    static async getLowStockProducts(enterpriseId) {
        const response = await axios.get(`${this.BASE_URL}/products/low-stock/${enterpriseId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // ✅ PRIMARY: Get MY enterprise products (for current user's enterprise)
    static async getMyEnterpriseProducts() {
        const response = await axios.get(`${this.BASE_URL}/products/my-products`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    // ✅ PRIMARY: Get MY enterprise low stock products
    static async getMyEnterpriseLowStockProducts() {
        const response = await axios.get(`${this.BASE_URL}/products/my-low-stock`, {
            headers: this.getHeader()
        });
        return response.data;
    }


    /**CATEGORY ENDPOINTS - ✅ CORRECTED */

    static async createCategory(category) {
        const response = await axios.post(`${this.BASE_URL}/categories/add`, category, {
            headers: this.getHeader()
        })
        return response.data;
    }


    
    // ✅ For SUPER_ADMIN only
    static async getAllCategory() {
        const response = await axios.get(`${this.BASE_URL}/categories/all`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getCategoryById(categoryId) {
        const response = await axios.get(`${this.BASE_URL}/categories/${categoryId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async updateCategory(categoryId, categoryData) {
        const response = await axios.put(`${this.BASE_URL}/categories/update/${categoryId}`, categoryData, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async deleteCategory(categoryId) {
        const response = await axios.delete(`${this.BASE_URL}/categories/delete/${categoryId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    // ✅ Get categories for specific enterprise
    static async getCategoriesByEnterprise(enterpriseId) {
        const response = await axios.get(`${this.BASE_URL}/categories/entreprise/${enterpriseId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    // ✅ PRIMARY: Get MY enterprise categories
    static async getMyEnterpriseCategories() {
        const response = await axios.get(`${this.BASE_URL}/categories/my-categories`, {
            headers: this.getHeader()
        })
        return response.data;
    }


    /**ENTERPRISE ENDPOINTS - ✅ CORRECTED */

 


    static async getBusinessPartnersByType(type) {
        const response = await axios.get(`${this.BASE_URL}/business-partners/type/${type}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getBusinessPartnersByEnterprise(enterpriseId) {
        const response = await axios.get(`${this.BASE_URL}/business-partners/enterprise/${enterpriseId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getBusinessPartnersByEnterpriseAndType(enterpriseId, type) {
        const response = await axios.get(`${this.BASE_URL}/business-partners/enterprise/${enterpriseId}/type/${type}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

 


    // ✅ PRIMARY: Get MY suppliers
    static async getMyEnterpriseSuppliers() {
        const response = await axios.get(`${this.BASE_URL}/business-partners/my-suppliers`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    // ✅ PRIMARY: Get MY clients
    static async getMyEnterpriseClients() {
        const response = await axios.get(`${this.BASE_URL}/business-partners/my-clients`, {
            headers: this.getHeader()
        })
        return response.data;
    }


    /**TRANSACTIONS ENDPOINTS - ✅ CORRECTED */

    static async purchaseProduct(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/purchase`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async sellProduct(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/sell`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }
    
    static async returnToSupplier(body) {
        const response = await axios.post(`${this.BASE_URL}/transactions/return`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async deleteTransaction(transactionId) {
        const response = await axios.delete(`${this.BASE_URL}/transactions/delete/${transactionId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    // ✅ For SUPER_ADMIN only
    static async getAllTransactions(page = 0, size = 10, filter = "") {
        const response = await axios.get(`${this.BASE_URL}/transactions/all`, {
            headers: this.getHeader(),
            params: { page, size, filter }
        })
        return response.data;
    }

    static async getTransactionById(transactionId) {
        const response = await axios.get(`${this.BASE_URL}/transactions/${transactionId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getTransactionsByMonthAndYear(month, year) {
        const response = await axios.get(`${this.BASE_URL}/transactions/month/${month}/year/${year}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async updateTransactionStatus(transactionId, status) {
        const response = await axios.put(`${this.BASE_URL}/transactions/${transactionId}/status`, null, {
            params: { status },
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getTransactionsByPartner(partnerId, page = 0, size = 10) {
        const response = await axios.get(`${this.BASE_URL}/transactions/partner/${partnerId}`, {
            params: { page, size },
            headers: this.getHeader()
        })
        return response.data;
    }

    // ✅ PRIMARY: Get MY enterprise transactions
    static async getMyEnterpriseTransactions(page = 0, size = 10) {
        const response = await axios.get(`${this.BASE_URL}/transactions/my-transactions`, {
            params: { page, size },
            headers: this.getHeader()
        })
        return response.data;
    }








    /////////// payment //////////////////

    // récupérer les plans (sans authentification si le backend ne l’exige pas)
    static async getPaymentPlans() {
        const response = await axios.get(
            `${this.BASE_URL}/payment/plans`,
             {
                headers: this.getHeader() // ← OBLIGATOIRE
             }
        );
        return response.data;
    }

    // checkout (avec token)
    static async checkout(planId) {
        const response = await axios.post(
            `${this.BASE_URL}/payment/checkout`,
            { planId: planId },
            {
                headers: this.getHeader() // token déchiffré automatiquement
            }
        );
        return response.data;
    }


    /////////// payment //////////////////

static async confirmPayment(sessionId) {
    const response = await axios.post(
        `${this.BASE_URL}/payment/confirm?sessionId=${sessionId}`,
        {},
    {
      headers: this.getHeader()
    }
    );
    return response.data;
}



/////////// SUBSCRIPTION //////////////////

static async getMySubscription() {
    const response = await axios.get(
        `${this.BASE_URL}/payment/my-subscription`,
        {
            headers: this.getHeader()
        }
    );
    return response.data;
}
}



