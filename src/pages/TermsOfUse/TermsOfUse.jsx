import React from "react";
import { useTranslation } from "react-i18next";

import { Page, TermsOfUse as TermsOfUseBlock } from "#blocks";

/**
 * TermsOfUse
 *
 * TermsOfUse Page
 *
 * @returns {JSX.Element}
 */
export const TermsOfUse = () => {
  const { t } = useTranslation("pages", { keyPrefix: "terms-of-use-page" });

  return (
    <Page classes="page__terms-of-use" heading={t("heading")}>
      <TermsOfUseBlock />
    </Page>
  );
};
