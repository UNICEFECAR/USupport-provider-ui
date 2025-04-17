import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { IdleTimer } from "@USupport-components-library/src";
import { userSvc } from "@USupport-components-library/services";

import { useEventListener, useGetProviderData } from "#hooks";

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
  PlatformRating,
  // JitsiRoom,
} from "#pages";

import { ProtectedRoute, CountryValidationRoute } from "../../routes";
const RootContext = React.createContext();

const LanguageLayout = () => {
  const { language } = useParams();

  const allLangs = ["en", "ru", "kk", "pl", "uk"];

  if (!allLangs.includes(language) || !language) {
    return <Navigate to="/en/provider" />;
  }
  return (
    <Routes>
      <Route
        path="/provider/my-qa"
        element={
          <ProtectedRoute>
            <CustomersQA />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/contact-us"
        element={
          <ProtectedRoute>
            <ContactUs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/activity-history"
        element={
          <ProtectedRoute>
            <ActivityHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/notification-preferences"
        element={
          <ProtectedRoute>
            <NotificationPreferencesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/login"
        element={
          <CountryValidationRoute>
            <Login />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* <Route
      path="/provider/consultation"
      element={
        <ProtectedRoute>
          <Consultation />
        </ProtectedRoute>
      }
    /> */}
      <Route
        path="/provider/consultation"
        element={
          <ProtectedRoute>
            {/* <JitsiRoom /> */}
            <Consultation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/profile"
        element={
          <ProtectedRoute>
            <ProviderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/profile/details"
        element={
          <ProtectedRoute>
            <ProviderOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/profile/details/edit"
        element={
          <ProtectedRoute>
            <EditProfileDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/calendar"
        element={
          <ProtectedRoute>
            <Scheduler />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/calendar/template"
        element={
          <ProtectedRoute>
            <SchedulerTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/privacy-policy"
        element={
          <CountryValidationRoute>
            <PrivacyPolicy />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/cookie-policy"
        element={
          <CountryValidationRoute>
            <CookiePolicy />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/terms-of-use"
        element={
          <CountryValidationRoute>
            <TermsOfUse />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/forgot-password"
        element={
          <CountryValidationRoute>
            <ForgotPassword />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/reset-password"
        element={
          <CountryValidationRoute>
            <ResetPassword />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/provider/faq"
        element={
          <ProtectedRoute>
            <FAQ />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/consultations"
        element={
          <ProtectedRoute>
            <Consultations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/campaigns/add-availability"
        element={
          <ProtectedRoute>
            <AddCampaignAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/campaigns/details/:id"
        element={
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/platform-rating"
        element={
          <ProtectedRoute>
            <PlatformRating />
          </ProtectedRoute>
        }
      />
      <Route path="/provider/login" element={<Login />} />
      <Route path="/provider/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/provider/forgot-password" element={<ForgotPassword />} />
      <Route path="/provider/reset-password" element={<ResetPassword />} />
      <Route path="/provider/faq" element={<FAQ />} />
      <Route path="/provider/" element={<Welcome />} />
      <Route path="/provider/*" element={<NotFound />} />
    </Routes>
  );
};

export default function Root() {
  const token = localStorage.getItem("token");
  const [loggedIn, setLoggedIn] = useState(!!token);
  const language = localStorage.getItem("language");

  const { t } = useTranslation("root");

  const enabled = !!token && loggedIn;
  useGetProviderData(null, enabled);

  const logoutHandler = useCallback(() => {
    setLoggedIn(false);
  }, []);

  useEventListener("logout", logoutHandler);

  const loginHandler = useCallback(() => {
    setLoggedIn(true);
  }, []);

  useEventListener("login", loginHandler);

  useQuery({
    queryKey: ["addPlatformAccess", loggedIn],
    queryFn: async () => await userSvc.addPlatformAccess("provider"),
    staleTime: Infinity,
  });

  const location = useLocation();
  const [hideIdleTimer, setHideIdleTimer] = useState(false);

  const previousLocation = useRef();
  const leaveConsultationFn = useRef(null);

  // If the user is in a consultation and navigates to a different page through
  // some of the tabs we have to make sure that he will be disconnected from the consultation
  // This is done by placing the leaveConsultationFn ref in the RootContext so it can be accessible everywhere
  // and then setting it to the "leaveConsultation" function in the "Consultation" page
  useEffect(() => {
    const currentUrl = location.pathname;
    if (
      previousLocation.current === "/consultation" &&
      currentUrl !== "/consultation"
    ) {
      if (leaveConsultationFn.current) {
        leaveConsultationFn.current();
      }
    }

    previousLocation.current = currentUrl;

    if (currentUrl === "/consultation") {
      setHideIdleTimer(true);
    } else if (hideIdleTimer) {
      setHideIdleTimer(false);
    }
  }, [location]);
  return (
    <RootContext.Provider
      value={{
        leaveConsultationFn,
      }}
    >
      {loggedIn && !hideIdleTimer && (
        <IdleTimer
          t={t}
          setLoggedIn={setLoggedIn}
          NavigateComponent={Navigate}
        />
      )}
      <Routes>
        <Route
          path="/:language"
          element={<Navigate to={`/${language}/provider`} replace />}
        />
        <Route path=":language/*" element={<LanguageLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RootContext.Provider>
  );
}

export { Root, RootContext };
