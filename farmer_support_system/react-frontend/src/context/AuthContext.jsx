import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [otpSession, setOtpSession] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Send OTP to mobile number
  const sendOTP = async (mobileNumber) => {
    try {
      setIsLoading(true);
      const response = await authService.sendOTP(mobileNumber);
      
      if (response.success) {
        setOtpSession({
          mobileNumber,
          sessionId: response.sessionId,
          expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
        });
        return { success: true, message: 'OTP sent successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      setIsLoading(true);
      
      if (!otpSession) {
        return { success: false, message: 'No active OTP session' };
      }

      if (Date.now() > otpSession.expiresAt) {
        setOtpSession(null);
        return { success: false, message: 'OTP has expired' };
      }

      const response = await authService.verifyOTP({
        mobileNumber: otpSession.mobileNumber,
        otp,
        sessionId: otpSession.sessionId,
      });

      if (response.success) {
        if (response.isNewUser) {
          // New user - need to complete registration
          return { 
            success: true, 
            isNewUser: true, 
            mobileNumber: otpSession.mobileNumber 
          };
        } else {
          // Existing user - complete login
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userData', JSON.stringify(response.user));
          setOtpSession(null);
          
          return { 
            success: true, 
            isNewUser: false, 
            user: response.user 
          };
        }
      } else {
        return { success: false, message: response.message || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Complete user registration
  const completeRegistration = async (userInfo) => {
    try {
      setIsLoading(true);
      
      const response = await authService.registerUser({
        mobileNumber: otpSession?.mobileNumber,
        ...userInfo,
      });

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        setOtpSession(null);
        
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setOtpSession(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  // Resend OTP
  const resendOTP = async () => {
    if (!otpSession) {
      return { success: false, message: 'No active session' };
    }
    
    return await sendOTP(otpSession.mobileNumber);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    otpSession,
    sendOTP,
    verifyOTP,
    completeRegistration,
    logout,
    resendOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
