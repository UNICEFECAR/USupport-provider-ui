import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Block,
  BaseTable,
  CheckBox,
  Grid,
  GridItem,
  Modal,
  Loading,
} from "@USupport-components-library/src";

import {
  useGetCampaigns,
  useEnrollProviderInCampaign,
  useGetProviderData,
} from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./campaigns.scss";
import { useNavigate } from "react-router-dom";

/**
 * Campaigns
 *
 * Campaigns block
 *
 * @return {jsx}
 */
export const Campaigns = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("campaigns");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState();
  const [hasAgreedToPayout, setHasAgreedToPayout] = useState(false);

  const campaignsQuery = useGetCampaigns();
  const data = campaignsQuery.data;

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

  const baseRows = [
    t("sponsor"),
    t("campaign"),
    t("coupon_single_price"),
    t("period"),
  ];

  const providerCampaignRows = [
    ...baseRows,
    t("consultations_with_you"),
    t("your_payment"),
  ];

  const providerCampaignsRowsData = data?.providerCampaigns.map((campaign) => {
    return [
      <div className="campaigns__sponsor-container">
        <img
          className="campaigns__sponsor-container__image"
          src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
        />
        <p>{campaign.sponsorName}</p>
      </div>,
      <p>{campaign.campaignName}</p>,
      <p>
        {campaign.couponSinglePrice}
        {currencySymbol}
      </p>,
      <p>
        {campaign.startDate} - {campaign.endDate}
      </p>,
      <p>{campaign.conductedConsultationsForCampaign}</p>,
      <p>
        {campaign.conductedConsultationsForCampaign *
          campaign.couponSinglePrice}
        {currencySymbol}
      </p>,
    ];
  });

  const providerPastCampaignsRowsData = data?.providerPastCampaigns.map(
    (campaign) => {
      return [
        <div className="campaigns__sponsor-container">
          <img
            className="campaigns__sponsor-container__image"
            src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
          />
          <p>{campaign.sponsorName}</p>
        </div>,
        <p>{campaign.campaignName}</p>,
        <p>
          {campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
        <p>
          {campaign.startDate} - {campaign.endDate}
        </p>,
        <p>{campaign.conductedConsultationsForCampaign}</p>,
        <p>
          {campaign.conductedConsultationsForCampaign *
            campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
      ];
    }
  );

  const availableCampaignsRowsData = data?.availableCampaigns.map(
    (campaign) => {
      return [
        <div className="campaigns__sponsor-container">
          <img
            className="campaigns__sponsor-container__image"
            src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
          />
          <p>{campaign.sponsorName}</p>
        </div>,
        <p>{campaign.campaignName}</p>,
        <p>
          {campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
        <p>
          {campaign.startDate} - {campaign.endDate}
        </p>,
      ];
    }
  );

  const providerCampaignsMenuOptions = [
    {
      icon: "calendar",
      text: t("add_availability"),
      handleClick: (campaignId) => {
        if (providerStatus !== "active") {
          toast(t("not_allowed"), { type: "error" });
          return;
        }
        navigate(`/campaigns/add-availability?campaignId=${campaignId}`);
      },
    },
    {
      icon: "view",
      text: t("view_details"),
      handleClick: (campaignId) => {
        navigate(`/campaigns/details/${campaignId}`);
      },
    },
  ];

  const availableTableMenuOptions = [
    {
      icon: "view",
      text: t("enroll"),
      handleClick: (campaignId) => {
        if (providerStatus !== "active") {
          toast(t("not_allowed"), { type: "error" });
          return;
        }
        const campaign = data?.availableCampaigns.find(
          (x) => x.campaignId === campaignId
        );
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
      },
    },
  ];

  const onSuccess = () => {
    toast(t("success"));
    setIsModalOpen(false);
    campaignsQuery.refetch();
  };
  const onError = (error) => {
    toast(error, { type: "error" });
  };
  const enrollInCampaignMutation = useEnrollProviderInCampaign(
    onSuccess,
    onError
  );

  const enrollInCampaign = () => {
    enrollInCampaignMutation.mutate(selectedCampaign.campaignId);
  };

  return (
    <Block classes="campaigns">
      <Grid classes="campaigns__grid">
        <GridItem md={2} lg={2} classes="campaigns__grid__heading-item">
          <p>
            {t("campaigns")}: {data?.availableCampaigns.length}
          </p>
        </GridItem>
        <GridItem md={3} lg={2} classes="campaigns__grid__heading-item">
          <p>
            {t("campaigns_participate")}: {data?.providerCampaigns.length}
          </p>
        </GridItem>
      </Grid>

      {/* Available campaigns */}
      <Grid classes="campaigns__grid">
        <GridItem md={8} lg={12} classes="campaigns__grid__participate-heading">
          <p className="text">{t("available_campaigns")}</p>
        </GridItem>
      </Grid>

      {campaignsQuery.isLoading ? (
        <Loading />
      ) : (
        <BaseTable
          rows={baseRows}
          rowsData={availableCampaignsRowsData}
          menuOptions={availableTableMenuOptions}
          data={data.availableCampaigns}
          handleClickPropName="campaignId"
          t={t}
        />
      )}

      {/* Campaigns you participate in */}
      <Grid classes="campaigns__grid">
        <GridItem md={8} lg={12} classes="campaigns__grid__participate-heading">
          <p className="text">{t("campaigns_participate")}</p>
        </GridItem>
      </Grid>

      {campaignsQuery.isLoading ? (
        <GridItem md={8} lg={12}>
          <Loading />
        </GridItem>
      ) : (
        <BaseTable
          data={data.providerCampaigns}
          rows={providerCampaignRows}
          rowsData={providerCampaignsRowsData}
          menuOptions={providerCampaignsMenuOptions}
          handleClickPropName="campaignId"
          t={t}
        />
      )}

      {/* Past campaigns */}
      <Grid classes="campaigns__grid">
        <GridItem md={8} lg={12} classes="campaigns__grid__participate-heading">
          <p className="text">{t("past_campaigns")}</p>
        </GridItem>
      </Grid>

      {campaignsQuery.isLoading ? (
        <GridItem md={8} lg={12}>
          <Loading />
        </GridItem>
      ) : (
        <BaseTable
          data={data.providerPastCampaigns}
          rows={providerCampaignRows}
          rowsData={providerPastCampaignsRowsData}
          menuOptions={providerCampaignsMenuOptions.slice(1)}
          handleClickPropName="campaignId"
          t={t}
        />
      )}

      {selectedCampaign && (
        <Modal
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          heading={t("terms_and_conditions")}
          ctaLabel={t("agree_with_terms")}
          ctaHandleClick={enrollInCampaign}
          isCtaDisabled={!hasAgreedToPayout}
          isCtaLoading={enrollInCampaignMutation.isLoading}
        >
          <p>{selectedCampaign?.termsAndConditions}</p>
          <CheckBox
            label={t("agreed_to_get_paid", {
              amount: selectedCampaign?.couponSinglePrice,
              currencySymbol,
            })}
            isChecked={hasAgreedToPayout}
            setIsChecked={(checked) => setHasAgreedToPayout(checked)}
          />
        </Modal>
      )}
    </Block>
  );
};
