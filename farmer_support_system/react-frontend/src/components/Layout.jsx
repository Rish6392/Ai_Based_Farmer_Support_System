import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  
  // Don't show navbar on landing page
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show navbar only when not on landing page */}
      {<Navbar />}
      
      {/* Main Content */}
      <main className="relative">
        <Outlet />
      </main>

      {/* Footer - only show when not on landing page */}
      {!isLandingPage && (
        <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌾</span>
                </div>
                <span className="font-medium">KisanSewa</span>
              </div>
              <div className="text-sm text-gray-400">
                © 2024 Smart Agriculture Solutions. Powered by AI Technology.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
