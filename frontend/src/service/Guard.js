import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

export const ProtectedRoute = ({ element: Component }) => {
    const location = useLocation();
    return ApiService.isAuthenticated()
        ? (Component || <Outlet />)
        : <Navigate to="/login" replace state={{ from: location }} />;
};

export const AdminRoute = ({ element: Component }) => {
    const location = useLocation();
    
    // ✅ Vérifier d'abord l'authentification
    if (!ApiService.isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // ✅ Puis vérifier le rôle admin
    if (!ApiService.isAdmin()) {
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
    }
    
    // ✅ Retourner le composant OU Outlet
    return Component || <Outlet />;
};


export const SuperAdminRoute = ({ element: Component }) => {
    const location = useLocation();
    
    // ✅ Vérifier d'abord l'authentification
    if (!ApiService.isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // ✅ Puis vérifier le rôle admin
    if (!ApiService.isSuperAdmin()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // ✅ Retourner le composant OU Outlet
    return Component || <Outlet />;
};