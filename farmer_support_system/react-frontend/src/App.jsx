import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout, ProtectedRoute } from "./components";
import {
  LandingPage,
  ChatbotPage,
  DiseasePredictionPage,
  DashboardPage,
  ContactPage,
  FaqPage,
  NotFoundPage,
  LoginPage,
  OTPVerificationPage,
  UserRegistrationPage,
} from "./pages";
import { ChatProvider, DocumentProvider, AuthProvider } from "./context";
import { withOTPSession } from "./components/ProtectedRoute";

// Wrap OTP-required pages with session check
const ProtectedOTPVerificationPage = withOTPSession(OTPVerificationPage);
const ProtectedUserRegistrationPage = withOTPSession(UserRegistrationPage);

function App() {
  return (
    <>
    <AuthProvider>
      <ChatProvider>
        <DocumentProvider>
          <Routes>
            {/* Auth routes - no layout */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/otp-verification"
              element={<ProtectedOTPVerificationPage />}
            />
            <Route
              path="/user-registration"
              element={<ProtectedUserRegistrationPage />}
            />

            {/* Main app routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route
                path="chat"
                element={
                  // <ProtectedRoute>
                  <ChatbotPage />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="disease-prediction"
                element={
                  // <ProtectedRoute>
                  <DiseasePredictionPage />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  // <ProtectedRoute>
                  <DashboardPage />
                  //  </ProtectedRoute>
                }
              />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </DocumentProvider>
      </ChatProvider>
    </AuthProvider>
    </>
  );
}

export default App;
