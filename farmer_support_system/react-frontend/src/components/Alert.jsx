import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  children, 
  className = '',
  onClose 
}) => {
  const types = {
    success: {
      className: 'alert-success',
      icon: CheckCircle
    },
    error: {
      className: 'alert-error',
      icon: XCircle
    },
    warning: {
      className: 'alert-warning',
      icon: AlertCircle
    },
    info: {
      className: 'alert-info',
      icon: Info
    }
  };
  
  const { className: alertClass, icon: Icon } = types[type];
  
  return (
    <div className={`alert ${alertClass} flex items-start space-x-3 ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5 transition-colors duration-200"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
