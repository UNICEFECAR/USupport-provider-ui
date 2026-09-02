import React from "react";

import { calendarMonthGrid } from "./schedulerUtils.js";
import {
  SchedulerMonthAppointmentsBox,
  SchedulerMonthAvailabilityBox,
} from "./SchedulerMonthDayPanel.jsx";

const WEEKDAY_ORDER_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Month summary: calendar + appointments row, availability full width below.
 */
export const SchedulerMonthView = ({
  monthViewDate,
  monthSelectedDay,
  onSelectDay,
  consultationsRaw,
  listTitle,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  handleViewProfile,
  handleCancelConsultation,
  handleJoinConsultation,
  validCampaigns,
  organizations,
  countryHasNormalSlots,
  language,
  t,
}) => {
  const cells = calendarMonthGrid(monthViewDate);

  const hasConsultationOnDay = (date) =>
    consultationsRaw.some((c) => {
      const d = new Date(c.time);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

  const hasOpenSlotOnDay = (date) =>
    hours.some((hour) => {
      const rows = getSlotDataForHour(hour, date);
      return rows.some(
        (row) =>
          !row.consultation &&
          row.availabilityStatus !== "unavailable" &&
          !row.isPastDay
      );
    });

  const today = new Date();
  const isTodayDate = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const sharedPanelProps = {
    selectedDay: monthSelectedDay,
    consultationsRaw,
    hours,
    getSlotDataForHour,
    handleSetAvailable,
    handleSetUnavailable,
    handleCancelConsultation,
    handleViewProfile,
    handleJoinConsultation,
    validCampaigns,
    organizations,
    countryHasNormalSlots,
    t,
  };

  return (
    <div className="scheduler-month">
      <div className="scheduler-month__calendar">
        <div className="scheduler-month__weekdays">
          {WEEKDAY_ORDER_KEYS.map((key) => (
            <span key={key} className="scheduler-month__weekday">
              {t(key)}
            </span>
          ))}
        </div>
        <div className="scheduler-month__grid">
          {cells.map((cell) => {
            if (cell.type === "pad") {
              return <div key={cell.key} className="scheduler-month__pad" />;
            }

            const { date } = cell;
            const selected =
              date.getFullYear() === monthSelectedDay.getFullYear() &&
              date.getMonth() === monthSelectedDay.getMonth() &&
              date.getDate() === monthSelectedDay.getDate();
            const hasAppt = hasConsultationOnDay(date);
            const hasSlots = hasOpenSlotOnDay(date);
            const todayCell = isTodayDate(date);

            return (
              <button
                key={cell.key}
                type="button"
                className={[
                  "scheduler-month__day",
                  selected ? "scheduler-month__day--selected" : "",
                  hasAppt ? "scheduler-month__day--has-appt" : "",
                  hasSlots && !hasAppt ? "scheduler-month__day--has-slots" : "",
                  todayCell ? "scheduler-month__day--today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectDay(date)}
              >
                <span className="scheduler-month__day-num">{cell.dayNumber}</span>
                {(hasAppt || hasSlots) && (
                  <span className="scheduler-month__day-dots" aria-hidden="true">
                    {hasAppt && (
                      <span className="scheduler-month__day-dot scheduler-month__day-dot--appt" />
                    )}
                    {hasSlots && (
                      <span className="scheduler-month__day-dot scheduler-month__day-dot--slot" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <SchedulerMonthAppointmentsBox
        {...sharedPanelProps}
        listTitle={listTitle}
        language={language}
      />

      <SchedulerMonthAvailabilityBox {...sharedPanelProps} />
    </div>
  );
};
