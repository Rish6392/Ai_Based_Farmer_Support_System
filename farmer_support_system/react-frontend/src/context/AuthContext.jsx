import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpSession, setOtpSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userPhone = authService.getCurrentUserPhone();
          const response = await authService.getUserProfile(userPhone);
          
          if (response.success) {
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid, clear it
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Send OTP for login
  const sendOTPHandler = async (mobileNumber) => {
    try {
      setLoading(true);
      const response = await authService.sendOTP(mobileNumber);
      
      console.log(response);
      if (response.success) {
        setOtpSession({
          phoneNumber: mobileNumber,
          expiresAt: response.expiresAt
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error in AuthContext.sendOTP:', error);
      return {
        success: false,
        message: 'An error occurred while sending OTP'
      };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTPHandler = async (mobileNumber, otp) => {
    try {
      setLoading(true);
      const response = await authService.verifyOTP(mobileNumber, otp);
      
      if (response.success) {
        if (response.isNewUser) {
          // User needs to complete registration
          setOtpSession({
            phoneNumber: mobileNumber,
            needsRegistration: true
          });
        } else {
          // Existing user, fetch profile
          const profileResponse = await authService.getUserProfile(mobileNumber);
          console.log("profileResponse:", profileResponse);
          if (profileResponse.success) {
            setUser(profileResponse.user);
            setIsAuthenticated(true);
            setOtpSession(null);
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in AuthContext.verifyOTP:', error);
      return {
        success: false,
        message: 'An error occurred while verifying OTP'
      };
    } finally {
      setLoading(false);
    }
  };

  // Complete user registration
  const completeRegistrationHandler = async (registrationData) => {
    try {
      setLoading(true);
      const response = await authService.completeRegistration(registrationData);
      
      if (response.success) {
        // Fetch user profile after successful registration
        const userPhone = authService.getCurrentUserPhone();
        const profileResponse = await authService.getUserProfile(userPhone);
        
        if (profileResponse.success) {
          setUser(profileResponse.user);
          setIsAuthenticated(true);
          setOtpSession(null);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in AuthContext.completeRegistration:', error);
      return {
        success: false,
        message: 'An error occurred while completing registration'
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTPHandler = async () => {
    try {
      if (!otpSession?.phoneNumber) {
        return {
          success: false,
          message: 'No active OTP session found'
        };
      }
      
      return await sendOTPHandler(otpSession.phoneNumber);
    } catch (error) {
      console.error('Error in AuthContext.resendOTP:', error);
      return {
        success: false,
        message: 'An error occurred while resending OTP'
      };
    }
  };

  // Logout user
  const logoutHandler = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setOtpSession(null);
  };

  const value = {
    user,
    isAuthenticated,
    otpSession,
    loading,
    sendOTP: sendOTPHandler,
    verifyOTP: verifyOTPHandler,
    completeRegistration: completeRegistrationHandler,
    resendOTP: resendOTPHandler,
    logout: logoutHandler
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
