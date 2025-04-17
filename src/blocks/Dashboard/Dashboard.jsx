import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import {
  Block,
  Grid,
  GridItem,
  SingleDay,
  Loading,
  Consultation,
} from "@USupport-components-library/src";

import {
  getStartAndEndOfWeek,
  getDatesInRange,
  getTimestampFromUTC,
  getDateView,
} from "@USupport-components-library/utils";
import { useGetCalendarData, useGetConsultationsForSingleDay } from "#hooks";

import "./dashboard.scss";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Dashboard
 *
 * Provider dashboard block
 *
 * @return {jsx}
 */
export const Dashboard = ({ openJoinConsultation, openCancelConsultation }) => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const today = new Date();

  const weekDays = [];
  let startDay = today;
  let firstMonday, lastFriday;
  for (let i = 0; i < 5; i++) {
    const { first, last } = getStartAndEndOfWeek(new Date(startDay));
    if (!firstMonday) {
      firstMonday = first;
    }
    if (i === 4) {
      lastFriday = last;
    }
    startDay = new Date(new Date(first).setDate(new Date(first).getDate() + 7));
    weekDays.push(...getDatesInRange(first, last));
  }

  const [selectedDay, setSelectedDay] = useState(today);

  const { data, isLoading } = useGetCalendarData(
    getTimestampFromUTC(firstMonday)
  );

  const { data: consultationsData, isLoading: isConsultationLoading } =
    useGetConsultationsForSingleDay(getTimestampFromUTC(selectedDay));

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const checkStateOfDate = (date) => {
    if (!data) return {};
    const currentDate = date.toLocaleDateString();

    const dayConsultations = data.get("consultations").has(currentDate)
      ? data.get("consultations").get(currentDate)
      : 0;

    const isAvailable =
      data.get("slots").has(currentDate) || dayConsultations > 0;

    return { isAvailable, dayConsultations };
  };

  const dayText =
    today.toLocaleDateString() === selectedDay.toLocaleDateString()
      ? `${t("today")}, ${getDateView(selectedDay)}`
      : getDateView(selectedDay);

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const handleCancelConsultation = (consultation) => {
    openCancelConsultation(consultation);
  };

  const handleViewProfile = (consultation, isPast) => {
    navigate("/clients", {
      state: {
        clientInformation: {
          clientDetailId: consultation.clientDetailId,
          image: consultation.image,
          name: consultation.name,
        },
        consultationInformation: isPast ? consultation : null,
      },
    });
  };

  const renderConsultations = useCallback(() => {
    const { isAvailable } = checkStateOfDate(selectedDay);
    if (!consultationsData || consultationsData.length === 0)
      return (
        <GridItem
          md={8}
          lg={12}
          classes="dashboard__grid__consultations-grid__item"
        >
          {<p>{isAvailable ? t("no_consultations") : t("no_availability")}</p>}
        </GridItem>
      );
    return consultationsData.map((consultation, index) => {
      return (
        <GridItem
          md={8}
          lg={12}
          classes="dashboard__grid__consultations-grid__item"
          key={index + "- consultation"}
        >
          <Consultation
            consultation={consultation}
            renderIn="provider"
            suggested={consultation.status === "suggested"}
            daysOfWeekTranslations={daysOfWeekTranslations}
            overview={false}
            hasMenu
            handleJoinClick={openJoinConsultation}
            handleCancelConsultation={handleCancelConsultation}
            handleViewProfile={handleViewProfile}
            couponPrice={consultation.couponPrice}
            sponsorImage={consultation.sponsorImage}
            withOrganization={!!consultation.organizationId}
            t={t}
          />
        </GridItem>
      );
    });
  }, [consultationsData, selectedDay]);

  return (
    <Block classes="dashboard">
      <Grid classes="dashboard__grid">
        <GridItem md={8} classes="dashboard__grid__calendar-item">
          <Grid classes="dashboard__grid__calendar-item__weekdays-grid">
            <GridItem xs={3} classes="dashboard__grid__next-weeks">
              <h4>{`${getDateView(firstMonday)} - ${getDateView(
                lastFriday
              )}`}</h4>
            </GridItem>
            <GridItem xs={4} classes="dashboard__grid__calendar-text">
              {isLoading ? (
                <Loading size="sm" padding="0" />
              ) : (
                <p
                  className="small-text "
                  onClick={() => navigate("/calendar")}
                >
                  {t("calendar")}
                </p>
              )}
            </GridItem>
            {days.map((day) => {
              return (
                <GridItem
                  key={day + "- day"}
                  xs={1}
                  classes="dashboard__grid__calendar-item__weekdays-grid__days"
                >
                  <p key={"weekday - " + day}>{t(day)}</p>
                </GridItem>
              );
            })}
          </Grid>

          <Grid
            md={8}
            lg={4}
            classes="dashboard__grid__calendar-item__days-grid"
          >
            {weekDays.map((day) => {
              const { isAvailable, dayConsultations } = checkStateOfDate(day);
              return (
                <SingleDay
                  key={day.toLocaleDateString()}
                  date={day}
                  handleClick={() => handleDaySelect(day)}
                  numberOfConsultations={dayConsultations}
                  isAvailable={isAvailable}
                  t={t}
                  unavailableLabel={t("not_available")}
                  consultationsLabel={
                    dayConsultations === 1
                      ? t("consultation")
                      : t("consultations")
                  }
                />
              );
            })}
          </Grid>
        </GridItem>
        <GridItem md={8} lg={4} classes="dashboard__grid__day-item">
          <div className="dashboard__grid__day-item__heading">
            <h4>{dayText}</h4>
          </div>
          <Grid classes="dashboard__consultations-grid">
            {isConsultationLoading ? (
              <GridItem
                md={8}
                lg={12}
                classes="dashboard__grid__consultations-grid__item"
              >
                <Loading size="lg" />
              </GridItem>
            ) : (
              renderConsultations()
            )}
          </Grid>
        </GridItem>
      </Grid>
    </Block>
  );
};
