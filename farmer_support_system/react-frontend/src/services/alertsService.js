/**
 * AlertsService - Handles agricultural weather alert generation
 * Based on the alert rules from the Streamlit implementation
 */

class AlertsService {
  /**
   * Check weather data against predefined thresholds to generate alerts
   * @param {Object} weatherData - Weather data object from weatherService
   * @returns {Array<Object>} Array of alert objects
   */
  checkForAlerts(weatherData) {
    const alerts = [];
    
    if (!weatherData || typeof weatherData !== 'object') {
      return alerts;
    }

    // Rule 1: Heavy Rain Warning
    const totalRainfall = weatherData.totalRainfall || 0;
    if (totalRainfall > 50) {
      alerts.push({
        id: `heavy-rain-${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Heavy Rain Warning',
        message: `${totalRainfall.toFixed(1)} mm of rain expected in the next 24 hours. Ensure proper drainage to avoid waterlogging.`,
        icon: '🌧️',
        recommendations: [
          'Check and clear drainage systems',
          'Protect young plants with temporary covers',
          'Harvest mature crops if possible',
          'Avoid fertilizer application until after rain'
        ],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Rule 2: Heat Stress Alert
    const maxTemp = weatherData.maxTemp || 0;
    if (maxTemp > 38) {
      alerts.push({
        id: `heat-stress-${Date.now()}`,
        type: 'error',
        severity: 'critical',
        title: 'Heat Stress Alert',
        message: `Temperature may reach ${maxTemp.toFixed(1)}°C. Provide irrigation to crops to reduce heat stress.`,
        icon: '🔥',
        recommendations: [
          'Increase irrigation frequency',
          'Provide shade for sensitive crops',
          'Harvest during cooler hours (early morning/evening)',
          'Apply mulching to retain soil moisture',
          'Monitor livestock for heat stress signs'
        ],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Rule 3: High Wind Advisory
    const windSpeed = weatherData.windSpeed || 0;
    if (windSpeed > 20) {
      alerts.push({
        id: `high-wind-${Date.now()}`,
        type: 'warning',
        severity: 'medium',
        title: 'High Wind Advisory',
        message: `Wind speeds may reach ${windSpeed.toFixed(1)} km/h. Protect young or vulnerable plants.`,
        icon: '💨',
        recommendations: [
          'Stake tall plants and young trees',
          'Secure greenhouse structures and equipment',
          'Harvest fruits that are ready to avoid damage',
          'Check and reinforce fencing',
          'Move potted plants to sheltered areas'
        ],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Rule 4: Low Temperature Warning (for tropical crops)
    const currentTemp = weatherData.temperature || 0;
    if (currentTemp < 15) {
      alerts.push({
        id: `low-temp-${Date.now()}`,
        type: 'warning',
        severity: 'medium',
        title: 'Low Temperature Warning',
        message: `Temperature has dropped to ${currentTemp.toFixed(1)}°C. Protect temperature-sensitive crops.`,
        icon: '🥶',
        recommendations: [
          'Cover sensitive plants with cloth or plastic',
          'Use smudge pots or heaters in greenhouses',
          'Water plants during warmer parts of the day',
          'Harvest temperature-sensitive crops early'
        ],
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      });
    }

    // Rule 5: High Humidity with Heat (Disease Risk)
    const humidity = weatherData.humidity || 0;
    if (humidity > 85 && currentTemp > 25) {
      alerts.push({
        id: `disease-risk-${Date.now()}`,
        type: 'info',
        severity: 'medium',
        title: 'Disease Risk Alert',
        message: `High humidity (${humidity.toFixed(1)}%) and temperature (${currentTemp.toFixed(1)}°C) increase disease risk.`,
        icon: '🦠',
        recommendations: [
          'Monitor crops for fungal disease symptoms',
          'Improve air circulation around plants',
          'Apply preventive fungicide sprays if needed',
          'Avoid overhead watering',
          'Remove diseased plant material promptly'
        ],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Rule 6: Drought Conditions (Low rainfall + High temp)
    if (totalRainfall < 5 && maxTemp > 32) {
      alerts.push({
        id: `drought-risk-${Date.now()}`,
        type: 'warning',
        severity: 'high',
        title: 'Drought Conditions',
        message: `Very low rainfall (${totalRainfall.toFixed(1)} mm) with high temperatures. Implement water conservation measures.`,
        icon: '🏜️',
        recommendations: [
          'Implement drip irrigation systems',
          'Apply mulching to conserve soil moisture',
          'Use drought-resistant crop varieties',
          'Harvest rainwater when available',
          'Schedule irrigation during cooler hours'
        ],
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      });
    }

    return alerts;
  }

  /**
   * Get alerts for multiple districts
   * @param {Object} multiDistrictWeatherData - Object with district names as keys
   * @returns {Object} Object with district names as keys and alerts arrays as values
   */
  getAlertsForAllDistricts(multiDistrictWeatherData) {
    const districtAlerts = {};
    
    Object.entries(multiDistrictWeatherData).forEach(([district, weatherData]) => {
      if (weatherData && !weatherData.error) {
        districtAlerts[district] = this.checkForAlerts(weatherData);
      } else {
        districtAlerts[district] = [];
      }
    });

    return districtAlerts;
  }

  /**
   * Filter alerts by severity
   * @param {Array<Object>} alerts - Array of alert objects
   * @param {string} minSeverity - Minimum severity ('low', 'medium', 'high', 'critical')
   * @returns {Array<Object>} Filtered alerts
   */
  filterBySeverity(alerts, minSeverity = 'low') {
    const severityOrder = { 'low': 0, 'medium': 1, 'high': 2, 'critical': 3 };
    const minSeverityLevel = severityOrder[minSeverity] || 0;
    
    return alerts.filter(alert => {
      const alertLevel = severityOrder[alert.severity] || 0;
      return alertLevel >= minSeverityLevel;
    });
  }

  /**
   * Get active alerts (not expired)
   * @param {Array<Object>} alerts - Array of alert objects
   * @returns {Array<Object>} Active alerts
   */
  getActiveAlerts(alerts) {
    const now = new Date();
    return alerts.filter(alert => {
      if (!alert.validUntil) return true; // No expiry date
      return new Date(alert.validUntil) > now;
    });
  }

  /**
   * Sort alerts by severity (critical first)
   * @param {Array<Object>} alerts - Array of alert objects
   * @returns {Array<Object>} Sorted alerts
   */
  sortBySeverity(alerts) {
    const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    
    return [...alerts].sort((a, b) => {
      const aLevel = severityOrder[a.severity] || 3;
      const bLevel = severityOrder[b.severity] || 3;
      return aLevel - bLevel;
    });
  }

  /**
   * Get alert summary statistics
   * @param {Array<Object>} alerts - Array of alert objects
   * @returns {Object} Summary statistics
   */
  getAlertSummary(alerts) {
    const summary = {
      total: alerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {}
    };

    alerts.forEach(alert => {
      // Count by severity
      summary[alert.severity] = (summary[alert.severity] || 0) + 1;
      
      // Count by type
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
    });

    return summary;
  }
}

export const alertsService = new AlertsService();