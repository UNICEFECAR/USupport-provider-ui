import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { toast } from "react-toastify";
import {
  Block,
  BaseTable,
  CheckBox,
  Grid,
  GridItem,
  Modal,
  Loading,
  TabsUnderlined,
} from "@USupport-components-library/src";
import { getDateView } from "@USupport-components-library/utils";

import {
  useGetCampaigns,
  useEnrollProviderInCampaign,
  useGetProviderData,
} from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./campaigns.scss";

/**
 * Campaigns
 *
 * Campaigns block
 *
 * @return {jsx}
 */
export const Campaigns = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "campaigns" });
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState();
  const [hasAgreedToPayout, setHasAgreedToPayout] = useState(false);

  const campaignsQuery = useGetCampaigns();
  const data = campaignsQuery.data;

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

  const [dataToDisplay, setDataToDisplay] = useState();

  useEffect(() => {
    if (campaignsQuery.data) {
      setDataToDisplay(campaignsQuery.data);
    }
  }, [campaignsQuery.data]);

  const baseRows = useMemo(() => {
    return [
      { label: t("sponsor"), sortingKey: "sponsorName" },
      { label: t("campaign"), sortingKey: "campaignName" },
      {
        label: t("coupon_single_price"),
        sortingKey: "couponSinglePrice",
        isNumbered: true,
        isCentered: true,
      },
      { label: t("period"), sortingKey: "startDate", isDate: true },
    ];
  }, [i18n.language]);

  const providerCampaignRows = useMemo(() => {
    return [
      ...baseRows,
      {
        label: t("consultations_with_you"),
        sortingKey: "conductedConsultationsForCampaign",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("your_payment"),
        sortingKey: "providerPayment",
        isNumbered: true,
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  const [tabs, setTabs] = useState([
    {
      value: "available_campaigns",
      isSelected: true,
      isCentered: true,
    },
    {
      value: "campaigns_participate",
      isSelected: false,
      isCentered: true,
    },
    { value: "past_campaigns", isSelected: false, isCentered: true },
  ]);

  const providerCampaignsRowsData = useMemo(() => {
    return dataToDisplay?.providerCampaigns.map((campaign, index) => {
      return [
        <div className="campaigns__sponsor-container" key={index + "current"}>
          <img
            className="campaigns__sponsor-container__image"
            src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
          />
          <p>{campaign.sponsorName}</p>
        </div>,
        <p className="text">{campaign.campaignName}</p>,
        <p className="text centered">
          {campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
        <p className="text">
          {getDateView(campaign.startDate)} - {getDateView(campaign.endDate)}
        </p>,
        <p className="text centered">
          {campaign.conductedConsultationsForCampaign}
        </p>,
        <p className="text centered">
          {campaign.providerPayment}
          {currencySymbol}
        </p>,
      ];
    });
  }, [dataToDisplay]);

  const providerPastCampaignsRowsData = useMemo(() => {
    return dataToDisplay?.providerPastCampaigns.map((campaign, index) => {
      return [
        <div className="campaigns__sponsor-container" key={index + "past"}>
          <img
            className="campaigns__sponsor-container__image"
            src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
          />
          <p className="text">{campaign.sponsorName}</p>
        </div>,
        <p className="text">{campaign.campaignName}</p>,
        <p className="text centered">
          {campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
        <p className="text">
          {getDateView(campaign.startDate)} - {getDateView(campaign.endDate)}
        </p>,
        <p className="text centered">
          {campaign.conductedConsultationsForCampaign}
        </p>,
        <p className="text centered">
          {campaign.conductedConsultationsForCampaign *
            campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
      ];
    });
  }, [dataToDisplay]);

  const availableCampaignsRowsData = useMemo(() => {
    return dataToDisplay?.availableCampaigns.map((campaign, index) => {
      return [
        <div className="campaigns__sponsor-container" key={index + "available"}>
          <img
            className="campaigns__sponsor-container__image"
            src={AMAZON_S3_BUCKET + "/" + campaign.sponsorImage}
          />
          <p className="text">{campaign.sponsorName}</p>
        </div>,
        <p className="text">{campaign.campaignName}</p>,
        <p className="text centered">
          {campaign.couponSinglePrice}
          {currencySymbol}
        </p>,
        <p className="text">
          {getDateView(campaign.startDate)} - {getDateView(campaign.endDate)}
        </p>,
      ];
    });
  }, [dataToDisplay]);

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

  const handleTabSelect = (index) => {
    const optionsCopy = [...tabs];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setTabs(optionsCopy);
  };

  const checkIfTabIsSelected = (value) => {
    return tabs.find((tab) => tab.isSelected === true && tab.value === value);
  };

  const updateProviderCampaigns = (data) => {
    setDataToDisplay((prev) => {
      return {
        ...prev,
        providerCampaigns: data,
      };
    });
  };
  const updateProviderPastCampaigns = (data) => {
    setDataToDisplay((prev) => {
      return {
        ...prev,
        providerPastCampaigns: data,
      };
    });
  };
  const updateAvailableCampaigns = (data) => {
    setDataToDisplay((prev) => {
      return {
        ...prev,
        availableCampaigns: data,
      };
    });
  };

  return (
    <Block classes="campaigns">
      <Grid classes="campaigns__grid">
        <GridItem md={4} lg={12}>
          <TabsUnderlined options={tabs} handleSelect={handleTabSelect} t={t} />
        </GridItem>
      </Grid>
      {campaignsQuery.isLoading ? (
        <Loading />
      ) : checkIfTabIsSelected("available_campaigns") ? (
        <BaseTable
          rows={baseRows}
          rowsData={availableCampaignsRowsData}
          menuOptions={availableTableMenuOptions}
          data={data.availableCampaigns}
          updateData={updateAvailableCampaigns}
          handleClickPropName="campaignId"
          hasSearch
          t={t}
        />
      ) : checkIfTabIsSelected("campaigns_participate") ? (
        <BaseTable
          data={data.providerCampaigns}
          updateData={updateProviderCampaigns}
          rows={providerCampaignRows}
          rowsData={providerCampaignsRowsData}
          menuOptions={providerCampaignsMenuOptions}
          handleClickPropName="campaignId"
          hasSearch
          t={t}
        />
      ) : (
        <BaseTable
          data={data.providerPastCampaigns}
          updateData={updateProviderPastCampaigns}
          rows={providerCampaignRows}
          rowsData={providerPastCampaignsRowsData}
          menuOptions={providerCampaignsMenuOptions.slice(1)}
          handleClickPropName="campaignId"
          hasSearch
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
