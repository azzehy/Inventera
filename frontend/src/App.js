import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute, SuperAdminRoute } from "./service/Guard";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CategoryPage from "./pages/CategoryPage";
import SupplierPage from "./pages/SupplierPage";
import AddEditBusinessPartnerPage from "./pages/AddEditBusinessPartnerPage";
import PartnersPage from "./pages/PartnersPage";

import ProductPage from "./pages/ProductPage";
import AddEditProductPage from "./pages/AddEditProductPage";
import PurchasePage from "./pages/PurchasePage";
import SellPage from "./pages/SellPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import CreateTransactionPage from "./pages/CreateTransactionPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import EnterpriseDetailsPage from "./pages/EnterpriseDetailsPage";
import MyEnterprisePage from "./pages/MyEnterprisePage";
import UserManagementPage from "./pages/UserManagementPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import PricingPage from "./pages/PricingPage";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentSuccess from "./pages/PaymentSuccess";
import SubscriptionPage from "./pages/SubscriptionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />


        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/mySubscription" element={<SubscriptionPage />} />


        {/* ADMIN ROUTES */}
        <Route path="/category" element={<AdminRoute element={<CategoryPage/>}/>}/>
        <Route path="/product" element={<AdminRoute element={<ProductPage/>}/>}/>


        <Route path="/add-product" element={<AdminRoute element={<AddEditProductPage/>}/>}/>
        <Route path="/edit-product/:productId" element={<AdminRoute element={<AddEditProductPage/>}/>}/>

  


{/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Transaction Routes */}
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transaction/create" element={<CreateTransactionPage />} />
          <Route path="/transaction/:id" element={<TransactionDetailsPage />} />
        </Route>


        <Route
          path="/partners/add"
          element={<AdminRoute element={<AddEditBusinessPartnerPage />} />}
        />

        <Route
          path="/partners/edit/:id"
          element={<AdminRoute element={<AddEditBusinessPartnerPage />} />}
        />

         <Route
          path="/partners"
          element={<AdminRoute element={<PartnersPage />} />}
        />



        {/* Routes Super Admin */}
        <Route 
          path="/super-admin/dashboard" 
          element={<SuperAdminRoute element={<SuperAdminDashboard/>}/>}
        />
        <Route 
          path="/super-admin/enterprise/:enterpriseId" 
          element={<SuperAdminRoute element={<EnterpriseDetailsPage/>}/>}
        />



{/* zakaria routes */}
        <Route path="/my-entreprise" element={<AdminRoute element={<MyEnterprisePage/>}/>}/>
        <Route path="/UserManagementPage" element={<AdminRoute element={<UserManagementPage/>}/>}/>
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage/>}/>}/>
        <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage/>}/>}/>
        <Route path="/product-details/:productId" element={<ProtectedRoute element={<ProductDetailsPage/>}/>}/>




        <Route path="*" element={<LoginPage/>}/>


        

      </Routes>
    </Router>
  )
}

export default App;
