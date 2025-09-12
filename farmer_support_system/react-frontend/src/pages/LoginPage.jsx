import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert, Loading } from '../components';

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const { sendOTP, isLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    // Validate mobile number
    if (!mobileNumber.trim()) {
      setErrors({ mobileNumber: 'Mobile number is required' });
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      setErrors({ mobileNumber: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    try {
      const result = await sendOTP(mobileNumber);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'OTP sent successfully to your mobile number'
        });
        
        // Redirect to OTP page after a short delay
        setTimeout(() => {
          navigate('/otp-verification');
        }, 1500);
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setMobileNumber(value);
      if (errors.mobileNumber) {
        setErrors({ ...errors, mobileNumber: '' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to KisanSewa</h1>
          <p className="text-gray-600">Enter your mobile number to get started</p>
        </div>

        {/* Login Form */}
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
            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-gray-500">+91</span>
                </div>
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  placeholder="Enter 10-digit mobile number"
                  className={`pl-16 ${errors.mobileNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                  maxLength={10}
                />
              </div>
              {errors.mobileNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !mobileNumber.trim()}
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Why KisanSewa?</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Secure OTP-based authentication</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>AI-powered farming assistance</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Personalized crop recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-green-600 hover:text-green-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-600 hover:text-green-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
