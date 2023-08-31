import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

import { Page, SchedulerTemplate } from "#blocks";
import { useGetCampaigns } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./add-campaign-availability.scss";

/**
 * AddCampaignAvailability
 *
 * Add campaign availability page
 *
 * @returns {JSX.Element}
 */
export const AddCampaignAvailability = () => {
  const { t } = useTranslation("add-campaign-availability-page");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const campaignId = new URLSearchParams(window.location.search).get(
    "campaignId"
  );

  let shouldFetchData = false;
  let campaignsCacheData = queryClient.getQueryData(["campaigns"]);
  if (!campaignsCacheData) {
    shouldFetchData = true;
  }

  const campaignsQuery = useGetCampaigns(shouldFetchData);

  const campaignsData = campaignsCacheData || campaignsQuery.data;
  const campaignData = campaignsData?.providerCampaigns?.find(
    (x) => x.campaignId === campaignId
  );

  if (!campaignId) return <Navigate to="/campaigns" />;

  return (
    <Page
      classes="page__add-campaign-availability"
      handleGoBack={() => navigate(-1)}
      headingImage={
        campaignData?.sponsorImage
          ? `${AMAZON_S3_BUCKET}/${campaignData.sponsorImage || "default"}`
          : null
      }
      heading={`${
        !campaignsCacheData && campaignsQuery.isLoading
          ? ""
          : campaignData?.sponsorName + " / " + campaignData?.campaignName
      } - ${t("heading")}`}
    >
      <SchedulerTemplate isForCampaign campaignId={campaignId} />
    </Page>
  );
};
