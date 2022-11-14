import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  Page,
  Login,
  NotificationPreferences,
  ContactUs,
  PrivacyPolicy,
  FAQ,
  Welcome,
  ForgotPassword,
  ResetPassword,
  EditProfileDetails,
  ProviderOverview,
  ProviderProfile,
} from "#blocks/locales.js";

import {
  NotFoundPage,
  Login as LoginPage,
  NotificationPreferences as NotificationPreferencesPage,
  ContactUs as ContactUsPage,
  FAQ as FAQPage,
  PrivacyPolicy as PrivacyPolicyPage,
  Welcome as WelcomePage,
  ForgotPassword as ForgotPasswordPage,
  ResetPassword as ResetPasswordPage,
  EditProfileDetails as EditProfileDetailsPage,
  ProviderOverview as ProviderOverviewPage,
  ProviderProfile as ProviderProfilePage,
} from "#pages/locales.js";

import {
  UploadPicture,
  DeleteProfilePicture,
  ChangePassword,
  DeleteAccount,
} from "#backdrops/locales.js";

const resources = {
  en: {
    // Blocks
    page: Page.en,
    "contact-us-block": ContactUs.en,
    "notification-preferences": NotificationPreferences.en,
    login: Login.en,
    "privacy-policy": PrivacyPolicy.en,
    welcome: Welcome.en,
    faq: FAQ.en,
    "forgot-password": ForgotPassword.en,
    "reset-password": ResetPassword.en,
    "edit-profile-details": EditProfileDetails.en,
    "provider-overview": ProviderOverview.en,
    "provider-profile": ProviderProfile.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "contact-us-page": ContactUsPage.en,
    "notification-preferences-page": NotificationPreferencesPage.en,
    "login-page": LoginPage.en,
    "faq-page": FAQPage.en,
    "privacy-policy-page": PrivacyPolicyPage.en,
    "welcome-page": WelcomePage.en,
    "forgot-password-page": ForgotPasswordPage.en,
    "reset-password-page": ResetPasswordPage.en,
    "edit-profile-details-page": EditProfileDetailsPage.en,
    "provider-profile-page": ProviderProfilePage.en,
    "provider-overview-page": ProviderOverviewPage.en,

    // Backdrops
    "upload-picture": UploadPicture.en,
    "delete-profile-picture": DeleteProfilePicture.en,
    "change-password-backdrop": ChangePassword.en,
    "delete-account": DeleteAccount.en,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
