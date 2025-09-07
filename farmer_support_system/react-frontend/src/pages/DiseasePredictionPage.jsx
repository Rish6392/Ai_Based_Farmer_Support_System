import React, { useState } from 'react';
import { Upload, Search, MessageCircle, X } from 'lucide-react';
import { Button, Card, Loading, Alert } from '../components';
import { diseaseService } from '../services';
import { useChat } from '../context';
import { useAppNavigation } from '../utils';

const DiseasePredictionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictionResults, setPredictionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setPendingInput } = useChat();
  const { navigateToChat } = useAppNavigation();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPredictionResults(null);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setPredictionResults(null);
    setError(null);
    // Clear the input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await diseaseService.predictDisease(selectedFile);
      setPredictionResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutPrediction = () => {
    if (predictionResults?.prediction) {
      const question = `I just received a disease prediction of '${predictionResults.prediction}' from an uploaded image. Can you tell me more about this condition?`;
      setPendingInput(question);
      navigateToChat(question); // Navigate to chat page with the question
    }
  };

  const getConfidence = () => {
    if (!predictionResults?.probabilities) return 0;
    return Math.max(...predictionResults.probabilities) * 100;
  };

  const getProbabilityData = () => {
    if (!predictionResults?.probabilities) return [];
    
    return predictionResults.probabilities
      .map((prob, index) => ({
        class: `Class ${index}`,
        probability: prob * 100
      }))
      .sort((a, b) => b.probability - a.probability);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card>
        <Card.Header>
          <Card.Title>Upload Image</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Alert type="info">
            Upload a medical image for AI-powered disease prediction
          </Alert>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative ">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              {!preview ? (
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Choose a medical image
                  </span>
                  <span className="text-xs text-gray-400">
                    Supported formats: JPG, JPEG, PNG
                  </span>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {selectedFile?.name}
                  </div>
                </div>
              )}
            </div>

            {preview && (
              <Button
                onClick={handleAnalyze}
                disabled={loading || !selectedFile}
                className="w-full"
                loading={loading}
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze Image
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Results Section */}
      <Card>
        <Card.Header>
          <Card.Title>Analysis Results</Card.Title>
        </Card.Header>
        <Card.Content>
          {loading && (
            <div className="flex justify-center py-8">
              <Loading text="Analyzing image..." />
            </div>
          )}

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {predictionResults ? (
            <div className="space-y-6">
              {/* Main Prediction */}
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Predicted Disease
                </h3>
                <p className="text-2xl font-bold text-primary-600">
                  {predictionResults.prediction || 'No prediction available'}
                </p>
              </div>

              {/* Confidence */}
              <div className="text-center p-4 bg-secondary-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confidence
                </h3>
                <p className="text-2xl font-bold text-secondary-600">
                  {getConfidence().toFixed(1)}%
                </p>
              </div>

              {/* Probability Distribution */}
              {predictionResults.probabilities && predictionResults.probabilities.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Probability Distribution
                  </h3>
                  <div className="space-y-2">
                    {getProbabilityData().slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="w-16 text-sm text-gray-600">
                          {item.class}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${item.probability}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm font-medium">
                          {item.probability.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ask in Chat */}
              <div className="border-t pt-4">
                <Button
                  onClick={handleAskAboutPrediction}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask about this prediction in chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Upload and analyze an image to see results here
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default DiseasePredictionPage;
