import React, { useState } from 'react';
import { CloudRain, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { ProactiveAlerts } from '../components';
import { weatherService } from '../services';

const AlertsPage = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full shadow-lg">
            <AlertTriangle className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Weather Alerts Dashboard</h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Stay informed about weather conditions that could impact your crops. Get real-time alerts and recommendations for farming activities across Kerala districts.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CloudRain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Weather Data</h3>
                <p className="text-sm text-gray-600">Updated every 3 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">14 Kerala Districts</h3>
                <p className="text-sm text-gray-600">Complete coverage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Alerts</h3>
                <p className="text-sm text-gray-600">AI-powered recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* District Selection */}
        <div className="bg-white rounded-xl shadow-md border">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Select District</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose your Kerala district to get personalized weather alerts
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-lg font-medium"
              >
                {weatherService.getAvailableDistricts().map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Weather alerts and recommendations will be customized for {selectedDistrict} district
              </p>
            </div>
          </div>
        </div>

        {/* Main Alerts Component */}
        <div className="space-y-4">
          <ProactiveAlerts 
            selectedDistrict={selectedDistrict}
            showDistrictSelector={false}
            refreshInterval={5 * 60 * 1000}
            className="shadow-lg"
          />
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Alert Types
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="font-medium text-gray-900">Critical Alerts</p>
                  <p className="text-sm text-gray-600">Heat stress, extreme weather conditions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="font-medium text-gray-900">Warning Alerts</p>
                  <p className="text-sm text-gray-600">Heavy rain, high winds, drought conditions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="font-medium text-gray-900">Information Alerts</p>
                  <p className="text-sm text-gray-600">Disease risk, optimal conditions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-green-500" />
              How It Works
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Our alert system analyzes real-time weather data from OpenWeather API and applies agricultural expertise to generate actionable recommendations.
              </p>
              <p>
                <strong>Data Sources:</strong> Temperature, humidity, rainfall, wind speed, and weather forecasts
              </p>
              <p>
                <strong>Update Frequency:</strong> Every 3 hours with the latest weather data
              </p>
              <p>
                <strong>Coverage:</strong> All 14 districts of Kerala with location-specific recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Weather data provided by OpenWeather • Agricultural recommendations by Digital Krishi Officer</p>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;