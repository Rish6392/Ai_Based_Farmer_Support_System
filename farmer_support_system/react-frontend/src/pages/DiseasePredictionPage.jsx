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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌾 Plant Disease Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image of your plant to get instant AI-powered disease diagnosis and treatment recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <Card.Header className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <Card.Title className="text-xl font-semibold flex items-center">
                  <Upload className="w-6 h-6 mr-2" />
                  Upload Plant Image
                </Card.Title>
              </Card.Header>
              <Card.Content className="p-6 space-y-6">
                <Alert type="info" className="border-green-200 bg-green-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">💡</span>
                    <span>Take a clear photo of the affected plant area for best results</span>
                  </div>
                </Alert>
                
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center relative transition-all duration-300 ${
                    !preview 
                      ? 'border-green-300 hover:border-green-400 hover:bg-green-50' 
                      : 'border-green-500 bg-green-50'
                  }`}>
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
                        className="cursor-pointer flex flex-col items-center space-y-4 group"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-lg font-medium text-gray-700 group-hover:text-green-600">
                            Click to upload or drag & drop
                          </span>
                          <span className="text-sm text-gray-500 block">
                            Supported formats: JPG, JPEG, PNG (Max 10MB)
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="relative group">
                        <img
                          src={preview}
                          alt="Plant Preview"
                          className="w-full h-80 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
                          <span className="font-medium">{selectedFile?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {preview && (
                    <Button
                      onClick={handleAnalyze}
                      disabled={loading || !selectedFile}
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                      loading={loading}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      {loading ? 'Analyzing Plant...' : 'Analyze Plant Disease'}
                    </Button>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <Card.Content className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📸</span>
                  Photography Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Ensure good lighting and focus
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Capture the affected area clearly
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Include surrounding healthy tissue
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Avoid blurry or dark images
                  </li>
                </ul>
              </Card.Content>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <Card.Header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <Card.Title className="text-xl font-semibold flex items-center">
                  <Search className="w-6 h-6 mr-2" />
                  Analysis Results
                </Card.Title>
              </Card.Header>
              <Card.Content className="p-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <Loading text="Analyzing your plant image..." />
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert type="error" className="mb-6 border-red-200 bg-red-50">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </Alert>
                )}

                {predictionResults ? (
                  <div className="space-y-6">
                    {/* Main Prediction */}
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-4xl mb-3">🏥</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Detected Disease
                      </h3>
                      <p className="text-3xl font-bold text-green-600 mb-2">
                        {predictionResults.prediction || 'No prediction available'}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                        Confidence: {getConfidence().toFixed(1)}%
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📊</span>
                        Confidence Level
                      </h3>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${
                              getConfidence() >= 80 ? 'bg-green-500' :
                              getConfidence() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getConfidence()}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>

                    {/* Probability Distribution */}
                    {predictionResults.probabilities && predictionResults.probabilities.length > 1 && (
                      <div className="p-6 bg-blue-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <span className="text-2xl mr-2">📈</span>
                          Probability Distribution
                        </h3>
                        <div className="space-y-3">
                          {getProbabilityData().slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="w-20 text-sm font-medium text-gray-700">
                                {item.class}
                              </div>
                              <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                                  style={{ width: `${item.probability}%` }}
                                />
                              </div>
                              <div className="w-16 text-sm font-semibold text-right text-blue-600">
                                {item.probability.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                        onClick={handleAskAboutPrediction}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 transform hover:scale-[1.02] transition-all duration-200"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Get Treatment Advice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 transform hover:scale-[1.02] transition-all duration-200"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Analyze Another Plant
                      </Button>
                    </div>
                  </div>
                ) : !loading && (
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-xl font-semibold text-gray-700">
                      Ready for Analysis
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Upload an image of your plant to get instant disease detection and treatment recommendations
                    </p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseasePredictionPage;
