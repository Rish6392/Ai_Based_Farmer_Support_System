import React from 'react';
import { FileText, Database, Activity, Upload, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { Card, Button, Alert, ProactiveAlerts } from '../components';
import { useDocuments } from '../context';

const DashboardPage = () => {
  const {
    documents,
    processingStatus,
    loading,
    error,
    uploadDocument,
    syncDocuments,
    reindexDocuments,
    clearError,
  } = useDocuments();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadDocument(file);
        // Reset input
        event.target.value = '';
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleSync = async () => {
    try {
      await syncDocuments();
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const handleReindex = async () => {
    try {
      await reindexDocuments();
    } catch (err) {
      console.error('Reindex failed:', err);
    }
  };

  const getStatusColor = () => {
    const { total_documents, processed_chunks } = processingStatus;
    if (total_documents > 0 && processed_chunks > 0) return 'success';
    if (total_documents > 0) return 'warning';
    return 'info';
  };

  const getStatusText = () => {
    const { total_documents, processed_chunks } = processingStatus;
    if (total_documents > 0 && processed_chunks > 0) return 'System Ready';
    if (total_documents > 0) return 'Processing Documents...';
    return 'No Documents';
  };

  const getSystemHealthScore = () => {
    const { total_documents, processed_chunks } = processingStatus;
    if (total_documents === 0) return 0;
    return Math.round((processed_chunks / (total_documents * 10)) * 100);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-3 bg-gradient-primary text-white px-6 py-3 rounded-full shadow-lg">
          <BarChart3 className="w-6 h-6" />
          <h1 className="text-2xl font-bold">System Dashboard</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Monitor your AI farming assistant's knowledge base and system performance metrics
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={clearError}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">System Error:</span>
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover:shadow-colored transition-all duration-300">
          <div className="card-body flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <FileText className="w-7 h-7 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">
                {processingStatus.total_documents}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Knowledge Base
              </p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-colored transition-all duration-300">
          <div className="card-body flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
              <Database className="w-7 h-7 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Processed Chunks</p>
              <p className="text-3xl font-bold text-gray-900">
                {processingStatus.processed_chunks}
              </p>
              <p className="text-xs text-yellow-600 flex items-center mt-1">
                <Zap className="w-3 h-3 mr-1" />
                Ready for AI
              </p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-colored transition-all duration-300">
          <div className="card-body flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <Activity className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-lg font-bold text-gray-900">
                {getStatusText()}
              </p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                Online
              </p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-colored transition-all duration-300">
          <div className="card-body flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <TrendingUp className="w-7 h-7 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {getSystemHealthScore()}%
              </p>
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <BarChart3 className="w-3 h-3 mr-1" />
                Performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Weather Alerts */}
      <div className="space-y-4">
        <ProactiveAlerts 
          showDistrictSelector={true}
          refreshInterval={10 * 60 * 1000} // 10 minutes
          className="shadow-md"
        />
      </div>

      {/* Enhanced System Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            System Health Monitor
          </h3>
        </div>
        <div className="card-body">
          <Alert type={getStatusColor()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  getStatusColor() === 'success' ? 'bg-green-400 animate-pulse' : 
                  getStatusColor() === 'warning' ? 'bg-yellow-400 animate-pulse' : 
                  'bg-blue-400'
                }`}></div>
                <span className="font-medium">{getStatusText()}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {processingStatus.total_documents} documents • {processingStatus.processed_chunks} chunks ready
                </div>
                <div className="text-xs text-gray-500">
                  Health Score: {getSystemHealthScore()}%
                </div>
              </div>
            </div>
            
            {/* Progress bar for processing status */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Processing Progress</span>
                <span>{getSystemHealthScore()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getSystemHealthScore()}%` }}
                ></div>
              </div>
            </div>
          </Alert>
        </div>
      </div>

      {/* Enhanced Document Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Documents */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              Document Upload Center
            </h3>
          </div>
          <div className="card-body space-y-4">
            <Alert type="info">
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Expand Your Knowledge Base</p>
                  <p className="text-sm">Upload agricultural documents, research papers, and farming guides to enhance AI responses</p>
                </div>
              </div>
            </Alert>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
                disabled={loading}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-700">
                    Choose documents to upload
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT, MD files supported • Max 10MB per file
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleSync}
                variant="outline"
                disabled={loading}
                loading={loading}
                className="btn-outline hover:btn-primary"
              >
                <Database className="w-4 h-4 mr-2" />
                Sync Documents
              </Button>
              <Button
                onClick={handleReindex}
                variant="outline"
                disabled={loading}
                loading={loading}
                className="btn-outline hover:btn-secondary"
              >
                <Activity className="w-4 h-4 mr-2" />
                Reindex All
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Document List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Knowledge Base Library
              </span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {documents.length} files
              </span>
            </h3>
          </div>
          <div className="card-body">
            {documents.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{doc}</span>
                        <p className="text-xs text-gray-500">Agricultural document</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No documents uploaded yet</h4>
                <p className="text-sm mb-4">Upload agricultural documents to enhance your AI assistant's knowledge</p>
                <div className="inline-flex items-center text-sm text-gray-400">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                  Ready to accept PDF, Word, and text files
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-0">
        <div className="card-body text-center py-8">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🌾</span>
            </div>
            <span className="text-lg font-semibold text-gray-700">Digital Krishi Officer</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Powered by Advanced AI • RAG Technology • React Frontend
          </p>
          <p className="text-xs text-gray-500">
            © 2024 Smart Agriculture Solutions • Built for Kerala Farmers
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
