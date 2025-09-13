import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Database
} from 'lucide-react';
import { LANGUAGES } from '../utils/constants';
import { cn } from '../utils/cn';

const Sidebar = ({ 
  isCollapsed, 
  onToggle, 
  onNewChat,
  language,
  onLanguageChange,
  knowledgeBaseStatus,
  isLoading,
  quickQuestions,
  onQuickQuestionSelect,
  threads,
  currentThreadId,
  onThreadSelect
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
      {/* New Chat Button with Toggle */}
      <div className="p-2">
        {isCollapsed ? (
          // Collapsed layout - stack vertically
          <div className="flex flex-col gap-2">
            <button
              onClick={onNewChat}
              className="flex items-center justify-center w-12 h-10 mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
            </button>
            
            {/* Toggle Button */}
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-12 h-8 mx-auto rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Expanded layout - side by side
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex items-center justify-center space-x-2 flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
            
            {/* Toggle Button */}
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
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

          {/* Conversations Section */}
          <button
            onClick={() => setActiveSection('conversations')}
            className={cn(
              "flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors text-sm",
              activeSection === 'conversations' 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {!isCollapsed && <span>My Conversations</span>}
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

            {/* My Conversations */}
            {activeSection === 'conversations' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 mb-3 text-sm">My Conversations</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {threads.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No conversations yet</p>
                      <p className="text-xs text-gray-400">Start a new chat to begin</p>
                    </div>
                  ) : (
                    threads.slice(0, 10).map((threadId, index) => {
                      const shortId = threadId.slice(0, 8);
                      const isActive = threadId === currentThreadId;
                      
                      return (
                        <button
                          key={threadId}
                          onClick={() => onThreadSelect(threadId)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 border",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-3 h-3" />
                            <span>💬 {shortId}...</span>
                          </div>
                        </button>
                      );
                    })
                  )}
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