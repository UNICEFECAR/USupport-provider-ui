import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Page, FAQ as FAQBlock } from "#blocks";

/**
 * FAQ
 *
 * FAQ page
 *
 * @returns {JSX.Element}
 */
export const FAQ = () => {
  const { t } = useTranslation("faq-page");
  const navigate = useNavigate();

  return (
    <Page
      classes="page__faq"
      heading={t("heading")}
      subheading={t("subheading")}
      handleGoBack={() => navigate(-1)}
    >
      <FAQBlock />
    </Page>
  );
};
