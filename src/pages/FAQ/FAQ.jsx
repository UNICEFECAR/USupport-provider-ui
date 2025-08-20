import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Page, FAQ as FAQBlock } from "#blocks";

/**
 * FAQ
 *
 * FAQ page
 *
 * @returns {JSX.Element}
 */
export const FAQ = () => {
  const { t } = useTranslation("pages", { keyPrefix: "faq-page" });
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
