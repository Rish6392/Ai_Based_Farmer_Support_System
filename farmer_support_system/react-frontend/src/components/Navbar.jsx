import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    { 
      path: '/', 
      label: 'Ask Expert',
      icon: '💬',
      description: 'Chat with AI assistant'
    },
    { 
      path: '/disease-prediction', 
      label: 'Disease Detection',
      icon: '🌿',
      description: 'Diagnose crop diseases'
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      icon: '📊',
      description: 'View analytics & insights'
    },
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto">
        <nav className="flex items-center justify-center lg:justify-start space-x-1 px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative px-6 py-4 flex items-center space-x-3 transition-all duration-200 border-b-3 ${
                  isActive
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <div className="hidden sm:block">
                    <div className={`font-semibold text-sm ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-500'} group-hover:text-green-600`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 pointer-events-none"></div>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-600/0 group-hover:from-green-500/5 group-hover:to-green-600/5 transition-all duration-200 pointer-events-none"></div>
                </>
              )}
            </NavLink>
          ))}
          
          {/* Mobile menu indicator */}
          <div className="sm:hidden ml-auto">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </nav>
        
        {/* Navigation enhancement line */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>
      </div>
    </div>
  );
};

export default Navbar;
