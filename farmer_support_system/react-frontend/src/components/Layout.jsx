import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return '💬 Ask Expert';
      case '/disease-prediction':
        return '🌿 Crop Disease Detection';
      case '/dashboard':
        return '📊 Dashboard';
      default:
        return '🌾 Digital Krishi Officer';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Enhanced Hero Header */}
      <header className="bg-gradient-hero text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <span className="text-3xl">🌾</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  Digital Krishi Officer
                </h1>
                <h2 className="text-2xl font-semibold text-green-100 mb-1">
                  കൃഷി സഹായി
                </h2>
                <p className="text-green-100 text-base">
                  AI-powered farming assistant for Kerala farmers
                </p>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2 text-green-100">
                <span className="w-3 h-3 bg-green-300 rounded-full animate-pulse shadow-lg"></span>
                <span className="text-sm font-medium">AI Assistant Online</span>
              </div>
              <div className="text-sm text-green-200">
                {getPageTitle()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="relative">
          <div className="h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-green-600"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent h-px top-0"></div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content Area with improved spacing */}
      <main className="relative">
        <div className="min-h-[calc(100vh-220px)]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🌾</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-white">Krishi Officer</span>
                  <p className="text-sm text-gray-400">AI Farming Assistant</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Empowering Kerala farmers with cutting-edge AI technology for smarter, more sustainable agriculture.
              </p>
            </div>
            
            {/* Features Section */}
            <div>
              <h3 className="font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Crop Disease Detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Expert Chat Assistant</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Agricultural Dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Voice Support</span>
                </li>
              </ul>
            </div>
            
            {/* Status Section */}
            <div>
              <h3 className="font-semibold text-white mb-3">System Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">AI Services</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-400 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-green-400 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Smart Agriculture Solutions. Powered by AI Technology.
            </div>
            <div className="text-xs text-gray-500">
              Built with ❤️ for Kerala farmers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
