import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const navItems = [
    { 
      path: '/', 
      label: 'Home'
    },
    { 
      path: '/disease-prediction', 
      label: 'Crops',
      requireAuth: true
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
      isSpecial: true,
      requireAuth: true
    }
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Filter nav items based on auth status
  const filteredNavItems = navItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated)
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">KisanSewa</span>
              <span className="text-sm font-medium text-green-600">കർഷക സേവനം</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
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
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name || 'User'}</span>
                </button>
                
                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">+91 {user?.mobileNumber}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
              >
                Login
              </button>
            )}
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
              {filteredNavItems.map((item) => (
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
              
              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">+91 {user?.mobileNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mx-2 bg-green-600 text-white rounded-lg px-4 py-3 text-sm font-medium text-center"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
