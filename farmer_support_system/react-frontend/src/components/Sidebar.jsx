import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Volume2,
  Mic,
  Globe,
  Database,
  Sparkles
} from 'lucide-react';
import { VOICE_LANGUAGES, LANGUAGES } from '../utils/constants';
import VoiceRecorder from './VoiceRecorder';
import { cn } from '../utils/cn';

const Sidebar = ({ 
  isCollapsed, 
  onToggle, 
  onNewChat,
  language,
  onLanguageChange,
  voiceLanguage,
  onVoiceLanguageChange,
  onVoiceQuery,
  knowledgeBaseStatus,
  isLoading,
  quickQuestions,
  onQuickQuestionSelect
}) => {
  const [activeSection, setActiveSection] = useState('chat');

  const getStatusColor = () => {
    const { total_documents, processed_chunks } = knowledgeBaseStatus;
    if (total_documents > 0 && processed_chunks > 0) return 'text-emerald-600';
    if (total_documents > 0) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    const { total_documents, processed_chunks } = knowledgeBaseStatus;
    if (total_documents > 0 && processed_chunks > 0) return 'Ready';
    if (total_documents > 0) return 'Processing...';
    return 'No documents';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AgriBot</h2>
              <p className="text-xs text-gray-500">AI Farming Assistant</p>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors",
            isCollapsed ? "mx-auto mt-2" : "ml-auto -mr-1"
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className={cn(
            "flex items-center justify-center space-x-2 w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md",
            isCollapsed ? "px-2" : ""
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-medium">New Chat</span>}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {/* Chat Section */}
          <button
            onClick={() => setActiveSection('chat')}
            className={cn(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors text-sm",
              activeSection === 'chat' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {!isCollapsed && <span>Quick Questions</span>}
          </button>

          {/* Settings Section */}
          <button
            onClick={() => setActiveSection('settings')}
            className={cn(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors text-sm",
              activeSection === 'settings' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          {/* Voice Section */}
          <button
            onClick={() => setActiveSection('voice')}
            className={cn(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors text-sm",
              activeSection === 'voice' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Mic className="w-4 h-4" />
            {!isCollapsed && <span>Voice Input</span>}
          </button>

          {/* Status Section */}
          <button
            onClick={() => setActiveSection('status')}
            className={cn(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors text-sm",
              activeSection === 'status' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Database className="w-4 h-4" />
            {!isCollapsed && <span>System Status</span>}
          </button>
        </div>

        {/* Content Area */}
        {!isCollapsed && (
          <div className="p-4 space-y-6">
            {/* Quick Questions */}
            {activeSection === 'chat' && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3 text-sm">Quick Questions</h3>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => onQuickQuestionSelect(question)}
                      className="w-full text-left p-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    <span>Response Language</span>
                  </label>
                  <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Voice Input */}
            {activeSection === 'voice' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900 text-sm">Voice Input</h3>
                  </div>
                  <p className="text-xs text-blue-700 mb-4">
                    Record your question and get instant advice in your preferred language.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Speech Language
                      </label>
                      <select
                        value={voiceLanguage}
                        onChange={(e) => onVoiceLanguageChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {VOICE_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    
                    <VoiceRecorder 
                      onVoiceQuery={onVoiceQuery}
                      voiceLanguage={voiceLanguage}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* System Status */}
            {activeSection === 'status' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900 text-sm">Knowledge Base</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={cn("text-sm font-medium", getStatusColor())}>
                      <span className="inline-block w-2 h-2 rounded-full bg-current mr-2"></span>
                      {getStatusText()}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-lg font-bold text-gray-900">
                          {knowledgeBaseStatus.total_documents}
                        </div>
                        <div className="text-xs text-gray-600">Documents</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-lg font-bold text-gray-900">
                          {knowledgeBaseStatus.processed_chunks}
                        </div>
                        <div className="text-xs text-gray-600">Chunks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 h-full",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      {sidebarContent}
    </div>
  );
};

export default Sidebar;