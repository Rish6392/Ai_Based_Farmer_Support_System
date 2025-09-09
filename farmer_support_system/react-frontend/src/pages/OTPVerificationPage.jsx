import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Alert, Loading } from '../components';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { verifyOTP, resendOTP, isLoading, otpSession } = useAuth();
  const inputRefs = useRef([]);

  // Redirect if no OTP session
  useEffect(() => {
    if (!otpSession) {
      navigate('/login');
      return;
    }

    // Calculate remaining time
    const remaining = Math.max(0, Math.floor((otpSession.expiresAt - Date.now()) / 1000));
    setTimeLeft(remaining);
  }, [otpSession, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setCanResend(true);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, 6);
        if (pastedOtp.length === 6) {
          const newOtp = pastedOtp.split('');
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    const otpString = otp.join('');
    
    // Validate OTP
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return;
    }

    if (!/^\d{6}$/.test(otpString)) {
      setErrors({ otp: 'OTP should contain only numbers' });
      return;
    }

    try {
      const result = await verifyOTP(otpString);
      
      if (result.success) {
        if (result.isNewUser) {
          // New user - redirect to registration
          setAlert({
            type: 'success',
            message: 'OTP verified! Please complete your profile.'
          });
          
          setTimeout(() => {
            navigate('/user-registration');
          }, 1500);
        } else {
          // Existing user - redirect to chat
          setAlert({
            type: 'success',
            message: 'Login successful! Welcome back.'
          });
          
          setTimeout(() => {
            navigate('/chat');
          }, 1500);
        }
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Invalid OTP. Please try again.'
        });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      setCanResend(false);
      const result = await resendOTP();
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'OTP resent successfully to your mobile number'
        });
        setTimeLeft(300); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setAlert({
          type: 'error',
          message: result.message || 'Failed to resend OTP. Please try again.'
        });
        setCanResend(true);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Network error. Please try again.'
      });
      setCanResend(true);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to{' '}
            <span className="font-medium">+91 {otpSession?.mobileNumber}</span>
          </p>
        </div>

        {/* OTP Form */}
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
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      errors.otp ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
              )}
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in{' '}
                  <span className="font-medium text-green-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center mx-auto disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isOtpComplete}
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify OTP
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
            Change Mobile Number
          </button>
        </div>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            For your security, never share this OTP with anyone. KisanSewa will never ask for your OTP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
