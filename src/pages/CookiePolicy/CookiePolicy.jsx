import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Page, CookiePolicy as CookiePolicyBlock } from "#blocks";

/**
 * CookiePolicy
 *
 * CookiePolicy Page
 *
 * @returns {JSX.Element}
 */
export const CookiePolicy = () => {
  const { t } = useTranslation("pages", { keyPrefix: "cookie-policy-page" });
  const navigate = useNavigate();

  return (
    <Page
      classes="page__cookie-policy"
      heading={t("heading")}
      handleGoBack={() => navigate(-1)}
    >
      <CookiePolicyBlock />
    </Page>
  );
};
