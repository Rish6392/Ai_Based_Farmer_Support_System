import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      path: '/', 
      label: 'Home'
    },
    { 
      path: '/disease-prediction', 
      label: 'Crops'
    },
    { 
      path: '/faq', 
      label: 'FAQ'
    },
    {
      path: '/contact',
      label: 'Contact Us'
    },
    {
      path: '/chat',
      label: 'Chatbot',
      isSpecial: true
    }
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <span className="text-xl font-bold text-gray-900">KisanSewa</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    item.isSpecial
                      ? 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md'
                      : isActive
                      ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                      : 'text-gray-700 hover:text-green-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-medium transition-colors ${
                      item.isSpecial
                        ? 'bg-green-600 text-white rounded-lg mx-2 text-center'
                        : isActive
                        ? 'text-green-600 bg-green-50 border-r-4 border-green-600'
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
