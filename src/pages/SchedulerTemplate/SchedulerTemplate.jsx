import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("scheduler-template-page");

  return (
    <Page
      heading={t("heading")}
      subheading={t("subheading")}
      classes="page__scheduler-template"
    >
      <SchedulerTemplateBlock />
    </Page>
  );
};
