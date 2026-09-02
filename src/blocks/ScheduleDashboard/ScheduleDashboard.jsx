import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Block, Consultation, Icon, Loading } from "@USupport-components-library/src";
import {
  getStartAndEndOfWeek,
  getTimestampFromUTC,
} from "@USupport-components-library/utils";

import {
  useGetCalendarData,
  useGetConsultationsForSingleDay,
  useGetAllUpcomingConsultations,
} from "#hooks";
import { useDeviceTest } from "#backdrops";
import { Scheduler } from "../Scheduler";

import "./schedule-dashboard.scss";

const ONE_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * ScheduleDashboard
 *
 * Combined schedule overview: stats, calendar, and upcoming consultations.
 *
 * @return {jsx}
 */
export const ScheduleDashboard = ({
  openJoinConsultation,
  openCancelConsultation,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "schedule-dashboard" });
  const { t: tDashboard } = useTranslation("blocks", { keyPrefix: "dashboard" });
  const navigate = useNavigate();
  const { openDeviceTest } = useDeviceTest();
  const today = useMemo(() => startOfDay(new Date()), []);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const { first: calendarFetchStart } = getStartAndEndOfWeek(monthStart);

  const { data: calendarData, isLoading: isCalendarLoading } =
    useGetCalendarData(getTimestampFromUTC(calendarFetchStart));

  const { data: todayConsultations, isLoading: isTodayLoading } =
    useGetConsultationsForSingleDay(getTimestampFromUTC(today));

  const [upcomingQuery] = useGetAllUpcomingConsultations();

  const availableDaysThisMonth = useMemo(() => {
    if (!calendarData) return 0;
    const slots = calendarData.get("slots");
    const consultations = calendarData.get("consultations");
    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    let count = 0;
    for (let d = 1; d <= lastDay; d += 1) {
      const key = new Date(
        today.getFullYear(),
        today.getMonth(),
        d,
      ).toLocaleDateString();
      if (slots.has(key) || consultations.has(key)) {
        count += 1;
      }
    }
    return count;
  }, [calendarData, today]);

  const upcomingNextSevenDays = useMemo(() => {
    if (!calendarData) return 0;
    const consultations = calendarData.get("consultations");
    let count = 0;
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(today.getTime() + i * ONE_DAY);
      const key = day.toLocaleDateString();
      count += consultations.get(key) || 0;
    }
    return count;
  }, [calendarData, today]);

  const upcomingConsultations = useMemo(() => {
    const todayItems = (todayConsultations || []).filter(
      (item) => item.timestamp >= Date.now(),
    );
    const laterItems = upcomingQuery.data?.pages?.flat() || [];
    const seen = new Set();
    return [...todayItems, ...laterItems]
      .filter((item) => {
        if (!item?.consultationId || seen.has(item.consultationId)) {
          return false;
        }
        seen.add(item.consultationId);
        return item.timestamp >= Date.now();
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [todayConsultations, upcomingQuery.data]);

  const daysOfWeekTranslations = {
    monday: tDashboard("monday"),
    tuesday: tDashboard("tuesday"),
    wednesday: tDashboard("wednesday"),
    thursday: tDashboard("thursday"),
    friday: tDashboard("friday"),
    saturday: tDashboard("saturday"),
    sunday: tDashboard("sunday"),
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

  const sidebarLoading =
    isTodayLoading || upcomingQuery.isLoading || upcomingQuery.isFetching;

  return (
    <Block classes="schedule-dashboard">
      <div className="schedule-dashboard__layout">
        <div className="schedule-dashboard__main">
          <div className="schedule-dashboard__stats">
            <article className="schedule-dashboard__stat">
              <span className="schedule-dashboard__stat-icon">
                <Icon name="calendar" color="#6a4ffb" size="md" />
              </span>
              <div className="schedule-dashboard__stat-copy">
                <p className="schedule-dashboard__stat-label">
                  {t("available_days")}
                </p>
                <p className="schedule-dashboard__stat-value">
                  {isCalendarLoading ? "–" : availableDaysThisMonth}{" "}
                  <span>{t("this_month")}</span>
                </p>
              </div>
            </article>
            <article className="schedule-dashboard__stat">
              <span className="schedule-dashboard__stat-icon">
                <Icon name="three-people" color="#6a4ffb" size="md" />
              </span>
              <div className="schedule-dashboard__stat-copy">
                <p className="schedule-dashboard__stat-label">
                  {t("upcoming_consultations")}
                </p>
                <p className="schedule-dashboard__stat-value">
                  {isCalendarLoading ? "–" : upcomingNextSevenDays}{" "}
                  <span>{t("next_7_days")}</span>
                </p>
              </div>
            </article>
          </div>

          <div className="schedule-dashboard__calendar">
            <Scheduler
              variant="overview"
              defaultPeriod="month"
              openJoinConsultation={openJoinConsultation}
              openCancelConsultation={openCancelConsultation}
            />
          </div>
        </div>

        <aside className="schedule-dashboard__sidebar">
            <h3 className="schedule-dashboard__sidebar-title">
              {t("upcoming_consultations")}
            </h3>
            <button
              type="button"
              className="schedule-dashboard__test-devices"
              onClick={openDeviceTest}
            >
              <span className="schedule-dashboard__test-devices-left">
                <Icon name="microphone" size="sm" color="#9749FA" />
                <span className="schedule-dashboard__test-devices-copy">
                  <span className="schedule-dashboard__test-devices-title">
                    {tDashboard("test_audio_camera")}
                  </span>
                  <span className="schedule-dashboard__test-devices-description">
                    {tDashboard("test_audio_camera_description")}
                  </span>
                </span>
              </span>
              <Icon name="arrow-chevron-forward" size="sm" color="#66768D" />
            </button>
            <div className="schedule-dashboard__sidebar-list">
              {sidebarLoading && upcomingConsultations.length === 0 ? (
                <Loading size="md" />
              ) : upcomingConsultations.length === 0 ? (
                <p className="schedule-dashboard__empty">
                  {t("no_upcoming_consultations")}
                </p>
              ) : (
                upcomingConsultations.map((consultation) => (
                  <Consultation
                    key={consultation.consultationId}
                    consultation={consultation}
                    renderIn="provider"
                    suggested={consultation.status === "suggested"}
                    daysOfWeekTranslations={daysOfWeekTranslations}
                    overview={false}
                    hasMenu
                    handleJoinClick={openJoinConsultation}
                    handleCancelConsultation={openCancelConsultation}
                    handleViewProfile={handleViewProfile}
                    couponPrice={consultation.couponPrice}
                    sponsorImage={consultation.sponsorImage}
                    withOrganization={!!consultation.organizationId}
                    t={tDashboard}
                  />
                ))
              )}
            </div>
        </aside>
      </div>
    </Block>
  );
};
