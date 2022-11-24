import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Block,
  Grid,
  GridItem,
  TabsUnderlined,
  Consultation,
  InputSearch,
} from "@USupport-components-library/src";

import "./consultations.scss";

/**
 * Consultations
 *
 * Consultations block
 *
 * @return {jsx}
 */
export const Consultations = ({
  openJoinConsultation,
  openCancelConsultation,
}) => {
  const { t } = useTranslation("consultations");

  const [searchValue, setSearchValue] = useState("");

  const tabsOptions = [
    { label: t("upcoming_tab_label"), value: "upcoming", isSelected: true },
  ];

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const handleCancelConsultation = (providerId, consultationId) => {
    openCancelConsultation();
  };

  const fetchConsultations = async () => {};

  const consultationsQuery = useQuery(["consultations"], fetchConsultations, {
    enabled: false, // TODO: Enable this when the API is ready and remove the placeholder data
    placeholderData: [
      {
        id: 1,
        clientName: "Dr. Joanna doe 1",
        timestamp: 1669308022892,
        overview: false,
      },
      {
        id: 5,
        clientName: "Dr. Joanna doe 5",
        timestamp: 1669832519000,
        overview: false,
      },
    ],
  });

  const renderAllConsultations = useMemo(() => {
    return consultationsQuery.data?.map((consultation, index) => {
      return (
        <GridItem
          key={index}
          md={4}
          lg={6}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <Consultation
            name={consultation.clientName}
            timestamp={consultation.timestamp}
            overview={consultation.overview}
            renderIn="provider"
            hasMenu={true}
            daysOfWeekTranslations={daysOfWeekTranslations}
            handleJoinClick={openJoinConsultation}
            handleCancelConsultation={handleCancelConsultation}
          />
        </GridItem>
      );
    });
  }, [consultationsQuery.data]);

  return (
    <Block classes="consultations">
      <Grid classes="consultations__grid">
        <GridItem md={8} lg={12} classes="consultations__grid__heading-item">
          <div className="consultations__heading-container">
            <InputSearch
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
              placeholder={t("input_search_label")}
              classes="consultations__heading-container__search"
            />
            <h4 className="consultations__heading-container__heading-text">
              {t("heading")}
            </h4>
          </div>
        </GridItem>
        <GridItem md={8} lg={12} classes="consultations__grid__tabs-item">
          <TabsUnderlined options={tabsOptions} handleSelect={() => {}} />
        </GridItem>
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item"
        >
          <Grid classe="consultations__grid__consultations-item__grid">
            {renderAllConsultations}
          </Grid>
        </GridItem>
      </Grid>
    </Block>
  );
};
