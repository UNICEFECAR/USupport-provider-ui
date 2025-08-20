import React from "react";
import { useCustomNavigate as useNavigate } from "#hooks";
import { Page, NotificationPreferences } from "#blocks";
import { useTranslation } from "react-i18next";

import "./notification-preferences.scss";

/**
 * NotificationPreferences
 *
 * Notification preferences page
 *
 * @returns {JSX.Element}
 */
export const NotificationPreferencesPage = () => {
  const { t } = useTranslation("pages", {
    keyPrefix: "notification-preferences-page",
  });
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Page
      heading={t("heading")}
      subheading={t("subheading")}
      classes="page__notification-preferences"
      handleGoBack={handleGoBack}
    >
      <NotificationPreferences />
    </Page>
  );
};
