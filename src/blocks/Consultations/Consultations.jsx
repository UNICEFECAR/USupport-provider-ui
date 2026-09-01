import React, { useState, useMemo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useCustomNavigate as useNavigate } from "#hooks";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Tabs,
  Consultation,
  InputSearch,
  Loading,
} from "@USupport-components-library/src";
import { getTimestampFromUTC } from "@USupport-components-library/utils";

import {
  useGetConsultationsForSingleDay,
  useGetAllUpcomingConsultations,
} from "#hooks";

import "./consultations.scss";

/**
 * Consultations
 *
 * Consultations block
 *
 * @return {jsx}
 */
export const Consultations = ({
  subheading,
  openJoinConsultation,
  openCancelConsultation,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("blocks", { keyPrefix: "consultations" });

  const [tabs, setTabs] = useState([
    { value: "today", isSelected: true },
    { value: "upcoming", isSelected: false },
  ]);
  const [searchValue, setSearchValue] = useState("");

  const filter = tabs.find((tab) => tab.isSelected)?.value ?? "today";
  const searchNeedle = searchValue?.toLowerCase() ?? "";

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleViewProfile = (clientInformation) => {
    navigate("/clients", { state: { clientInformation } });
  };

  const handleTabClick = (index) => {
    const tabsCopy = [...tabs];

    for (let i = 0; i < tabsCopy.length; i++) {
      tabsCopy[i].isSelected = i === index;
    }

    setTabs(tabsCopy);
  };

  const consultationsQuery = useGetConsultationsForSingleDay(
    getTimestampFromUTC(new Date()),
  );

  const [upcomingConsultationsQuery, currentPage, totalCount] =
    useGetAllUpcomingConsultations();

  const renderConsultationCard = (consultation, index) => (
    <GridItem key={consultation.consultationId ?? index} md={8} lg={6}>
      <Consultation
        consultation={consultation}
        handleCancelConsultation={handleCancelConsultation}
        handleJoinClick={openJoinConsultation}
        handleViewProfile={handleViewProfile}
        hasMenu={true}
        overview={false}
        renderIn="provider"
        suggested={consultation.status === "suggested"}
        couponPrice={consultation.couponPrice}
        sponsorImage={consultation.sponsorImage}
        withOrganization={!!consultation.organizationId}
        liquidGlass
        t={t}
        classes="consultations__card"
      />
    </GridItem>
  );

  const filterConsultations = useCallback(
    (consultations) => {
      if (!searchNeedle) return consultations;

      return consultations.filter((consultation) =>
        consultation.clientName?.toLowerCase().includes(searchNeedle),
      );
    },
    [searchNeedle],
  );

  const renderUpcomingConsultations = useCallback(() => {
    if (
      !upcomingConsultationsQuery.data?.pages ||
      upcomingConsultationsQuery.data.pages.flat().length === 0
    ) {
      return (
        <GridItem md={8} lg={12} classes="consultations__no-data-item">
          <p className="text consultations__no-data">
            {t(`no_upcoming_consultations_${filter}`)}
          </p>
        </GridItem>
      );
    }

    const sortedConsultations = upcomingConsultationsQuery.data.pages
      .flat()
      .sort((a, b) => a.timestamp - b.timestamp);

    const consultations = filterConsultations(sortedConsultations);

    if (searchNeedle && consultations.length === 0) {
      return (
        <GridItem md={8} lg={12} classes="consultations__no-data-item">
          <p className="text consultations__no-data">
            {t("no_upcoming_consultations_search")}
          </p>
        </GridItem>
      );
    }

    return consultations.map((consultation, index) =>
      renderConsultationCard(consultation, index),
    );
  }, [
    t,
    upcomingConsultationsQuery.data,
    searchNeedle,
    filter,
    filterConsultations,
    openJoinConsultation,
  ]);

  const renderTodayConsultations = useMemo(() => {
    if (consultationsQuery.isLoading) {
      return (
        <GridItem md={8} lg={12} classes="consultations__no-data-item">
          <Loading />
        </GridItem>
      );
    }

    if (!consultationsQuery.data || consultationsQuery.data.length === 0) {
      return (
        <GridItem md={8} lg={12} classes="consultations__no-data-item">
          <p className="text consultations__no-data">
            {t(`no_upcoming_consultations_${filter}`)}
          </p>
        </GridItem>
      );
    }

    const sortedConsultations = [...consultationsQuery.data].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const consultations = filterConsultations(sortedConsultations);

    if (searchNeedle && consultations.length === 0) {
      return (
        <GridItem md={8} lg={12} classes="consultations__no-data-item">
          <p className="text consultations__no-data">
            {t("no_upcoming_consultations_search")}
          </p>
        </GridItem>
      );
    }

    return consultations.map((consultation, index) =>
      renderConsultationCard(consultation, index),
    );
  }, [
    consultationsQuery.data,
    consultationsQuery.isLoading,
    searchNeedle,
    filter,
    filterConsultations,
    t,
  ]);

  let hasMore;
  const hasLessThanSixConsultations =
    totalCount === undefined ? false : totalCount <= 6;

  if (currentPage === 1) {
    hasMore = !hasLessThanSixConsultations;
  } else {
    const totalPages = Math.ceil(totalCount / 6);
    hasMore = totalPages > currentPage;
  }

  const renderConsultationsGrid = () => {
    if (filter === "upcoming") {
      return (
        <InfiniteScroll
          dataLength={upcomingConsultationsQuery.data?.pages?.length || 0}
          hasMore={hasMore}
          next={() => upcomingConsultationsQuery.fetchNextPage()}
          loader={
            <GridItem md={8} lg={12} classes="consultations__no-data-item">
              <Loading />
            </GridItem>
          }
          initialScrollY={200}
          scrollThreshold={0}
        >
          <Grid classes="consultations__grid">
            {renderUpcomingConsultations()}
          </Grid>
        </InfiniteScroll>
      );
    }

    return (
      <Grid classes="consultations__grid">{renderTodayConsultations}</Grid>
    );
  };

  return (
    <Block classes="consultations consultations--v1">
      <div className="consultations__surface">
        {subheading ? (
          <header className="consultations__header">
            <p className="consultations__header-intro">{subheading}</p>
          </header>
        ) : null}
        <div className="consultations__tabs">
          <Tabs
            options={tabs.map((tab) => ({
              label: t(`${tab.value}_tab_label`),
              value: tab.value,
              isSelected: tab.isSelected,
            }))}
            handleSelect={handleTabClick}
          />
        </div>
        <div className="consultations__filters">
          <InputSearch
            placeholder={t("input_search_label")}
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            classes="consultations__filters__search"
          />
        </div>
        <div className="consultations__list">
          {renderConsultationsGrid()}
        </div>
      </div>
    </Block>
  );
};
