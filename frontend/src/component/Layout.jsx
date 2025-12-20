import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({children}) => {
    return(
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Sidebar flottante */}
            <Sidebar/>
            
            {/* Main Content Area - avec marge réduite pour éviter le chevauchement */}
            <div className="ml-0 lg:ml-80 p-6">
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;