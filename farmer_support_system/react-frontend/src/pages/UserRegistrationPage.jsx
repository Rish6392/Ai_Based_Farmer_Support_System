import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Sprout, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert, Loading } from '../components';

const UserRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    district: '',
    primaryCrop: '',
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const { completeRegistration, isLoading, otpSession } = useAuth();

  // Redirect if no OTP session
  useEffect(() => {
    if (!otpSession) {
      navigate('/login');
    }
  }, [otpSession, navigate]);

  // States and their districts (sample data - you can expand this)
  const statesAndDistricts = {
    'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
    'Karnataka': ['Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary', 'Bidar', 'Bijapur', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Gulbarga', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysore', 'Raichur', 'Ramanagara', 'Shimoga', 'Tumkur', 'Udupi', 'Uttara Kannada', 'Yadgir'],
    'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Tamil Nadu': ['Ariyalur', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Salem', 'Sivaganga', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
    'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran'],
    'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurgaon', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Mewat', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  };

  // Common crops
  const crops = [
    'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Groundnut', 'Sunflower',
    'Mustard', 'Sesame', 'Coconut', 'Areca nut', 'Cardamom', 'Pepper', 'Turmeric', 'Ginger',
    'Onion', 'Potato', 'Tomato', 'Brinjal', 'Okra', 'Chilli', 'Coriander', 'Cumin',
    'Mango', 'Banana', 'Grapes', 'Pomegranate', 'Orange', 'Apple', 'Guava', 'Papaya',
    'Tea', 'Coffee', 'Rubber', 'Jute', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset district when state changes
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        district: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.primaryCrop) {
      newErrors.primaryCrop = 'Primary crop is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await completeRegistration(formData);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Registration completed successfully! Welcome to KisanSewa.'
        });
        
        setTimeout(() => {
          navigate('/chat');
        }, 2000);
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    }
  };

  const handleGoBack = () => {
    navigate('/otp-verification');
  };

  const getDistrictsForState = (state) => {
    return statesAndDistricts[state] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help us personalize your farming experience
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              className="mb-6"
              onClose={() => setAlert(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* State Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                  errors.state ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select your state</option>
                {Object.keys(statesAndDistricts).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                disabled={!formData.state}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.district ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">
                  {formData.state ? 'Select your district' : 'First select a state'}
                </option>
                {getDistrictsForState(formData.state).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district}</p>
              )}
            </div>

            {/* Primary Crop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Crop *
              </label>
              <select
                name="primaryCrop"
                value={formData.primaryCrop}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                  errors.primaryCrop ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select your primary crop</option>
                {crops.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              {errors.primaryCrop && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryCrop}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Complete Registration
                </>
              )}
            </Button>
          </form>

          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="w-full mt-4 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to OTP Verification
          </button>
        </div>

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            This information helps us provide personalized farming advice and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationPage;
