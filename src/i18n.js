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
  ActivityHistory,
  Consultations,
  Clients,
  Scheduler,
  SchedulerTemplate,
  CookiePolicy,
  TermsOfUse,
  Dashboard,
  Notifications,
  Reports,
  Campaigns,
  CampaignDetails,
  CustomersQA,
  PlatformRating,
} from "#blocks/locales.js";

import {
  NotFoundPage,
  Login as LoginPage,
  NotificationPreferences as NotificationPreferencesPage,
  ContactUs as ContactUsPage,
  FAQ as FAQPage,
  PrivacyPolicy as PrivacyPolicyPage,
  ForgotPassword as ForgotPasswordPage,
  ResetPassword as ResetPasswordPage,
  EditProfileDetails as EditProfileDetailsPage,
  ProviderOverview as ProviderOverviewPage,
  ProviderProfile as ProviderProfilePage,
  SchedulerTemplate as SchedulerTemplatePage,
  CookiePolicy as CookiePolicyPage,
  TermsOfUse as TermsOfUsePage,
  ActivityHistory as ActivityHistoryPage,
  Clients as ClientsPage,
  Consultation as ConsultationPage,
  Reports as ReportsPage,
  Campaigns as CampaignsPage,
  AddCampaignAvailability as AddCampaignAvailabilityPage,
  CustomersQA as CustomersQAPage,
  Consultations as ConsultationsPage,
  Notifications as NotificationsPage,
  PlatformRating as PlatformRatingPage,
} from "#pages/locales.js";

import {
  UploadPicture,
  DeleteProfilePicture,
  ChangePassword,
  DeleteAccount,
  CancelConsultation,
  JoinConsultation,
  SelectConsultation,
  CodeVerification,
  CancelPaidConsultation,
  CreateResponse,
  ArchiveQuestion,
  QuestionDetails,
  FilterQuestions,
} from "#backdrops/locales.js";

