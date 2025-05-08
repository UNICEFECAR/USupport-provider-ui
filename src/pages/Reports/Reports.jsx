import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Page, Reports as ReportsBlock } from "#blocks";

import "./reports.scss";

/**
 * Reports
 *
 * Reports page
 *
 * @returns {JSX.Element}
 */
export const Reports = () => {
  const { t } = useTranslation("reports-page");
  const navigate = useNavigate();
  return (
    <Page
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
      classes="page__reports"
    >
      <ReportsBlock />
    </Page>
  );
};
