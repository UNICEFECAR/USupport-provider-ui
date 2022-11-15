import React, { useState, useCallback, useMemo } from "react";
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
export const Consultations = ({}) => {
  let today = new Date();

  const { t } = useTranslation("consultations");

  const [searchValue, setSearchValue] = useState("");

  const [tabsOptions, setTabsOptions] = useState([
    { label: t("upcoming_tab_label"), value: "upcoming", isSelected: true },
    { label: t("past_tab_label"), value: "past", isSelected: false },
  ]);

  const [filter, setFilter] = useState("upcoming");

  const fetchConsultations = async () => {};

  const consultationsQuery = useQuery(["consultations"], fetchConsultations, {
    enabled: false, // TODO: Enable this when the API is ready and remove the placeholder data
    placeholderData: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => {
      return {
        id: x,
        specialistName: "Dr. Joanna Doe " + x.toString(),
        startDate:
          x < 4
            ? new Date("2022-11-1 15:00")
            : x === 4
            ? new Date(today.setHours(today.getHours() - 1))
            : new Date(today.setDate(today.getDate() + 3)),
        endDate:
          x < 4
            ? new Date("2022-11-1 16:00")
            : x === 4
            ? new Date(today.setHours(today.getHours() + 4))
            : new Date(today.setDate(today.getDate() + 3)),
        overview: false,
      };
    }),
  });

  const handleTabClick = (index) => {
    const optionsCopy = [...tabsOptions];

    for (let i = 0; i < optionsCopy.length; i++) {
      if (i === index) {
        optionsCopy[i].isSelected = true;
      } else {
        optionsCopy[i].isSelected = false;
      }
    }

    setTabsOptions(optionsCopy);
    setFilter(optionsCopy[index].value);
  };

  const filterConsultations = useCallback(() => {
    const currentDate = new Date();

    return consultationsQuery.data?.filter((consultation) => {
      if (filter === "upcoming") {
        return (
          consultation.startDate >= currentDate ||
          (currentDate >= consultation.startDate &&
            currentDate <= consultation.endDate)
        );
      } else {
        return consultation.endDate < currentDate;
      }
    });
  }, [consultationsQuery.data, filter]);

  const renderAllConsultations = useMemo(() => {
    const filteredConsultations = filterConsultations();

    return filteredConsultations.map((consultation, index) => {
      return (
        <GridItem
          key={index}
          md={4}
          lg={6}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <Consultation
            name={consultation.specialistName}
            startDate={consultation.startDate}
            endDate={consultation.endDate}
            overview={consultation.overview}
            renderIn="provider"
            hasMenu={true}
          />
        </GridItem>
      );
    });
  }, [consultationsQuery.data, filter]);

  return (
    <Block classes="consultations">
      <Grid classes="consultations__grid">
        <GridItem md={8} lg={12}>
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
          <TabsUnderlined options={tabsOptions} handleSelect={handleTabClick} />
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
