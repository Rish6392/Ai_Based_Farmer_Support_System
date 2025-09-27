import api from './api';

// Kerala Districts with coordinates (same as backend)
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

class WeatherService {
  constructor() {
    // Use environment variable for API key or fallback
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  }

  /**
   * Fetches weather data for the next 24 hours for a given district
   * @param {string} district - Kerala district name
   * @param {string} customApiKey - Optional custom API key
   * @returns {Promise<Object>} Weather data object
   */
  async getWeatherData(district, customApiKey = null) {
    const coords = KERALA_DISTRICTS[district];
    if (!coords) {
      throw new Error(`Invalid district: ${district}`);
    }

    const apiKey = customApiKey || this.apiKey;
    if (!apiKey) {
      throw new Error('OpenWeather API key is required. Please provide an API key.');
    }

    const [lat, lon] = coords;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url, { timeout: 10000 });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenWeather API Key. Please check the key and make sure it is active.');
        }
        throw new Error(`Weather API request failed with status code ${response.status}`);
      }

      const data = await response.json();
      const forecastList = data.list || [];
      
      if (forecastList.length === 0) {
        throw new Error('No weather data available');
      }

      // Get current temp/humidity from the first forecast period
      const currentForecast = forecastList[0];
      const temperature = currentForecast?.main?.temp;
      const humidity = currentForecast?.main?.humidity;

      // Calculate totals and maximums over the next 24 hours (8 periods of 3 hours each)
      let totalRainfall = 0;
      let maxTemp = -100; // Initialize with a very low number
      let maxWindSpeed = 0;

      for (let i = 0; i < Math.min(8, forecastList.length); i++) {
        const period = forecastList[i];
        
        // Sum rainfall (convert from 3h to total)
        totalRainfall += period.rain?.['3h'] || 0;
        
        // Find max temperature
        const tempMax = period.main?.temp_max || period.main?.temp || -100;
        if (tempMax > maxTemp) {
          maxTemp = tempMax;
        }
        
        // Find max wind speed
        const windSpeed = period.wind?.speed || 0;
        if (windSpeed > maxWindSpeed) {
          maxWindSpeed = windSpeed;
        }
      }

      if (temperature == null || humidity == null) {
        throw new Error('Invalid weather data received');
      }

      return {
        temperature,
        humidity,
        totalRainfall,
        maxTemp,
        windSpeed: maxWindSpeed * 3.6, // Convert m/s to km/h
        district,
        timestamp: new Date().toISOString(),
        location: {
          lat,
          lon,
          name: district
        }
      };

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Failed to connect to the weather service. Check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get weather data for all Kerala districts
   * @param {string} customApiKey - Optional custom API key
   * @returns {Promise<Object>} Object with district names as keys and weather data as values
   */
  async getAllDistrictsWeather(customApiKey = null) {
    const results = {};
    const districts = Object.keys(KERALA_DISTRICTS);
    
    // Process districts in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < districts.length; i += batchSize) {
      const batch = districts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (district) => {
        try {
          const weather = await this.getWeatherData(district, customApiKey);
          return { district, weather };
        } catch (error) {
          console.error(`Failed to get weather for ${district}:`, error);
          return { district, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ district, weather, error }) => {
        if (weather) {
          results[district] = weather;
        } else {
          results[district] = { error };
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < districts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Check if the API key is valid
   * @param {string} apiKey - OpenWeather API key to validate
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  async validateApiKey(apiKey) {
    try {
      // Test with Ernakulam coordinates
      const [lat, lon] = KERALA_DISTRICTS['Ernakulam'];
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        { timeout: 5000 }
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of available districts
   * @returns {Array<string>} Array of district names
   */
  getAvailableDistricts() {
    return Object.keys(KERALA_DISTRICTS);
  }

  /**
   * Get coordinates for a district
   * @param {string} district - District name
   * @returns {Array<number>|null} [latitude, longitude] or null if not found
   */
  getDistrictCoordinates(district) {
    return KERALA_DISTRICTS[district] || null;
  }
}

export const weatherService = new WeatherService();
export { KERALA_DISTRICTS };