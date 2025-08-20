import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

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
  const navigate = useNavigate();

  return (
    <Page
      classes="page__privacy-policy"
      showGoBackArrow={true}
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
    >
      <PrivacyPolicyBlock />
    </Page>
  );
};
