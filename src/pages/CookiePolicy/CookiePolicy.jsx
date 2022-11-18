import React from "react";
import { Page, CookiePolicy as CookiePolicyBlock } from "#blocks";
import { useTranslation } from "react-i18next";

/**
 * CookiePolicy
 *
 * CookiePolicy Page
 *
 * @returns {JSX.Element}
 */
export const CookiePolicy = () => {
  const { t } = useTranslation("cookie-policy-page");
  return (
    <Page
      classes="page__cookie-policy"
      showGoBackArrow={false}
      heading={t("heading")}
    >
      <CookiePolicyBlock />
    </Page>
  );
};
