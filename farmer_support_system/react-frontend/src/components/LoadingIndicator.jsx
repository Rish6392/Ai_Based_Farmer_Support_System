import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '../utils/cn';

const LoadingIndicator = ({ className }) => {
  return (
    <div className={cn("flex gap-4 px-4 py-6", className)}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
        <Bot className="w-5 h-5" />
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="inline-block bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div 
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div 
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">AgriBot is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;