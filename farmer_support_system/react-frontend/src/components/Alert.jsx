import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  children, 
  className = '',
  onClose 
}) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info
    }
  };
  
  const { bg, border, text, icon: Icon } = types[type];
  
  return (
    <div className={`${bg} ${border} ${text} px-4 py-3 rounded-lg border flex items-start ${className}`}>
      <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {children}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
