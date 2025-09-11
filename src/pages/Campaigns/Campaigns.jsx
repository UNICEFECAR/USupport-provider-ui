import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { Page, Campaigns as CampaignsBlock } from "#blocks";

import "./campaigns.scss";

/**
 * Campaigns
 *
 * Campaigns page
 *
 * @returns {JSX.Element}
 */
export const Campaigns = () => {
  const { t } = useTranslation("pages", { keyPrefix: "campaigns-page" });
  const IS_PL = localStorage.getItem("country") === "PL";

  if (!IS_PL) {
    return (
      <Navigate
        to={`/provider/${localStorage.getItem("language")}/dashboard`}
      />
    );
  }

  return (
    <Page
      heading={t("heading")}
      showGoBackArrow={false}
      classes="page__campaigns"
    >
      <CampaignsBlock />
    </Page>
  );
};
