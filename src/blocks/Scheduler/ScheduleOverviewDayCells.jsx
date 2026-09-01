import React from "react";

import { isDateToday } from "@USupport-components-library/src/utils/date";

import {
  WEEKDAY_ORDER_KEYS,
  consultationCountOnDay,
  getDayAvailabilityState,
  getDayStatusLabels,
  isSameCalendarDay,
} from "./scheduleOverviewCalendarShared.js";

export const ScheduleOverviewWeekdayStrip = ({ t, className = "" }) => (
  <div
    className={[
      "schedule-overview-month__weekdays",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {WEEKDAY_ORDER_KEYS.map((key) => (
      <span
        key={key}
        className="schedule-overview-month__weekday"
        title={t(key)}
      >
        <span className="schedule-overview-month__weekday-full">{t(key)}</span>
        <span
          className="schedule-overview-month__weekday-letter"
          aria-hidden="true"
        >
          {t(key).charAt(0)}
        </span>
      </span>
    ))}
  </div>
);

export const ScheduleOverviewDayCell = ({
  date,
  dayNumber,
  selected = false,
  disabled = false,
  outside = false,
  interactive = true,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  showUnavailableStatus,
  onClick,
  t,
}) => {
  const { count, hasAppt, isAvailable } = getDayAvailabilityState({
    consultationsRaw,
    hours,
    getSlotDataForHour,
    date,
  });
  const { statusLabel, statusShort } = getDayStatusLabels({
    hasAppt,
    isAvailable,
    count,
    t,
    showUnavailableStatus,
  });
  const isToday = isDateToday(date);
  const showUnavailableStyle =
    showUnavailableStatus && !isAvailable && !outside && !hasAppt;

  const className = [
    "schedule-overview-month__day",
    outside ? "schedule-overview-month__day--outside" : "",
    selected && !disabled ? "schedule-overview-month__day--selected" : "",
    hasAppt ? "schedule-overview-month__day--has-appt" : "",
    showUnavailableStyle ? "schedule-overview-month__day--unavailable" : "",
    disabled ? "schedule-overview-month__day--disabled" : "",
    isToday ? "schedule-overview-month__day--today" : "",
    !interactive ? "schedule-overview-month__day--display-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="schedule-overview-month__day-num">
        {dayNumber ?? date.getDate()}
      </span>
      {(statusLabel || statusShort) && (
        <span className="schedule-overview-month__day-status">
          {statusLabel ? (
            <span className="schedule-overview-month__day-status-full">
              {statusLabel}
            </span>
          ) : null}
          {statusShort ? (
            <span className="schedule-overview-month__day-status-short">
              {statusShort}
            </span>
          ) : null}
        </span>
      )}
    </>
  );

  if (!interactive) {
    return (
      <div className={className} aria-hidden={outside || undefined}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export function isPastDateWithoutAppointment(date, consultationsRaw) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const hasAppt = consultationCountOnDay(consultationsRaw, date) > 0;
  return date < startOfToday && !hasAppt;
}

export { isSameCalendarDay, getDayAvailabilityState };
