import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NotFound,
  ContactUs,
  NotificationPreferencesPage,
  Login,
  PrivacyPolicy,
  FAQ,
  Welcome,
  ForgotPassword,
  ResetPassword,
  EditProfileDetails,
  ProviderOverview,
  ProviderProfile,
  Consultations,
} from "./pages";

import { ProtectedRoute, CountryValidationRoute } from "./routes";

import "./App.scss";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// AOS imports
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  AOS.init({
    offset: 10,
    duration: 1000,
    easing: "ease-in-sine",
    delay: 300,
    anchorPlacement: "top-bottom",
    once: false,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/provider">
        <Routes>
          <Route
            path="/contact-us"
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification-preferences"
            element={
              <ProtectedRoute>
                <NotificationPreferencesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <CountryValidationRoute>
                <Login />
              </CountryValidationRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProviderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/details"
            element={
              <ProtectedRoute>
                <ProviderOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/details/edit"
            element={
              <ProtectedRoute>
                <EditProfileDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <CountryValidationRoute>
                <PrivacyPolicy />
              </CountryValidationRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <CountryValidationRoute>
                <ForgotPassword />
              </CountryValidationRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <CountryValidationRoute>
                <ResetPassword />
              </CountryValidationRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/" element={<Welcome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
