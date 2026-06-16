import React from "react";
import { useTranslation } from "react-i18next";

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

  return (
    <Page classes="page__cookie-policy" heading={t("heading")}>
      <CookiePolicyBlock />
    </Page>
  );
};
