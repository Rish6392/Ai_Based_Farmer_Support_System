# Authentication System

This directory contains the complete authentication system for the KisanSewa application with mobile number verification, OTP verification, and user registration.

## Features

- ✅ **Mobile Number Authentication**: Users can login with their mobile number
- ✅ **OTP Verification**: Secure 6-digit OTP verification system  
- ✅ **Auto-redirect**: OTP page is only accessible after sending OTP
- ✅ **User Registration**: New users complete their profile with name, state, district, and primary crop
- ✅ **Session Management**: Auth state is persisted across browser sessions
- ✅ **Protected Routes**: Certain pages require authentication
- ✅ **Responsive Design**: Works on mobile and desktop devices

## File Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Auth state management
├── services/
│   └── authService.js           # API calls for authentication
├── pages/
│   ├── LoginPage.jsx            # Mobile number entry
│   ├── OTPVerificationPage.jsx  # OTP verification
│   └── UserRegistrationPage.jsx # New user profile completion
├── components/
│   ├── ProtectedRoute.jsx       # Route protection wrapper
│   └── Navbar.jsx               # Updated with auth UI
└── App.jsx                      # Updated routing
```

## Usage

### 1. Login Flow

1. User enters mobile number on `/login`
2. OTP is sent to the mobile number
3. User is redirected to `/otp-verification`
4. User enters 6-digit OTP
5. If new user → redirect to `/user-registration`
6. If existing user → redirect to `/chat`

### 2. Testing (Mock Mode)

The auth service is currently in mock mode for testing:

- **Test OTP**: Use `123456` for any mobile number
- **Mock Storage**: User data is stored in localStorage
- **No Real SMS**: No actual SMS is sent

To disable mock mode and use real backend:
```javascript
// In authService.js
const MOCK_MODE = false;
```

### 3. Protected Routes

Routes that require authentication:
- `/chat` - Chatbot page
- `/disease-prediction` - Disease prediction
- `/dashboard` - User dashboard

### 4. Auth Context Usage

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    logout
  } = useAuth();

  // Use auth state and methods
}
```

## Backend Integration

When you implement the real backend, update the `authService.js` file:

1. Set `MOCK_MODE = false`
2. Update `API_BASE_URL` to your backend URL
3. Implement these endpoints:

### Required Backend Endpoints

```
POST /auth/send-otp
Body: { mobileNumber: string }
Response: { success: boolean, sessionId: string, message: string }

POST /auth/verify-otp  
Body: { mobileNumber: string, otp: string, sessionId: string }
Response: { success: boolean, isNewUser: boolean, user?: object, token?: string }

POST /auth/register
Body: { mobileNumber: string, name: string, state: string, district: string, primaryCrop: string }
Response: { success: boolean, user: object, token: string }

GET /auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: { success: boolean, user: object }
```

## Security Features

- ✅ **OTP Expiration**: OTP expires after 5 minutes
- ✅ **Session Protection**: OTP page only accessible with valid session
- ✅ **Token Storage**: JWT tokens stored in localStorage
- ✅ **Route Protection**: Authenticated routes redirect to login
- ✅ **Auto-logout**: Logout clears all stored data

## Mobile-First Design

- ✅ **Responsive UI**: Works on all screen sizes
- ✅ **Touch-friendly**: Large buttons and inputs
- ✅ **Numeric Keypad**: OTP inputs trigger numeric keyboards
- ✅ **Auto-focus**: Smooth navigation between OTP fields
- ✅ **Paste Support**: Can paste 6-digit codes

## State Management

The auth state includes:
- `user`: Current user object
- `isAuthenticated`: Boolean auth status  
- `isLoading`: Loading state for async operations
- `otpSession`: Current OTP session data

## Error Handling

- ✅ **Network Errors**: Graceful handling of connection issues
- ✅ **Validation Errors**: Client-side form validation
- ✅ **Server Errors**: Display of backend error messages
- ✅ **Session Expiry**: Automatic redirect on expired sessions

## Customization

You can customize:
- **States & Districts**: Update the lists in `UserRegistrationPage.jsx`
- **Crops**: Modify the crops array for your region
- **Validation**: Add custom validation rules
- **Styling**: Update Tailwind classes for different designs
- **Timer Duration**: Change OTP expiry time in `AuthContext.jsx`