import { Root } from "#routes/locales.js";

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
    "activity-history": ActivityHistory.en,
    consultations: Consultations.en,
    clients: Clients.en,
    scheduler: Scheduler.en,
    "scheduler-template": SchedulerTemplate.en,
    "cookie-policy": CookiePolicy.en,
    "terms-of-use": TermsOfUse.en,
    dashboard: Dashboard.en,
    notifications: Notifications.en,
    reports: Reports.en,
    campaigns: Campaigns.en,
    "campaign-details": CampaignDetails.en,
    "customers-qa": CustomersQA.en,
    "platform-rating": PlatformRating.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "contact-us-page": ContactUsPage.en,
    "notification-preferences-page": NotificationPreferencesPage.en,
    "login-page": LoginPage.en,
    "faq-page": FAQPage.en,
    "privacy-policy-page": PrivacyPolicyPage.en,
    "forgot-password-page": ForgotPasswordPage.en,
    "reset-password-page": ResetPasswordPage.en,
    "edit-profile-details-page": EditProfileDetailsPage.en,
    "provider-profile-page": ProviderProfilePage.en,
    "provider-overview-page": ProviderOverviewPage.en,
    "scheduler-template-page": SchedulerTemplatePage.en,
    "cookie-policy-page": CookiePolicyPage.en,
    "terms-of-use-page": TermsOfUsePage.en,
    "activity-history-page": ActivityHistoryPage.en,
    "clients-page": ClientsPage.en,
    "consultation-page": ConsultationPage.en,
    "reports-page": ReportsPage.en,
    "campaigns-page": CampaignsPage.en,
    "add-campaign-availability-page": AddCampaignAvailabilityPage.en,
    "customers-qa-page": CustomersQAPage.en,
    "consultations-page": ConsultationsPage.en,
    "notifications-page": NotificationsPage.en,
    "platform-rating-page": PlatformRatingPage.en,

    // Backdrops
    "upload-picture": UploadPicture.en,
    "delete-profile-picture": DeleteProfilePicture.en,
    "change-password-backdrop": ChangePassword.en,
    "delete-account": DeleteAccount.en,
    "cancel-consultation": CancelConsultation.en,
    "join-consultation": JoinConsultation.en,
    "select-consultation": SelectConsultation.en,
    "code-verification": CodeVerification.en,
    "cancel-paid-consultation": CancelPaidConsultation.en,
    "create-response": CreateResponse.en,
    "archive-question": ArchiveQuestion.en,
    "question-details": QuestionDetails.en,
    "filter-questions": FilterQuestions.en,

    // Routes
    root: Root.en,
  },

  ru: {
    // Blocks
    page: Page.ru,
    "contact-us-block": ContactUs.ru,
    "notification-preferences": NotificationPreferences.ru,
    login: Login.ru,
    "privacy-policy": PrivacyPolicy.ru,
    welcome: Welcome.ru,
    faq: FAQ.ru,
    "forgot-password": ForgotPassword.ru,
    "reset-password": ResetPassword.ru,
    "edit-profile-details": EditProfileDetails.ru,
    "provider-overview": ProviderOverview.ru,
    "provider-profile": ProviderProfile.ru,
    "activity-history": ActivityHistory.ru,
    consultations: Consultations.ru,
    clients: Clients.ru,
    scheduler: Scheduler.ru,
    "scheduler-template": SchedulerTemplate.ru,
    "cookie-policy": CookiePolicy.ru,
    "terms-of-use": TermsOfUse.ru,
    dashboard: Dashboard.ru,
    notifications: Notifications.ru,
    reports: Reports.ru,
    campaigns: Campaigns.ru,
    "campaign-details": CampaignDetails.ru,
    "customers-qa": CustomersQA.ru,
    "platform-rating": PlatformRating.ru,

    // Pages
    "not-found-page": NotFoundPage.ru,
    "contact-us-page": ContactUsPage.ru,
    "notification-preferences-page": NotificationPreferencesPage.ru,
    "login-page": LoginPage.ru,
    "faq-page": FAQPage.ru,
    "privacy-policy-page": PrivacyPolicyPage.ru,
    "forgot-password-page": ForgotPasswordPage.ru,
    "reset-password-page": ResetPasswordPage.ru,
    "edit-profile-details-page": EditProfileDetailsPage.ru,
    "provider-profile-page": ProviderProfilePage.ru,
    "provider-overview-page": ProviderOverviewPage.ru,
    "scheduler-template-page": SchedulerTemplatePage.ru,
    "cookie-policy-page": CookiePolicyPage.ru,
    "terms-of-use-page": TermsOfUsePage.ru,
    "activity-history-page": ActivityHistoryPage.ru,
    "clients-page": ClientsPage.ru,
    "consultation-page": ConsultationPage.ru,
    "reports-page": ReportsPage.ru,
    "add-campaign-availability-page": AddCampaignAvailabilityPage.ru,
    "campaigns-page": CampaignsPage.ru,
    "customers-qa-page": CustomersQAPage.ru,
    "consultations-page": ConsultationsPage.ru,
    "notifications-page": NotificationsPage.ru,
    "platform-rating-page": PlatformRatingPage.ru,

    // Backdrops
    "upload-picture": UploadPicture.ru,
    "delete-profile-picture": DeleteProfilePicture.ru,
    "change-password-backdrop": ChangePassword.ru,
    "delete-account": DeleteAccount.ru,
    "cancel-consultation": CancelConsultation.ru,
    "join-consultation": JoinConsultation.ru,
    "select-consultation": SelectConsultation.ru,
    "code-verification": CodeVerification.ru,
    "cancel-paid-consultation": CancelPaidConsultation.ru,
    "create-response": CreateResponse.ru,
    "archive-question": ArchiveQuestion.ru,
    "question-details": QuestionDetails.ru,
    "filter-questions": FilterQuestions.ru,

    // Routes
    root: Root.ru,
  },

  kk: {
    // Blocks
    page: Page.kk,
    "contact-us-block": ContactUs.kk,
    "notification-preferences": NotificationPreferences.kk,
    login: Login.kk,
    "privacy-policy": PrivacyPolicy.kk,
    welcome: Welcome.kk,
    faq: FAQ.kk,
    "forgot-password": ForgotPassword.kk,
    "reset-password": ResetPassword.kk,
    "edit-profile-details": EditProfileDetails.kk,
    "provider-overview": ProviderOverview.kk,
    "provider-profile": ProviderProfile.kk,
    "activity-history": ActivityHistory.kk,
    consultations: Consultations.kk,
    clients: Clients.kk,
    scheduler: Scheduler.kk,
    "scheduler-template": SchedulerTemplate.kk,
    "cookie-policy": CookiePolicy.kk,
    "terms-of-use": TermsOfUse.kk,
    dashboard: Dashboard.kk,
    notifications: Notifications.kk,
    reports: Reports.kk,
    campaigns: Campaigns.kk,
    "campaign-details": CampaignDetails.kk,
    "customers-qa": CustomersQA.kk,
    "platform-rating": PlatformRating.kk,

    // Pages
    "not-found-page": NotFoundPage.kk,
    "contact-us-page": ContactUsPage.kk,
    "notification-preferences-page": NotificationPreferencesPage.kk,
    "login-page": LoginPage.kk,
    "faq-page": FAQPage.kk,
    "privacy-policy-page": PrivacyPolicyPage.kk,
    "forgot-password-page": ForgotPasswordPage.kk,
    "reset-password-page": ResetPasswordPage.kk,
    "edit-profile-details-page": EditProfileDetailsPage.kk,
    "provider-profile-page": ProviderProfilePage.kk,
    "provider-overview-page": ProviderOverviewPage.kk,
    "scheduler-template-page": SchedulerTemplatePage.kk,
    "cookie-policy-page": CookiePolicyPage.kk,
    "terms-of-use-page": TermsOfUsePage.kk,
    "activity-history-page": ActivityHistoryPage.kk,
    "clients-page": ClientsPage.kk,
    "consultation-page": ConsultationPage.kk,
    "reports-page": ReportsPage.kk,
    "add-campaign-availability-page": AddCampaignAvailabilityPage.kk,
    "campaigns-page": CampaignsPage.kk,
    "customers-qa-page": CustomersQAPage.kk,
    "consultations-page": ConsultationsPage.kk,
    "notifications-page": NotificationsPage.kk,
    "platform-rating-page": PlatformRatingPage.kk,

    // Backdrops
    "upload-picture": UploadPicture.kk,
    "delete-profile-picture": DeleteProfilePicture.kk,
    "change-password-backdrop": ChangePassword.kk,
    "delete-account": DeleteAccount.kk,
    "cancel-consultation": CancelConsultation.kk,
    "join-consultation": JoinConsultation.kk,
    "select-consultation": SelectConsultation.kk,
    "code-verification": CodeVerification.kk,
    "cancel-paid-consultation": CancelPaidConsultation.kk,
    "create-response": CreateResponse.kk,
    "archive-question": ArchiveQuestion.kk,
    "question-details": QuestionDetails.kk,
    "filter-questions": FilterQuestions.kk,

    // Routes
    root: Root.kk,
  },

  uk: {
    // Blocks
    page: Page.uk,
    "contact-us-block": ContactUs.uk,
    "notification-preferences": NotificationPreferences.uk,
    login: Login.uk,
    "privacy-policy": PrivacyPolicy.uk,
    welcome: Welcome.uk,
    faq: FAQ.uk,
    "forgot-password": ForgotPassword.uk,
    "reset-password": ResetPassword.uk,
    "edit-profile-details": EditProfileDetails.uk,
    "provider-overview": ProviderOverview.uk,
    "provider-profile": ProviderProfile.uk,
    "activity-history": ActivityHistory.uk,
    consultations: Consultations.uk,
    clients: Clients.uk,
    scheduler: Scheduler.uk,
    "scheduler-template": SchedulerTemplate.uk,
    "cookie-policy": CookiePolicy.uk,
    "terms-of-use": TermsOfUse.uk,
    dashboard: Dashboard.uk,
    notifications: Notifications.uk,
    reports: Reports.uk,
    campaigns: Campaigns.uk,
    "campaign-details": CampaignDetails.uk,
    "customers-qa": CustomersQA.uk,
    "platform-rating": PlatformRating.uk,

    // Pages
    "not-found-page": NotFoundPage.uk,
    "contact-us-page": ContactUsPage.uk,
    "notification-preferences-page": NotificationPreferencesPage.uk,
    "login-page": LoginPage.uk,
    "faq-page": FAQPage.uk,
    "privacy-policy-page": PrivacyPolicyPage.uk,
    "forgot-password-page": ForgotPasswordPage.uk,
    "reset-password-page": ResetPasswordPage.uk,
    "edit-profile-details-page": EditProfileDetailsPage.uk,
    "provider-profile-page": ProviderProfilePage.uk,
    "provider-overview-page": ProviderOverviewPage.uk,
    "scheduler-template-page": SchedulerTemplatePage.uk,
    "cookie-policy-page": CookiePolicyPage.uk,
    "terms-of-use-page": TermsOfUsePage.uk,
    "activity-history-page": ActivityHistoryPage.uk,
    "clients-page": ClientsPage.uk,
    "consultation-page": ConsultationPage.uk,
    "reports-page": ReportsPage.uk,
    "add-campaign-availability-page": AddCampaignAvailabilityPage.uk,
    "campaigns-page": CampaignsPage.uk,
    "customers-qa-page": CustomersQAPage.uk,
    "consultations-page": ConsultationsPage.uk,
    "notifications-page": NotificationsPage.uk,
    "platform-rating-page": PlatformRatingPage.uk,

    // Backdrops
    "upload-picture": UploadPicture.uk,
    "delete-profile-picture": DeleteProfilePicture.uk,
    "change-password-backdrop": ChangePassword.uk,
    "delete-account": DeleteAccount.uk,
    "cancel-consultation": CancelConsultation.uk,
    "join-consultation": JoinConsultation.uk,
    "select-consultation": SelectConsultation.uk,
    "code-verification": CodeVerification.uk,
    "cancel-paid-consultation": CancelPaidConsultation.uk,
    "create-response": CreateResponse.uk,
    "archive-question": ArchiveQuestion.uk,
    "question-details": QuestionDetails.uk,
    "filter-questions": FilterQuestions.uk,

    // Routes
    root: Root.uk,
  },

  po: {
    // Blocks
    page: Page.po,
    "contact-us-block": ContactUs.po,
    "notification-preferences": NotificationPreferences.po,
    login: Login.po,
    "privacy-policy": PrivacyPolicy.po,
    welcome: Welcome.po,
    faq: FAQ.po,
    "forgot-password": ForgotPassword.po,
    "reset-password": ResetPassword.po,
    "edit-profile-details": EditProfileDetails.po,
    "provider-overview": ProviderOverview.po,
    "provider-profile": ProviderProfile.po,
    "activity-history": ActivityHistory.po,
    consultations: Consultations.po,
    clients: Clients.po,
    scheduler: Scheduler.po,
    "scheduler-template": SchedulerTemplate.po,
    "cookie-policy": CookiePolicy.po,
    "terms-of-use": TermsOfUse.po,
    dashboard: Dashboard.po,
    notifications: Notifications.po,
    reports: Reports.po,
    campaigns: Campaigns.po,
    "campaign-details": CampaignDetails.po,
    "customers-qa": CustomersQA.po,
    "platform-rating": PlatformRating.po,

    // Pages
    "not-found-page": NotFoundPage.po,
    "contact-us-page": ContactUsPage.po,
    "notification-preferences-page": NotificationPreferencesPage.po,
    "login-page": LoginPage.po,
    "faq-page": FAQPage.po,
    "privacy-policy-page": PrivacyPolicyPage.po,
    "forgot-password-page": ForgotPasswordPage.po,
    "reset-password-page": ResetPasswordPage.po,
    "edit-profile-details-page": EditProfileDetailsPage.po,
    "provider-profile-page": ProviderProfilePage.po,
    "provider-overview-page": ProviderOverviewPage.po,
    "scheduler-template-page": SchedulerTemplatePage.po,
    "cookie-policy-page": CookiePolicyPage.po,
    "terms-of-use-page": TermsOfUsePage.po,
    "activity-history-page": ActivityHistoryPage.po,
    "clients-page": ClientsPage.po,
    "consultation-page": ConsultationPage.po,
    "reports-page": ReportsPage.po,
    "add-campaign-availability-page": AddCampaignAvailabilityPage.po,
    "campaigns-page": CampaignsPage.po,
    "customers-qa-page": CustomersQAPage.po,
    "consultations-page": ConsultationsPage.po,
    "notifications-page": NotificationsPage.po,
    "platform-rating-page": PlatformRatingPage.po,

    // Backdrops
    "upload-picture": UploadPicture.po,
    "delete-profile-picture": DeleteProfilePicture.po,
    "change-password-backdrop": ChangePassword.po,
    "delete-account": DeleteAccount.po,
    "cancel-consultation": CancelConsultation.po,
    "join-consultation": JoinConsultation.po,
    "select-consultation": SelectConsultation.po,
    "code-verification": CodeVerification.po,
    "cancel-paid-consultation": CancelPaidConsultation.po,
    "create-response": CreateResponse.po,
    "archive-question": ArchiveQuestion.po,
    "question-details": QuestionDetails.po,
    "filter-questions": FilterQuestions.po,

    // Routes
    root: Root.po,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
