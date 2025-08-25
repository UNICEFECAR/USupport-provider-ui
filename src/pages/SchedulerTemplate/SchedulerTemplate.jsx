import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { Page, SchedulerTemplate as SchedulerTemplateBlock } from "#blocks";

import "./scheduler-template.scss";

/**
 * SchedulerTemplate
 *
 * Edit scheduler availability template
 *
 * @returns {JSX.Element}
 */
export const SchedulerTemplate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("pages", {
    keyPrefix: "scheduler-template-page",
  });

  const handleGoBack = () => navigate(-1);
  return (
    <Page
      heading={t("heading")}
      subheading={t("subheading")}
      classes="page__scheduler-template"
      handleGoBack={handleGoBack}
    >
      <SchedulerTemplateBlock />
    </Page>
  );
};
