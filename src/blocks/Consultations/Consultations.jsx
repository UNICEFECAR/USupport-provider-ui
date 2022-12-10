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
import { useGetAllConsultationsByFilter } from "#hooks";

import "./consultations.scss";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { t } = useTranslation("consultations");

  const [searchValue, setSearchValue] = useState("");

  const tabsOptions = [
    { label: t("upcoming_tab_label"), value: "upcoming", isSelected: true },
  ];

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleViewProfile = (clientInformation) => {
    navigate("/clients", { state: { clientInformation } });
  };

  const consultationsQuery = useGetAllConsultationsByFilter("upcoming");

  const renderAllConsultations = useMemo(() => {
    if (!consultationsQuery.data || consultationsQuery.data?.length === 0)
      return (
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <p>{t("no_upcoming_consultations")}</p>
        </GridItem>
      );
    return consultationsQuery.data?.map((consultation, index) => {
      return (
        <GridItem
          key={index}
          md={4}
          lg={6}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <Consultation
            consultation={consultation}
            handleCancelConsultation={handleCancelConsultation}
            handleJoinClick={openJoinConsultation}
            handleViewProfile={handleViewProfile}
            hasMenu={true}
            overview={false}
            renderIn="provider"
            suggested={consultation.status === "suggested"}
            t={t}
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
