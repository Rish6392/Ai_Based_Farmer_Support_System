import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, AlertCircle, X, ChevronDown, ChevronUp, MapPin, Clock, RefreshCw } from 'lucide-react';
import { weatherService, alertsService } from '../services';
import { Alert, Button, Loading } from '../components';

const ProactiveAlerts = ({ 
  selectedDistrict = 'Ernakulam', 
  apiKey = null, 
  showDistrictSelector = true,
  refreshInterval = 10 * 60 * 1000, // 10 minutes default
  className = '',
  compact = false 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const [currentDistrict, setCurrentDistrict] = useState(selectedDistrict);

  // Auto refresh alerts
  useEffect(() => {
    fetchAlerts();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [currentDistrict, apiKey, refreshInterval]);

  // Update district when prop changes
  useEffect(() => {
    setCurrentDistrict(selectedDistrict);
  }, [selectedDistrict]);

  const fetchAlerts = async () => {
    if (!currentDistrict) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const weather = await weatherService.getWeatherData(currentDistrict, apiKey);
      const generatedAlerts = alertsService.checkForAlerts(weather);
      const activeAlerts = alertsService.getActiveAlerts(generatedAlerts);
      const sortedAlerts = alertsService.sortBySeverity(activeAlerts);
      
      setWeatherData(weather);
      setAlerts(sortedAlerts);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError(err.message);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertExpansion = (alertId) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const getAlertIcon = (type, severity) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBorderColor = (type, severity) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const AlertCard = ({ alert }) => {
    const isExpanded = expandedAlerts.has(alert.id);
    const borderColor = getAlertBorderColor(alert.type, alert.severity);
    
    return (
      <div className={`border-l-4 ${borderColor} rounded-lg p-4 mb-3 shadow-sm transition-all hover:shadow-md`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getAlertIcon(alert.type, alert.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {alert.icon} {alert.title}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-gray-700 text-sm mt-1">{alert.message}</p>
            </div>
          </div>
          
          {alert.recommendations && alert.recommendations.length > 0 && (
            <button
              onClick={() => toggleAlertExpansion(alert.id)}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              title={isExpanded ? 'Hide recommendations' : 'Show recommendations'}
            >
              {isExpanded ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </button>
          )}
        </div>
        
        {isExpanded && alert.recommendations && (
          <div className="mt-3 pl-8 border-t pt-3 border-gray-200">
            <h5 className="font-medium text-gray-900 text-sm mb-2">Recommendations:</h5>
            <ul className="space-y-1">
              {alert.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (compact && alerts.length === 0 && !loading && !error) {
    return (
      <div className="text-sm text-green-600 flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>No weather alerts</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${compact ? '' : 'shadow-sm border'} ${className}`}>
      {!compact && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Weather Alerts</h3>
              {lastUpdated && (
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(lastUpdated)}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {showDistrictSelector && (
                <select
                  value={currentDistrict}
                  onChange={(e) => setCurrentDistrict(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {weatherService.getAvailableDistricts().map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              )}
              
              <Button
                onClick={fetchAlerts}
                disabled={loading}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          
          {currentDistrict && (
            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{currentDistrict} District</span>
            </div>
          )}
        </div>
      )}

      <div className={compact ? '' : 'p-4'}>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loading size="sm" />
            <span className="ml-2 text-sm text-gray-600">Checking weather conditions...</span>
          </div>
        )}

        {error && (
          <Alert type="error" className="mb-4">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchAlerts}
                className="text-red-600 hover:text-red-800 underline text-sm ml-4"
              >
                Retry
              </button>
            </div>
          </Alert>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-green-500 mb-2">
              <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <p className="text-green-600 font-medium">Conditions look good!</p>
            <p className="text-sm text-gray-500 mt-1">No alerts for {currentDistrict} district.</p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div>
            {!compact && (
              <div className="mb-4 text-sm text-gray-600">
                {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} for your area
              </div>
            )}
            
            <div className={compact ? 'space-y-2' : 'space-y-0'}>
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {!compact && weatherData && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Current Conditions</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Temperature:</span>
                <span className="ml-1 font-medium">{weatherData.temperature?.toFixed(1)}°C</span>
              </div>
              <div>
                <span className="text-gray-600">Humidity:</span>
                <span className="ml-1 font-medium">{weatherData.humidity?.toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-gray-600">24h Rainfall:</span>
                <span className="ml-1 font-medium">{weatherData.totalRainfall?.toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-gray-600">Wind Speed:</span>
                <span className="ml-1 font-medium">{weatherData.windSpeed?.toFixed(1)} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProactiveAlerts;