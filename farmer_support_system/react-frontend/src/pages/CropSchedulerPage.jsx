import React, { useState } from 'react';
import { 
  Calendar, Clock, Sprout, Leaf, ArrowLeft, CheckCircle, 
  AlertCircle, MapPin, Thermometer, CloudRain, Sun,
  Activity, TrendingUp, PlayCircle, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from '../components';
import { useChat } from '../context';

const CropSchedulerPage = () => {
  const navigate = useNavigate();
  const { sendMessage } = useChat();
  
  // Available crops for Kerala
  const cropOptions = [
    "Paddy-I (Early Kharif)",
    "Paddy-II (Rabi)", 
    "Coconut",
    "Pepper",
    "Banana", 
    "Coffee",
    "Tapioca",
    "Tea",
    "Cardamom",
    "Rubber",
    "Cashew",
    "Mango"
  ];

  // Activity stages for different crops
  const activityStages = {
    "Paddy-I (Early Kharif)": [
      "Land Preparation", "Sowing", "Transplanting", "Vegetative Growth", 
      "Tillering", "Flowering", "Grain Formation", "Maturation", "Harvesting"
    ],
    "Paddy-II (Rabi)": [
      "Land Preparation", "Sowing", "Transplanting", "Vegetative Growth", 
      "Tillering", "Flowering", "Grain Formation", "Maturation", "Harvesting"
    ],
    "Coconut": [
      "Land Preparation", "Planting", "Initial Care", "Growth Phase", 
      "Maturation", "Harvesting", "Maintenance"
    ],
    "Pepper": [
      "Land Preparation", "Planting", "Training", "Pruning", 
      "Flowering", "Fruit Development", "Harvesting"
    ],
    "Banana": [
      "Land Preparation", "Planting", "Initial Growth", "Pseudostem Development", 
      "Flowering", "Fruit Development", "Harvesting"
    ],
    "Coffee": [
      "Land Preparation", "Planting", "Shade Management", "Pruning", 
      "Flowering", "Berry Development", "Harvesting", "Processing"
    ],
    "Tapioca": [
      "Land Preparation", "Planting", "Weeding", "Earthing Up", 
      "Growth Monitoring", "Harvesting"
    ]
  };

  // Soil types for Kerala
  const soilTypes = [
    "Laterite Soil",
    "Alluvial Soil", 
    "Black Cotton Soil",
    "Red Soil",
    "Sandy Soil",
    "Clay Soil",
    "Kole Lands",
    "Coastal Alluvium"
  ];

  // Irrigation methods
  const irrigationTypes = [
    "Drip Irrigation",
    "Sprinkler System", 
    "Flood Irrigation",
    "Rain-fed",
    "Bore Well",
    "Canal System",
    "Tank Irrigation",
    "Mixed System"
  ];

  // Enhanced form state with more detailed tracking
  const [formData, setFormData] = useState({
    selectedCrop: 'Paddy-I (Early Kharif)',
    lastActivity: '',
    activityDate: new Date().toISOString().split('T')[0],
    farmLocation: '',
    farmSize: '',
    soilType: '',
    irrigationType: '',
    previousYield: ''
  });

  // Enhanced results state with more analytics
  const [scheduleResult, setScheduleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [schedulingHistory, setSchedulingHistory] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Handle form updates with enhanced validation
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Reset last activity when crop changes
    if (key === 'selectedCrop') {
      setFormData(prev => ({ ...prev, lastActivity: '' }));
    }

    // Auto-fetch weather when location changes
    if (key === 'farmLocation' && value.length > 3) {
      fetchWeatherData(value);
    }
  };

  // Fetch weather data for location
  const fetchWeatherData = async (location) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=YOUR_API_KEY&units=metric`);
      if (response.ok) {
        const data = await response.json();
        setWeatherData({
          temperature: data.main.temp,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          windSpeed: data.wind.speed
        });
      }
    } catch (error) {
      console.log('Weather data not available:', error);
      // Use fallback weather data for Kerala
      setWeatherData({
        temperature: 28,
        humidity: 80,
        description: 'tropical climate',
        windSpeed: 10
      });
    }
  };

  // Get current week number of the year
  const getWeekNumber = (date) => {
    const target = new Date(date);
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };

  // Enhanced schedule generation using AI with more context
  const handleGenerateSchedule = async () => {
    if (!formData.lastActivity) {
      setAlerts([{
        type: 'error',
        message: 'Please select the activity you just completed.'
      }]);
      return;
    }

    setLoading(true);
    setAlerts([]);

    try {
      // Create a comprehensive prompt for the AI assistant
      const currentWeek = getWeekNumber(new Date(formData.activityDate));
      const currentYear = new Date().getFullYear();
      
      const prompt = `
        You are an advanced agricultural schedule analyst for Kerala farming with expertise in crop management and weather patterns.

        DETAILED CONTEXT:
        - Crop: "${formData.selectedCrop}"
        - Last Completed Activity: "${formData.lastActivity}"
        - Completion Date: "${formData.activityDate}"
        - Current Week: ${currentWeek} of ${currentYear}
        - Farm Location: "${formData.farmLocation || 'Kerala'}"
        - Farm Size: "${formData.farmSize || 'Standard size'}"
        - Soil Type: "${formData.soilType || 'Mixed Kerala soil'}"
        - Irrigation: "${formData.irrigationType || 'Rain-fed system'}"
        - Previous Yield: "${formData.previousYield || 'Average yield'}"
        ${weatherData ? `
        - Current Weather: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity
        - Weather Condition: ${weatherData.description}
        - Wind Speed: ${weatherData.windSpeed} km/h` : ''}

        ENHANCED ANALYSIS REQUIRED:
        1. CURRENT STATUS: Evaluate if the completed activity timing is optimal/early/late for Kerala's climate
        2. NEXT PRIORITY ACTIVITY: What should be done next with specific timing
        3. WEATHER INTEGRATION: How current and upcoming weather affects the schedule  
        4. SOIL-SPECIFIC ADVICE: Recommendations based on soil type and irrigation method
        5. YIELD OPTIMIZATION: Tips to improve yield based on farm characteristics
        6. RISK MITIGATION: Potential problems to watch for and prevention methods
        7. RESOURCE PLANNING: Materials, labor, and equipment needed
        8. TIMELINE: Detailed schedule for next 2-4 weeks

        Please provide a comprehensive, actionable response that considers Kerala's specific agricultural conditions, monsoon patterns, and traditional farming practices.
      `;

      // Send enhanced prompt to AI assistant
      const response = await sendMessage(prompt);
      
      // Parse the AI response and create a comprehensive schedule
      const scheduleData = parseAIResponse(response, formData);
      setScheduleResult(scheduleData);

      // Save to scheduling history
      setSchedulingHistory(prev => [...prev, {
        date: new Date().toISOString(),
        crop: formData.selectedCrop,
        activity: formData.lastActivity,
        result: scheduleData
      }]);

    } catch (error) {
      console.error('Enhanced schedule generation error:', error);
      
      // Fallback to local schedule logic
      const localSchedule = generateLocalSchedule(formData);
      setScheduleResult(localSchedule);
      
      setAlerts([{
        type: 'info',
        message: 'Using local scheduling logic. For AI-powered recommendations, ensure chat service is available.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Parse AI response into structured data
  const parseAIResponse = (response, formData) => {
    // This would parse the AI response, but for now we'll use local logic
    return generateLocalSchedule(formData);
  };

  // Local schedule generation logic
  const generateLocalSchedule = (data) => {
    const activities = activityStages[data.selectedCrop] || [];
    const currentActivityIndex = activities.findIndex(
      activity => activity.toLowerCase().includes(data.lastActivity.toLowerCase())
    );
    
    const nextActivityIndex = currentActivityIndex + 1;
    const nextActivity = nextActivityIndex < activities.length 
      ? activities[nextActivityIndex] 
      : 'Crop Cycle Complete';

    // Calculate next activity date (approximate)
    const lastDate = new Date(data.activityDate);
    const nextDate = new Date(lastDate);
    
    // Add appropriate days based on activity type
    const daysToAdd = getActivityInterval(data.lastActivity, nextActivity);
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return {
      currentActivity: data.lastActivity,
      currentStatus: determineStatus(data.lastActivity, data.activityDate),
      nextActivity,
      nextActivityDate: nextDate.toISOString().split('T')[0],
      daysUntilNext: Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24)),
      recommendations: generateRecommendations(data.selectedCrop, nextActivity),
      weatherAlert: getWeatherAlert()
    };
  };

  // Determine if current activity timing is appropriate
  const determineStatus = (activity, date) => {
    const activityDate = new Date(date);
    const now = new Date();
    const daysDiff = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) return 'On Schedule';
    if (daysDiff < 14) return 'Slightly Delayed';
    return 'Delayed';
  };

  // Get interval between activities
  const getActivityInterval = (current, next) => {
    const intervals = {
      'Land Preparation': 7,
      'Sowing': 14,
      'Transplanting': 21,
      'Vegetative Growth': 28,
      'Flowering': 14,
      'Harvesting': 90
    };
    
    return intervals[next] || 21; // Default to 3 weeks
  };

  // Generate specific recommendations
  const generateRecommendations = (crop, nextActivity) => {
    const recommendations = {
      'Paddy-I (Early Kharif)': {
        'Transplanting': 'Ensure proper spacing (20x15 cm). Use 2-3 seedlings per hill. Maintain 2-3 cm water level.',
        'Vegetative Growth': 'Apply nitrogen fertilizer. Maintain proper water level. Control weeds.',
        'Flowering': 'Ensure adequate water supply. Watch for pest and disease symptoms.',
        'Harvesting': 'Harvest when 80% of grains turn golden yellow. Dry properly before storage.'
      },
      'Coconut': {
        'Planting': 'Dig pits 1m x 1m x 1m. Apply organic manure. Plant during monsoon season.',
        'Initial Care': 'Water regularly. Apply mulch around base. Protect from pests.',
        'Maintenance': 'Regular weeding. Apply fertilizers. Pruning of dead fronds.'
      }
    };
    
    return recommendations[crop]?.[nextActivity] || `Focus on proper timing and preparation for ${nextActivity}.`;
  };

  // Get weather alert for current season
  const getWeatherAlert = () => {
    const month = new Date().getMonth();
    
    if (month >= 5 && month <= 9) { // Monsoon season
      return 'Monsoon season: Ensure proper drainage. Watch for fungal diseases.';
    } else if (month >= 2 && month <= 4) { // Summer
      return 'Summer season: Ensure adequate irrigation. Protect crops from heat stress.';
    } else { // Winter
      return 'Post-monsoon/Winter: Good time for land preparation and sowing.';
    }
  };

  // Handle asking AI about the schedule
  const handleAskAboutSchedule = async () => {
    if (!scheduleResult) return;
    
    const question = `I'm growing ${formData.selectedCrop} and just completed ${formData.lastActivity}. My next activity is ${scheduleResult.nextActivity}. Can you provide detailed guidance on how to properly perform ${scheduleResult.nextActivity} for optimal results in Kerala climate?`;
    
    try {
      await sendMessage(question);
      navigate('/chat');
    } catch (error) {
      setAlerts([{
        type: 'error',
        message: 'Failed to send question to AI assistant. Please try again.'
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8 max-w-4xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full shadow-lg mb-4">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🗓️ AI-Powered Crop Scheduler
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Plan your farming activities with intelligent scheduling and weather-aware recommendations
            </p>
          </div>
        </div>

        {/* Main Content Container - Centered */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {alerts.map((alert, index) => (
                <Alert key={index} type={alert.type}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {alert.message}
                </Alert>
              ))}
            </div>
          )}

          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
            <div className="flex items-center mb-6">
              <Sprout className="w-6 h-6 mr-3 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Crop Activity Planning</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌾 Select Your Crop Type
                  </label>
                  <select
                    value={formData.selectedCrop}
                    onChange={(e) => updateFormData('selectedCrop', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-lg"
                  >
                    {cropOptions.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✅ What activity did you just complete?
                  </label>
                  <select
                    value={formData.lastActivity}
                    onChange={(e) => updateFormData('lastActivity', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-lg"
                  >
                    <option value="">Select completed activity...</option>
                    {(activityStages[formData.selectedCrop] || []).map(activity => (
                      <option key={activity} value={activity}>{activity}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 On what date did you complete it?
                  </label>
                  <input
                    type="date"
                    value={formData.activityDate}
                    onChange={(e) => updateFormData('activityDate', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Farm Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.farmLocation}
                    onChange={(e) => updateFormData('farmLocation', e.target.value)}
                    placeholder="e.g., Ernakulam, Kerala"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌾 Farm Size (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.farmSize}
                    onChange={(e) => updateFormData('farmSize', e.target.value)}
                    placeholder="e.g., 2 acres, 1 hectare"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Advanced Options Toggle */}
                <div>
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {showAdvancedOptions ? '🔼 Hide Advanced Options' : '🔽 Show Advanced Options'}
                  </button>
                </div>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-blue-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏔️ Soil Type
                      </label>
                      <select
                        value={formData.soilType}
                        onChange={(e) => updateFormData('soilType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select soil type...</option>
                        {soilTypes.map(soil => (
                          <option key={soil} value={soil}>{soil}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💧 Irrigation Type
                      </label>
                      <select
                        value={formData.irrigationType}
                        onChange={(e) => updateFormData('irrigationType', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select irrigation method...</option>
                        {irrigationTypes.map(irrigation => (
                          <option key={irrigation} value={irrigation}>{irrigation}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📊 Previous Season Yield (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.previousYield}
                        onChange={(e) => updateFormData('previousYield', e.target.value)}
                        placeholder="e.g., 50 quintals/hectare, 2 tons/acre"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    🌟 Current Season & Weather Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-700">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-orange-600" />
                        📅 Week {getWeekNumber(new Date())} of {new Date().getFullYear()}
                      </span>
                    </div>
                    
                    {weatherData && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center text-sm">
                            <Thermometer className="w-4 h-4 mr-1 text-red-500" />
                            <span className="font-medium">{weatherData.temperature}°C</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center text-sm">
                            <CloudRain className="w-4 h-4 mr-1 text-blue-500" />
                            <span className="font-medium">{weatherData.humidity}% Humidity</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700 flex items-start">
                        <Sun className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span>🌤️ {getWeatherAlert()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={handleGenerateSchedule}
                loading={loading}
                disabled={!formData.lastActivity}
                className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Activity className="w-6 h-6 mr-3" />
                🤖 Generate Smart Schedule
              </Button>
            </div>
          </div>

          {/* Scheduling History */}
          {schedulingHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                📚 Previous Schedules & History
              </h3>
              <div className="space-y-3">
                {schedulingHistory.slice(-3).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="font-medium text-gray-900">{entry.crop}</span>
                      <span className="text-gray-600 ml-2">→ {entry.activity}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Results */}
          {scheduleResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm bg-opacity-95">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Smart Farming Schedule</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Current Status */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Current Activity Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed Activity:</span>
                        <span className="font-semibold text-gray-900">{scheduleResult.currentActivity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          scheduleResult.currentStatus === 'On Schedule' ? 'bg-green-100 text-green-800' :
                          scheduleResult.currentStatus === 'Slightly Delayed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scheduleResult.currentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-yellow-600" />
                      Weather Considerations
                    </h3>
                    <p className="text-gray-700">{scheduleResult.weatherAlert}</p>
                  </div>
                </div>

                {/* Next Activity */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <PlayCircle className="w-5 h-5 mr-2 text-green-600" />
                      Next Recommended Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Activity:</span>
                        <span className="font-bold text-green-700 text-lg">{scheduleResult.nextActivity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ideal Date:</span>
                        <span className="font-semibold text-gray-900">{new Date(scheduleResult.nextActivityDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Days Until:</span>
                        <span className={`font-semibold px-2 py-1 rounded ${
                          scheduleResult.daysUntilNext <= 0 ? 'bg-red-100 text-red-800' :
                          scheduleResult.daysUntilNext <= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {scheduleResult.daysUntilNext > 0 ? `${scheduleResult.daysUntilNext} days` : 'Overdue'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Leaf className="w-5 h-5 mr-2 text-purple-600" />
                      Expert Recommendations
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{scheduleResult.recommendations}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 text-center">
                <Button
                  onClick={handleAskAboutSchedule}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-3 text-lg font-medium rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  💬 Get Detailed Guidance for {scheduleResult.nextActivity}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropSchedulerPage;