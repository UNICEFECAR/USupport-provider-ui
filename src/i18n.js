import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  Page,
  Login,
  NotificationPreferences,
  ContactUs,
  PrivacyPolicy,
  FAQ,
} from "#blocks/locales.js";

import {
  NotFoundPage,
  Login as LoginPage,
  NotificationPreferences as NotificationPreferencesPage,
  ContactUs as ContactUsPage,
  FAQ as FAQPage,
  PrivacyPolicy as PrivacyPolicyPage,
} from "#pages/locales.js";

const resources = {
  en: {
    // Blocks
    page: Page.en,
    "contact-us-block": ContactUs.en,
    "notification-preferences": NotificationPreferences.en,
    login: Login.en,
    "privacy-policy": PrivacyPolicy.en,
    faq: FAQ.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "contact-us-page": ContactUsPage.en,
    "notification-preferences-page": NotificationPreferencesPage.en,
    "login-page": LoginPage.en,
    "faq-page": FAQPage.en,
    "privacy-policy-page": PrivacyPolicyPage.en,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
