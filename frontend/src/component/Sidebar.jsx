// import React from "react";
// import { Link } from "react-router-dom";
// import ApiService from "../service/ApiService";

// const logout = () => {
//   ApiService.logout();
// };

// const Sidebar = () => {
//   const isAuth = ApiService.isAuthenticated();
//   const isAdmin = ApiService.isAdmin();

//   return (
//     <div className="sidebar" >
       
//           <Link className="navbar-brand d-flex align-items-center" to="/">
//                         <img 
//                           src="/images/stock_logo-removebg-preview.png"
//                           alt="Logo OCP" 
//                           style={{ height: '150px', width: 'auto', transition: 'opacity 0.3s ease', marginTop: '-20px' }} 
//                         />
//                       </Link>
                    

//       <ul className="nav-links">
//         {isAuth && (
//           <li>
//             <Link to="/dashboard">Dashboaard</Link>
//           </li>
//         )}

//         {isAuth && (
//           <li>
//             <Link to="/transaction">Transactions</Link>
//           </li>
//         )}

//         {isAdmin && (
//           <li>
//             <Link to="/category">Category</Link>
//           </li>
//         )}

//         {isAdmin && (
//           <li>
//             <Link to="/product">Product</Link>
//           </li>
//         )}

//         {isAdmin && (
//           <li>
//             <Link to="/supplier">Supplier</Link>
//           </li>
//         )}

//         {isAuth && (
//           <li>
//             <Link to="/purchase">Purchase</Link>
//           </li>
//         )}

//         {isAuth && (
//           <li>
//             <Link to="/sell">Sell</Link>
//           </li>
//         )}

//         {isAuth && (
//           <li>
//             <Link to="/profile">Profile</Link>
//           </li>
//         )}

//         {isAuth && (
//           <li>
//             <Link onClick={logout} to="/login">
//               Logout
//             </Link>
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;



import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import ApiService from "../service/ApiService";

const logout = () => {
  ApiService.logout();
};

const Sidebar = () => {
  const location = useLocation();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isSuperAdmin = ApiService.isSuperAdmin();
  const isManager = ApiService.isManager();

  const isAdminOrManager = isAdmin || isManager;

  // Configuration des éléments de menu avec icônes
  const menuItems = [
    { name: "Dashboard", path: "/super-admin/dashboard", icon: <LucideIcons.Home size={20} />, auth: isSuperAdmin },
    { name: "Dashboard", path: "/dashboard", icon: <LucideIcons.Home size={20} />, auth: isAdminOrManager },
    { name: "Transactions", path: "/transactions", icon: <LucideIcons.FileText size={20} />, auth: isAdminOrManager },
    { name: "Category", path: "/category", icon: <LucideIcons.Folder size={20} />, auth: isAdminOrManager },
    { name: "Product", path: "/product", icon: <LucideIcons.Box size={20} />, auth: isAdminOrManager },
    { name: "My Enterprise", path: "/my-entreprise", icon: <LucideIcons.Building size={20} />, auth: isAdmin },
    { name: "User Management", path: "/UserManagementPage", icon: <LucideIcons.Users size={20} />, auth: isAdmin },
    { name: "Profile", path: "/profile", icon: <LucideIcons.User size={20} />, auth: isAuth },
        { name: "Pricing", path: "/pricing", icon: <LucideIcons.Home size={20} />, auth: isAdminOrManager },
    { name: "Subscribtion", path: "/mySubscription", icon: <LucideIcons.Home size={20} />, auth: isAdminOrManager },


    { name: "Logout", path: "/login", icon: <LucideIcons.LogOut size={20} />, auth: isAuth, action: logout },
  ];

  return (
    <div className="fixed top-6 left-6 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-5 w-72 z-50 border border-gray-200/50 h-[90vh] flex flex-col">
      {/* Header avec logo */}
      <div className="flex-shrink-0 mb-4">
        <Link className="block" to="/">
          <img 
            src="/images/stock_logo-removebg-preview.png"
            alt="Logo OCP" 
            className="h-32 w-auto mx-auto -mt-2"
          />
        </Link>
      </div>

      {/* Navigation Menu - zone scrollable */}
      <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
        <ul className="flex flex-col gap-1.5">
          {menuItems.map(
            (item) =>
              item.auth && (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={item.action ? item.action : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium group ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:translate-x-1'
                    }`}
                  >
                    <span className={`transition-transform group-hover:scale-110 ${
                      location.pathname === item.path ? 'text-white' : 'text-gray-500'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              )
          )}
        </ul>
      </nav>

      {/* Footer avec rôle utilisateur - toujours en bas */}
      <div className="pt-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {isAdmin ? 'A' : isManager ? 'M' : 'U'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-900">
              {isAdmin ? 'Administrator' : isManager ? 'Manager' : 'User'}
            </p>
            <p className="text-xs text-gray-500">Active Session</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Style pour la scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #14b8a6, #06b6d4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0d9488, #0891b2);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;