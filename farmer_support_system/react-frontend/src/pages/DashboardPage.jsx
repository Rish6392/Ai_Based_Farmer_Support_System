import React from 'react';
import { FileText, Database, Activity, Upload } from 'lucide-react';
import { Card, Button, Alert } from '../components';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Manage your knowledge base and monitor system status
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {processingStatus.total_documents}
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Database className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processed Chunks</p>
              <p className="text-2xl font-bold text-gray-900">
                {processingStatus.processed_chunks}
              </p>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center space-x-4 p-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {getStatusText()}
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <Card.Header>
          <Card.Title>System Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <Alert type={getStatusColor()}>
            <div className="flex items-center justify-between">
              <span>{getStatusText()}</span>
              <div className="flex space-x-2">
                <span className="text-sm">
                  {processingStatus.total_documents} docs, {processingStatus.processed_chunks} chunks
                </span>
              </div>
            </div>
          </Alert>
        </Card.Content>
      </Card>

      {/* Document Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Documents */}
        <Card>
          <Card.Header>
            <Card.Title>Upload Documents</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Alert type="info">
              Upload PDF, Word documents, or text files to expand the knowledge base
            </Alert>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Choose documents to upload
                </span>
                <span className="text-xs text-gray-400">
                  PDF, DOC, DOCX, TXT, MD files supported
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSync}
                variant="outline"
                disabled={loading}
                loading={loading}
              >
                Sync Documents
              </Button>
              <Button
                onClick={handleReindex}
                variant="outline"
                disabled={loading}
                loading={loading}
              >
                Reindex All
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Document List */}
        <Card>
          <Card.Header>
            <Card.Title>Knowledge Base Documents</Card.Title>
          </Card.Header>
          <Card.Content>
            {documents.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{doc}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No documents in knowledge base</p>
                <p className="text-sm">Upload documents to get started</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Footer Info */}
      <Card>
        <Card.Content className="text-center py-6">
          <p className="text-sm text-gray-600">
            Built with LangGraph, RAG, and React
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Digital Krishi Officer
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default DashboardPage;
