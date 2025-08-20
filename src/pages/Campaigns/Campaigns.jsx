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
  const { t } = useTranslation("campaigns-page");
  const IS_KZ = localStorage.getItem("country") === "KZ";

  if (!IS_KZ) {
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
