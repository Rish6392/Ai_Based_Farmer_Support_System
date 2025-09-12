import React, { useState, useEffect } from 'react';
import { 
  MapPin, CloudRain, Thermometer, Droplets, Wind, 
  Sprout, Leaf, FlaskConical, MessageCircle, AlertTriangle,
  ArrowLeft, Loader2, Cloud, Sun, Eye, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from '../components';
import { useChat } from '../context';

// Kerala Districts with coordinates (from frontend.py)
const KERALA_DISTRICTS = {
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Kollam": [8.8932, 76.6141],
  "Pathanamthitta": [9.2648, 76.7870],
  "Alappuzha": [9.4981, 76.3388],
  "Kottayam": [9.5914, 76.5222],
  "Idukki": [9.9769, 77.0152],
  "Ernakulam": [9.9816, 76.2996],
  "Thrissur": [10.5276, 76.2144],
  "Palakkad": [10.7867, 76.6548],
  "Malappuram": [11.0514, 76.0715],
  "Kozhikode": [11.2588, 75.7804],
  "Wayanad": [11.6854, 76.1320],
  "Kannur": [11.8745, 75.3704],
  "Kasaragod": [12.4993, 74.9868]
};

const LocationPage = () => {
  const navigate = useNavigate();
  const { sendMessage } = useChat();
  
  // State for crop recommender functionality
  const [formData, setFormData] = useState({
    // Soil parameters
    nitrogen: 90,
    phosphorous: 45,
    potassium: 45,
    pH: 6.5,
    
    // Environmental parameters
    temperature: 25.5,
    humidity: 75.0,
    rainfall: 200.0,
    
    // Location and API
    selectedDistrict: 'Ernakulam',
    apiKey: '',
  });

  // State for weather and prediction
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Weather data fetching function
  const fetchWeatherData = async (district) => {
    if (!district) {
      throw new Error('District is required');
    }
    
    const [lat, lon] = KERALA_DISTRICTS[district];
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeather API key.');
      }
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const forecastList = data.list;
    
    if (!forecastList || forecastList.length === 0) {
      throw new Error('No weather data available');
    }
    
    // Get current conditions
    const current = forecastList[0];
    let totalRainfall = 0;
    let maxTemp = -100;
    let maxWindSpeed = 0;
    
    // Calculate 24-hour totals/maximums (8 periods)
    for (let i = 0; i < Math.min(8, forecastList.length); i++) {
      const period = forecastList[i];
      totalRainfall += (period.rain ? period.rain['3h'] || 0 : 0);
      maxTemp = Math.max(maxTemp, period.main.temp_max);
      maxWindSpeed = Math.max(maxWindSpeed, period.wind.speed);
    }
    
    return {
      temperature: current.main.temp,
      humidity: current.main.humidity,
      totalRainfall,
      maxTemp,
      windSpeed: maxWindSpeed * 3.6, // Convert m/s to km/h
      description: current.weather[0].description,
      icon: current.weather[0].icon
    };
  };

  // Generate weather alerts
  const generateWeatherAlerts = (weatherData) => {
    const newAlerts = [];
    if (!weatherData) return newAlerts;

    if (weatherData.totalRainfall > 50) {
      newAlerts.push({
        type: 'warning',
        message: `Heavy Rain Warning: ${weatherData.totalRainfall.toFixed(1)} mm expected in 24 hours. Ensure proper drainage to avoid waterlogging.`
      });
    }

    if (weatherData.maxTemp > 38) {
      newAlerts.push({
        type: 'error',
        message: `Heat Stress Alert: Temperature may reach ${weatherData.maxTemp.toFixed(1)}°C. Provide irrigation to reduce heat stress.`
      });
    }

    if (weatherData.windSpeed > 20) {
      newAlerts.push({
        type: 'warning',
        message: `High Wind Advisory: Winds up to ${weatherData.windSpeed.toFixed(1)} km/h. Protect young or vulnerable plants.`
      });
    }

    return newAlerts;
  };

  // Handle weather fetch
  const handleFetchWeather = async () => {


    setWeatherLoading(true);
    setAlerts([]);
    
    try {
      const weather = await fetchWeatherData(formData.selectedDistrict, formData.apiKey);
      const newAlerts = generateWeatherAlerts(weather);
      
      setWeatherData(weather);
      setAlerts(newAlerts);
      
      // Update form data with weather values
      setFormData(prev => ({
        ...prev,
        temperature: Math.round(weather.temperature * 10) / 10,
        humidity: Math.round(weather.humidity * 10) / 10,
        rainfall: Math.round(weather.totalRainfall * 10) / 10,
      }));
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      setAlerts([{
        type: 'error',
        message: error.message || 'Failed to fetch weather data. Please check your API key and try again.'
      }]);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Handle crop prediction
  const handleCropPrediction = async () => {
    setPredictionLoading(true);
    setAlerts(prev => prev.filter(alert => !alert.message.includes('prediction')));
    
    try {
      // Try to use the backend endpoint - if it doesn't exist, provide local suggestion
      const response = await fetch('/api/predict-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          N: formData.nitrogen,
          P: formData.phosphorous,
          K: formData.potassium,
          temperature: formData.temperature,
          humidity: formData.humidity,
          ph: formData.pH,
          rainfall: formData.rainfall
        })
      });

      if (!response.ok) {
        throw new Error('API not available');
      }

      const result = await response.json();
      setPrediction(result.predicted_crop || result.prediction || 'Unknown');
      
    } catch (error) {
      console.log('Crop prediction API not available, using local logic');
      
      // Provide basic crop recommendation based on Kerala conditions and parameters
      const localPrediction = getLocalCropRecommendation(formData);
      setPrediction(localPrediction);
      
      setAlerts(prev => [...prev, {
        type: 'info',
        message: 'Using basic crop recommendation logic. For advanced AI predictions, the backend crop prediction service needs to be configured.'
      }]);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Local crop recommendation logic for Kerala
  const getLocalCropRecommendation = (params) => {
    const { nitrogen, phosphorous, potassium, pH, temperature, humidity, rainfall } = params;
    
    // Basic rule-based recommendation for Kerala crops
    if (rainfall > 200 && humidity > 70) {
      if (pH >= 5.5 && pH <= 7.0 && temperature >= 20 && temperature <= 30) {
        return "Rice (Paddy)";
      }
    }
    
    if (temperature >= 25 && temperature <= 35 && rainfall >= 100) {
      if (nitrogen >= 80 && phosphorous >= 40) {
        return "Coconut";
      }
    }
    
    if (pH >= 6.0 && pH <= 7.5 && rainfall >= 150) {
      if (potassium >= 50) {
        return "Banana";
      }
    }
    
    if (temperature >= 15 && temperature <= 25 && humidity >= 60) {
      return "Tea";
    }
    
    if (rainfall >= 50 && rainfall <= 150 && pH >= 6.0) {
      return "Pepper";
    }
    
    // Default recommendation for Kerala
    return "Rice (Paddy)";
  };

  // Handle ask about crop
  const handleAskAboutCrop = async () => {
    if (!prediction) return;
    
    const question = `The crop recommendation system suggested I should grow '${prediction}'. Can you provide me with a detailed cultivation guide for growing ${prediction} in Kerala? Include information about soil preparation, planting season, care instructions, and harvesting tips.`;
    
    try {
      await sendMessage(question);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to send question:', error);
      setAlerts(prev => [...prev, {
        type: 'error',
        message: 'Failed to send question to AI assistant. Please try again.'
      }]);
    }
  };

  // Update form data
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <MapPin className="w-8 h-8 mr-3 text-green-600" />
                  🌱 Smart Crop Recommender
                </h1>
                <p className="text-gray-600 mt-1">
                  Find the perfect crop for your land using AI-powered analysis and live weather data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} type={alert.type}>
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{alert.message}</span>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Weather & Location Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <Cloud className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Location & Weather Data</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Kerala District
              </label>
              <select
                value={formData.selectedDistrict}
                onChange={(e) => updateFormData('selectedDistrict', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                {Object.keys(KERALA_DISTRICTS).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            

            
            <div className="md:col-span-1 flex items-end">
              <Button
                onClick={handleFetchWeather}
                loading={weatherLoading}
                // disabled={!formData.apiKey}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                {weatherLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CloudRain className="w-4 h-4 mr-2" />
                )}
                Fetch Live Weather
              </Button>
            </div>
          </div>

          {/* Weather Display */}
          {weatherData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Sun className="w-5 h-5 mr-2 text-yellow-600" />
                Current Weather Conditions for {formData.selectedDistrict}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Thermometer className="w-6 h-6 mx-auto text-red-500 mb-2" />
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-xl font-bold text-gray-900">
                    {weatherData.temperature.toFixed(1)}°C
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-xl font-bold text-gray-900">
                    {weatherData.humidity}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <CloudRain className="w-6 h-6 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600">24h Rainfall</p>
                  <p className="text-xl font-bold text-gray-900">
                    {weatherData.totalRainfall.toFixed(1)}mm
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Wind className="w-6 h-6 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">Wind Speed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {weatherData.windSpeed.toFixed(1)} km/h
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Parameters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Soil Parameters */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <FlaskConical className="w-6 h-6 mr-3 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Soil Parameters</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nitrogen (N) - kg/ha
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.nitrogen}
                  onChange={(e) => updateFormData('nitrogen', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Essential for leaf growth and protein synthesis</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phosphorous (P) - kg/ha
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.phosphorous}
                  onChange={(e) => updateFormData('phosphorous', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Important for root development and flowering</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potassium (K) - kg/ha
                </label>
                <input
                  type="number"
                  min="0"
                  max="210"
                  value={formData.potassium}
                  onChange={(e) => updateFormData('potassium', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enhances disease resistance and water regulation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil pH Value
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={formData.pH}
                  onChange={(e) => updateFormData('pH', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Scale from 0-14, neutral is 7.0</p>
              </div>
            </div>
          </div>

          {/* Environmental Parameters */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Thermometer className="w-6 h-6 mr-3 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Environmental Conditions</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Temperature (°C)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => updateFormData('temperature', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{formData.temperature.toFixed(1)}°C</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optimal range varies by crop type</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relative Humidity (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) => updateFormData('humidity', parseFloat(e.target.value))}
                  className="w-full mb-2"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{formData.humidity.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Affects pest and disease development</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seasonal Rainfall (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="400"
                  step="0.1"
                  value={formData.rainfall}
                  onChange={(e) => updateFormData('rainfall', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter total seasonal rainfall"
                />
                <p className="text-xs text-gray-500 mt-1">Total rainfall expected during entire growing season</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center mb-6">
              <Sprout className="w-8 h-8 mr-3 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">AI Crop Recommendation</h2>
            </div>
            
            <Button
              onClick={handleCropPrediction}
              loading={predictionLoading}
              disabled={predictionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {predictionLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing Your Conditions...
                </>
              ) : (
                <>
                  <Leaf className="w-6 h-6 mr-3" />
                  🌾 Get Crop Recommendation
                </>
              )}
            </Button>

            {prediction && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 mt-8">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    🎯 Recommended Crop for Your Land:
                  </h3>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                    <p className="text-5xl font-bold text-green-600 mb-4">
                      {prediction.charAt(0).toUpperCase() + prediction.slice(1)}
                    </p>
                    <p className="text-gray-600 text-lg">
                      Based on your soil conditions, environmental factors, and current weather data
                    </p>
                  </div>
                  <Button
                    onClick={handleAskAboutCrop}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 text-lg font-medium rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    💬 Get Cultivation Guide for {prediction}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;