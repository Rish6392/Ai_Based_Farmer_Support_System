const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL

// Mock data for testing (remove this when you implement the real backend)
const MOCK_MODE = true; // Set to false when you have a real backend

class AuthService {
  // Send OTP to mobile number
  async sendOTP(mobileNumber) {
    try {
      if (MOCK_MODE) {
        // Mock response for testing
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        return {
          success: true,
          sessionId: 'mock-session-' + Date.now(),
          message: 'OTP sent successfully'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP({ mobileNumber, otp, sessionId }) {
    try {
      if (MOCK_MODE) {
        // Mock response for testing
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Accept any 6-digit OTP for testing
        if (otp === '123456') {
          // Check if user exists (mock check)
          const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
          const existingUser = existingUsers.find(user => user.mobileNumber === mobileNumber);
          
          if (existingUser) {
            return {
              success: true,
              isNewUser: false,
              user: existingUser,
              token: 'mock-token-' + Date.now()
            };
          } else {
            return {
              success: true,
              isNewUser: true
            };
          }
        } else {
          return {
            success: false,
            message: 'Invalid OTP. Use 123456 for testing.'
          };
        }
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, otp, sessionId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Register new user
  async registerUser(userInfo) {
    try {
      if (MOCK_MODE) {
        // Mock response for testing
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const newUser = {
          id: Date.now(),
          ...userInfo,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage for testing
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        existingUsers.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
        
        return {
          success: true,
          user: newUser,
          token: 'mock-token-' + Date.now()
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userInfo, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
