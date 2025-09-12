import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back to helping farmers!
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          🏠 Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
