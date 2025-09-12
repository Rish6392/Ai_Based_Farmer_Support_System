import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '../utils/cn';

const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  onKeyPress, 
  disabled, 
  placeholder = "Type your farming question here...",
  isCentered = false 
}) => {
  const textareaRef = useRef(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  if (isCentered) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to KisanSewa!
            </h1>
            <p className="text-lg text-gray-600">
              Your AI-powered farming assistant. How can I help you today?
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white rounded-2xl border border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className="w-full resize-none rounded-2xl px-6 py-4 pr-16 text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                style={{
                  minHeight: '60px',
                  maxHeight: '120px'
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!value.trim() || disabled}
                  className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          
          {/* Quick suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "What crops should I plant?",
              "How to identify diseases?",
              "Irrigation best practices",
              "Soil improvement tips"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onChange({ target: { value: suggestion } })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative bg-gray-50 rounded-2xl border border-gray-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl px-4 py-3 pr-24 text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            style={{
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md ml-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;