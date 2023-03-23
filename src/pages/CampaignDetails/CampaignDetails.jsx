import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Page, CampaignDetails as CampaignDetailsBlock } from "#blocks";
import { useGetCampaigns } from "#hooks";
import { CancelConsultation, JoinConsultation } from "#backdrops";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./campaign-details.scss";

/**
 * CampaignDetails
 *
 * CampaignDetails page
 *
 * @returns {JSX.Element}
 */
export const CampaignDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setIsJoinConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [selectedConsultation, setSelectedConsultation] = useState();

  let shouldFetchData = false;
  let campaignsCacheData = queryClient.getQueryData(["campaigns"]);
  if (!campaignsCacheData) {
    shouldFetchData = true;
  }
  const campaignsQuery = useGetCampaigns(shouldFetchData);

  const campaignsData = campaignsCacheData || campaignsQuery.data;
  const campaignData =
    campaignsData?.providerCampaigns?.find((x) => x.campaignId === id) ||
    campaignsData?.providerPastCampaigns?.find((x) => x.campaignId === id);

  return (
    <Page
      classes="page__campaign-details"
      headingImage={
        campaignData?.sponsorImage
          ? `${AMAZON_S3_BUCKET}/${campaignData.sponsorImage || "default"}`
          : null
      }
      heading={
        !campaignsCacheData && campaignsQuery.isLoading
          ? ""
          : campaignData?.sponsorName + " / " + campaignData?.campaignName
      }
      handleGoBack={() => navigate(-1)}
    >
      <CampaignDetailsBlock
        data={campaignData}
        campaignId={id}
        couponPrice={campaignData?.couponSinglePrice}
        openJoinConsultation={openJoinConsultation}
        openCancelConsultation={openCancelConsultation}
      />
      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={closeCancelConsultation}
          consultation={selectedConsultation}
          couponPrice={campaignData?.couponSinglePrice}
        />
      )}
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
