import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Page, TermsOfUse as TermsOfUseBlock } from "#blocks";

/**
 * TermsOfUse
 *
 * TermsOfUse Page
 *
 * @returns {JSX.Element}
 */
export const TermsOfUse = () => {
  const { t } = useTranslation("terms-of-use-page");
  const navigate = useNavigate();

  return (
    <Page
      classes="page__terms-of-use"
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
    >
      <TermsOfUseBlock />
    </Page>
  );
};
