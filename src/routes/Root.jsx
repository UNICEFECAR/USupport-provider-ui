import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  ActivityHistory,
  Consultations,
  Clients,
  Scheduler,
  SchedulerTemplate,
  CookiePolicy,
  TermsOfUse,
  Dashboard,
  Consultation,
  Notifications,
  Reports,
} from "#pages";

import { ProtectedRoute, CountryValidationRoute } from "../routes";
import { useGetProviderData, useCheckHasUnreadNotifications } from "#hooks";

export default function Root() {
  const token = localStorage.getItem("token");
  useGetProviderData(null, !!token);

  return (
    <Router basename="/provider">
      <Routes>
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-us"
          element={
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-history"
          element={
            <ProtectedRoute>
              <ActivityHistory />
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultation"
          element={
            <ProtectedRoute>
              <Consultation />
            </ProtectedRoute>
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
          path="/calendar"
          element={
            <ProtectedRoute>
              <Scheduler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar/template"
          element={
            <ProtectedRoute>
              <SchedulerTemplate />
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
          path="/cookie-policy"
          element={
            <CountryValidationRoute>
              <CookiePolicy />
            </CountryValidationRoute>
          }
        />
        <Route
          path="/terms-of-use"
          element={
            <CountryValidationRoute>
              <TermsOfUse />
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
        <Route
          path="/consultations"
          element={
            <ProtectedRoute>
              <Consultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/" element={<Welcome />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export { Root };
