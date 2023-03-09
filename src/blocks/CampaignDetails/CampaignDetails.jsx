import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Block,
  Grid,
  GridItem,
  Consultation,
  Loading,
} from "@USupport-components-library/src";

import { useGetConsultationsForCampaign } from "#hooks";

import "./campaign-details.scss";

/**
 * CampaignDetails
 *
 * Campaign details block
 *
 * @return {jsx}
 */
export const CampaignDetails = ({
  campaignId,
  couponPrice,
  openJoinConsultation,
  openCancelConsultation,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("campaign-details");
  const consultationsQuery = useGetConsultationsForCampaign(campaignId);

  const handleViewProfile = (clientInformation) => {
    navigate("/clients", { state: { clientInformation } });
  };

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const renderConsultations = (filter) => {
    if (consultationsQuery.isLoading) {
      return (
        <GridItem md={8} lg={12}>
          <Loading />
        </GridItem>
      );
    }

    if (
      filter === "upcoming" &&
      consultationsQuery.data?.upcomingConsultations.length === 0
    ) {
      return (
        <GridItem md={8} lg={12}>
          <p>{t("no_upcoming_consultations")}</p>
        </GridItem>
      );
    }
    if (
      filter === "completed" &&
      consultationsQuery.data?.pastConsultations.length === 0
    ) {
      return (
        <GridItem md={8} lg={12}>
          <p>{t("no_completed_consultations")}</p>
        </GridItem>
      );
    }

    const consultations =
      filter === "upcoming"
        ? consultationsQuery.data?.upcomingConsultations
        : consultationsQuery.data?.pastConsultations;

    return consultations.map((consultation, index) => {
      return (
        <GridItem
          key={index}
          md={4}
          lg={6}
          classes="campaign-details__grid__consultation"
        >
          <Consultation
            consultation={consultation}
            handleCancelConsultation={handleCancelConsultation}
            handleJoinClick={openJoinConsultation}
            handleViewProfile={handleViewProfile}
            couponPrice={couponPrice}
            hasMenu={true}
            overview={false}
            renderIn="provider"
            suggested={consultation.status === "suggested"}
            t={t}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="campaign-details">
      <Grid classes="campaign-details__grid">
        <GridItem md={8} lg={12}>
          <Grid classes="campaign-details__inner-grid">
            <GridItem
              classes="campaign-details__inner-grid__heading"
              md={8}
              lg={12}
            >
              <h4>{t("upcoming")}</h4>
            </GridItem>
            {renderConsultations("upcoming")}

            <GridItem
              classes="campaign-details__inner-grid__heading"
              md={8}
              lg={12}
            >
              <h4>{t("completed")}</h4>
            </GridItem>
            {renderConsultations("past")}
          </Grid>
        </GridItem>
      </Grid>
    </Block>
  );
};
