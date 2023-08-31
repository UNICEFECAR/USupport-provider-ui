import React, { useState, useMemo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  TabsUnderlined,
  Consultation,
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
  openJoinConsultation,
  openCancelConsultation,
  searchValue,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("consultations");

  const [filter, setFilter] = useState("today");

  const [tabsOptions, setTabsOptions] = useState([
    { label: t("today_tab_label"), value: "today", isSelected: true },
    { label: t("upcoming_tab_label"), value: "upcoming", isSelected: false },
  ]);

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleViewProfile = (clientInformation) => {
    navigate("/clients", { state: { clientInformation } });
  };

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

  const consultationsQuery = useGetConsultationsForSingleDay(
    getTimestampFromUTC(new Date())
  );

  const [upcomingConsultationsQuery, currentPage, totalCount] =
    useGetAllUpcomingConsultations();

  const renderUpcomingConsultations = useCallback(() => {
    if (
      !upcomingConsultationsQuery.data?.pages ||
      upcomingConsultationsQuery.data.pages.flat().length === 0
    ) {
      return (
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <p>{t(`no_upcoming_consultations_${filter}`)}</p>
        </GridItem>
      );
    }
    let consultations = upcomingConsultationsQuery.data.pages.flat();

    const sortedConsultations = consultations.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    if (searchValue) {
      consultations = sortedConsultations.filter((consultation) =>
        consultation.clientName.toLowerCase().includes(searchValue)
      );
    }
    if (searchValue && consultations.length === 0)
      return (
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <p>{t("no_upcoming_consultations_search")}</p>
        </GridItem>
      );

    return consultations.map((consultation, index) => {
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
            couponPrice={consultation.couponPrice}
            sponsorImage={consultation.sponsorImage}
            t={t}
          />
        </GridItem>
      );
    });
  }, [
    t,
    upcomingConsultationsQuery.data,
    searchValue,
    filter,
    openJoinConsultation,
    handleCancelConsultation,
    handleViewProfile,
  ]);

  const renderAllConsultations = useMemo(() => {
    if (!consultationsQuery.data || consultationsQuery.data?.length === 0)
      return (
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <p>{t(`no_upcoming_consultations_${filter}`)}</p>
        </GridItem>
      );

    const sortedConsultations = consultationsQuery.data.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    let consultations = sortedConsultations;
    if (searchValue) {
      consultations = sortedConsultations.filter((consultation) =>
        consultation.clientName.toLowerCase().includes(searchValue)
      );
    }

    if (searchValue && consultations.length === 0)
      return (
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item__grid__consultation"
        >
          <p>{t("no_upcoming_consultations_search")}</p>
        </GridItem>
      );

    return consultations.map((consultation, index) => {
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
            couponPrice={consultation.couponPrice}
            sponsorImage={consultation.sponsorImage}
            t={t}
          />
        </GridItem>
      );
    });
  }, [consultationsQuery.data, searchValue, filter, t]);

  let hasMore;
  const hasLessThanSixConsultations =
    totalCount === undefined ? false : totalCount <= 6;

  if (currentPage === 1) {
    hasMore = !hasLessThanSixConsultations;
  } else {
    const totalPages = Math.ceil(totalCount / 6);
    hasMore = totalPages > currentPage;
  }

  return (
    <Block classes="consultations">
      <Grid classes="consultations__grid">
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__heading-item"
        ></GridItem>
        <GridItem md={8} lg={12} classes="consultations__grid__tabs-item">
          <TabsUnderlined
            options={tabsOptions}
            handleSelect={handleTabClick}
            t={t}
          />
        </GridItem>
        <GridItem
          md={8}
          lg={12}
          classes="consultations__grid__consultations-item"
        >
          {filter === "upcoming" ? (
            <InfiniteScroll
              dataLength={upcomingConsultationsQuery.data?.pages?.length || 0}
              hasMore={hasMore}
              next={() => upcomingConsultationsQuery.fetchNextPage()}
              loader={<Loading />}
              initialScrollY={200}
              scrollThreshold={0}
              style={{ paddingBottom: "18px" }}
            >
              <Grid classes="consultations__grid__consultations-item__grid">
                {renderUpcomingConsultations()}
              </Grid>
            </InfiniteScroll>
          ) : (
            <Grid classes="consultations__grid__consultations-item__grid">
              {renderAllConsultations}
            </Grid>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
