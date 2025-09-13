import React, { useState, useRef } from 'react';
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
  const resultsRef = useRef(null);

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
      
      // Smooth scroll to results section after prediction is received
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutPrediction = () => {
    if (predictionResults?.prediction) {
      // Create a detailed question with prediction data
      const confidence = getConfidence();
      const topProbabilities = getProbabilityData().slice(0, 3);
      
      let question = `I just analyzed a plant image and received these disease prediction results:\n\n`;
      question += `🔍 **Primary Prediction**: ${predictionResults.prediction}\n`;
      question += `📊 **Confidence Level**: ${confidence.toFixed(1)}%\n\n`;
      
      if (topProbabilities.length > 0) {
        question += `📈 **Top Predictions**:\n`;
        topProbabilities.forEach((item, index) => {
          question += `${index + 1}. ${item.class}: ${item.probability.toFixed(1)}%\n`;
        });
        question += `\n`;
      }
      
      question += `💡 **Please provide**:\n`;
      question += `• Detailed information about this plant condition\n`;
      question += `• Treatment recommendations and remedies\n`;
      question += `• Prevention strategies for future occurrences\n`;
      question += `• Any immediate steps I should take\n`;
      question += `• Expected timeline for recovery\n\n`;
      question += `Thank you for your expert agricultural advice!`;

      setPendingInput(question);
      navigateToChat(question); // Navigate to chat page with the detailed question
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
    <div className="min-h-screen bg-slate-50/50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Modern Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Plant Disease Detection</h1>
              <p className="text-slate-600 text-base">Advanced AI-powered plant health analysis</p>
            </div>
          </div>
        </div>

        {/* Modern Upload Section */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-lg shadow-slate-900/5 overflow-hidden">
            <div className="bg-green-600/90 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Upload Plant Image</h2>
                </div>
                <div className="text-slate-300 text-sm font-medium">
                  Step 1 of 2
                </div>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="bg-blue-50 border border-blue-200/50 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Get the best results</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Take a clear, well-lit photo of the affected plant area. Include both diseased and healthy parts for accurate AI analysis.
                    </p>
                  </div>
                </div>
              </div>
                
              <div className="space-y-6">
                <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  !preview 
                    ? 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30' 
                    : 'border-emerald-400 bg-emerald-50/30'
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
                      className="cursor-pointer flex flex-col items-center space-y-6 group"
                    >
                      <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-700 transition-all duration-300 shadow-lg">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-xl font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Choose plant image
                        </div>
                        <div className="text-slate-600 text-sm max-w-xs">
                          Drop your image here or click to browse
                        </div>
                        <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                          <span>JPG</span>
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <span>PNG</span>
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <span>Max 10MB</span>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Plant Preview"
                          className="w-full h-80 object-cover rounded-2xl shadow-xl border border-slate-200"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg border border-white/20">
                          {selectedFile?.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {preview && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !selectedFile}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    <Search className="w-5 h-5" />
                    <span>{loading ? 'Analyzing...' : 'Analyze Plant Disease'}</span>
                  </button>
                )}
                
                {/* Photography Tips */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <span className="text-lg">📸</span>
                    </div>
                    Photography Guidelines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">Good lighting & sharp focus</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">Clear affected areas</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">Include healthy tissue</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">Avoid blur & darkness</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Modern Results Section */}
        {(predictionResults || loading || error) && (
          <div ref={resultsRef} className="mt-8">
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-lg shadow-slate-900/5 overflow-hidden">
              <div className="bg-green-600/90  px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                </div>
              </div>
              
              <div className="p-8">
                {loading && (
                  <div className="text-center py-16 space-y-6">
                    <div className="relative inline-flex">
                      <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🔍</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Analyzing your plant</h3>
                      <p className="text-slate-600">Our AI is examining your image for disease patterns...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⚠️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">Analysis Failed</h3>
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {predictionResults && (
                  <div className="space-y-8">
                    {/* Main Result Card */}
                    <div className="text-center p-8 bg-emerald-50 border border-emerald-200/50 rounded-2xl">
                      <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🏥</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Disease Detection Complete
                      </h3>
                      <div className="text-4xl font-bold text-emerald-600 mb-4 tracking-tight">
                        {predictionResults.prediction || 'No prediction available'}
                      </div>
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
                        Confidence: {getConfidence().toFixed(1)}%
                      </div>
                    </div>

                    {/* Confidence Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-lg">📊</span>
                          </div>
                          Confidence Level
                        </h3>
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ${
                                  getConfidence() >= 80 ? 'bg-emerald-500' :
                                  getConfidence() >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${getConfidence()}%` }}
                              />
                            </div>
                            <div className="text-right mt-2">
                              <span className="text-2xl font-bold text-slate-900">{getConfidence().toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Low (0-59%)</span>
                            <span>Medium (60-79%)</span>
                            <span>High (80-100%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Probability Distribution */}
                      {predictionResults.probabilities && predictionResults.probabilities.length > 1 && (
                        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6">
                          <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center mr-3">
                              <span className="text-lg">📈</span>
                            </div>
                            Top Predictions
                          </h3>
                          <div className="space-y-3">
                            {getProbabilityData().slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                                  index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700">{item.class}</span>
                                    <span className="text-sm font-bold text-slate-900">{item.probability.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-1000 ${
                                        index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-slate-500'
                                      }`}
                                      style={{ width: `${item.probability}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleAskAboutPrediction}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Get Treatment Advice</span>
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="flex-1 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Analyze Another Plant</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DiseasePredictionPage;
