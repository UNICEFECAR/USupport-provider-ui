import React, { useCallback, useState } from "react";
import {
  // BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IdleTimer } from "@USupport-components-library/src";
import { useEventListener } from "#hooks";

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
  Campaigns,
  AddCampaignAvailability,
  CampaignDetails,
  CustomersQA,
} from "#pages";

import { ProtectedRoute, CountryValidationRoute } from "../../routes";
import { useGetProviderData } from "#hooks";

export default function Root() {
  const token = localStorage.getItem("token");
  const [loggedIn, setLoggedIn] = useState(!!token);

  const { t } = useTranslation("root");

  useGetProviderData(null, !!token);

  const logoutHandler = useCallback(() => {
    setLoggedIn(false);
  }, []);

  useEventListener("logout", logoutHandler);

  const loginHandler = useCallback(() => {
    setLoggedIn(true);
  }, []);

  useEventListener("login", loginHandler);

  return (
    <React.Fragment>
      {loggedIn && (
        <IdleTimer
          t={t}
          setLoggedIn={setLoggedIn}
          NavigateComponent={Navigate}
        />
      )}
      <Routes>
        <Route
          path="/my-qa"
          element={
            <ProtectedRoute>
              <CustomersQA />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/add-availability"
          element={
            <ProtectedRoute>
              <AddCampaignAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns/details/:id"
          element={
            <ProtectedRoute>
              <CampaignDetails />
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
    </React.Fragment>
  );
}

export { Root };