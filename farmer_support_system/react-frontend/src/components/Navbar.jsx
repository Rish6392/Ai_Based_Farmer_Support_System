import React from 'react';
import { Wheat } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Wheat className="h-8 w-8 text-secondary-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                🌾 Digital Krishi Officer
              </h1>
              <p className="text-sm text-gray-600">
                കൃഷി സഹായി - AI-powered farming assistant for Kerala farmers
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
