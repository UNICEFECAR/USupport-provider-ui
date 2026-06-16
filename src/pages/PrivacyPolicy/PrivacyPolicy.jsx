import React from "react";
import { useTranslation } from "react-i18next";

import { Page, PrivacyPolicy as PrivacyPolicyBlock } from "#blocks";

/**
 * PrivacyPolicy
 *
 * Privacy Policy page
 *
 * @returns {JSX.Element}
 */
export const PrivacyPolicy = () => {
  const { t } = useTranslation("pages", { keyPrefix: "privacy-policy-page" });

  return (
    <Page classes="page__privacy-policy" heading={t("heading")}>
      <PrivacyPolicyBlock />
    </Page>
  );
};
