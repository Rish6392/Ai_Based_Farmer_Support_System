const API_BASE_URL = "http://localhost:8000"; // Update with your backend URL

// Authentication service functions for the farmer support system - v2.3

// Send OTP to mobile number
const sendOTP = async (mobileNumber) => {
  try {
    // const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ phone_number: mobileNumber }),
    // });

    // Mock response for testing without backend
    setTimeout(() => {}, 1000); // Simulate network delay
    let response = {
      ok: true,
      error:null,
      success:true,
      message: "otp sent successfully",
      expires_at: new Date(new Date().getTime() + 50 * 60000).toISOString(), // OTP valid for 50 minutes
    }

    console.log("response:", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to send OTP");
    }

    // const data = await response.json();
    const data = await response;
    return {
      success: data.success,
      message: data.message,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
};

// Verify OTP
const verifyOTP = async (mobileNumber, otp) => {
  try {
    // const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     phone_number: mobileNumber,
    //     otp_code: otp,
    //   }),
    // });

    setTimeout( () => {},1000);

    let response = {
      ok: true,
      error: null,
      access_token: "my name is ravi",
      success:true,
      message: "otp verified",
      is_new_user: false,

    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to verify OTP");
    }

    // const data = await response.json();
    const data = await response;

    // Store access token if provided
    if (data.access_token) {
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("userPhone", mobileNumber);
    }

    return {
      success: data.success,
      message: data.message,
      isNewUser: data.is_new_user,
      accessToken: data.access_token,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    let errorMessage = "Network error. Please try again.";
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.detail) {
      errorMessage = error.detail;
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Complete user registration
const completeRegistration = async (registrationData) => {
  try {
    const userPhone = localStorage.getItem("userPhone");
    if (!userPhone) {
      throw new Error("User session not found. Please login again.");
    }

    const response = await fetch(`${API_BASE_URL}/auth/complete-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: userPhone,
        name: registrationData.name,
        state: registrationData.state,
        district: registrationData.district,
        primary_crop: registrationData.primaryCrop,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to complete registration");
    }

    const data = await response.json();

    // Update access token if provided
    if (data.access_token) {
      localStorage.setItem("accessToken", data.access_token);
    }

    return {
      success: data.success,
      message: data.message,
      accessToken: data.access_token,
    };
  } catch (error) {
    console.error("Error completing registration:", error);
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
};

// Get user profile
const getUserProfile = async (phoneNumber) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/user-profile?phone_number=${phoneNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get user profile");
    }

    const data = await response.json();
    return {
      success: true,
      user: data,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  const phone = localStorage.getItem("userPhone");
  return !!(token && phone);
};

// Get current user phone
const getCurrentUserPhone = () => {
  return localStorage.getItem("userPhone");
};

// Get current access token
const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Logout user
const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userPhone");
};

// Resend OTP
const resendOTP = async () => {
  const phoneNumber = getCurrentUserPhone();
  if (!phoneNumber) {
    return {
      success: false,
      message: "No phone number found. Please start over.",
    };
  }

  return await sendOTP(phoneNumber);
};

// Export as object (matching chatService pattern)
export const authService = {
  sendOTP,
  verifyOTP,
  completeRegistration,
  getUserProfile,
  isAuthenticated,
  getCurrentUserPhone,
  getAccessToken,
  logout,
  resendOTP,
};
