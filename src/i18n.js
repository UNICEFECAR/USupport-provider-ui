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
} from "#pages/locales.js";

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
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
