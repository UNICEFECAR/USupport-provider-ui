import React from "react";

import { isDateToday } from "@USupport-components-library/src/utils/date";

import { getDayAvailabilityState } from "./scheduleOverviewCalendarShared.js";

import "./schedule-date-card.scss";

const WEEKDAY_KEYS_BY_GETDAY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * ScheduleDateCard
 *
 * The single date-card building block shared by the Scheduler's day, week
 * and month overview grids: weekday + date + consultation count, with
 * today / has-consultations / has-open-slots / no-slots / selected styling.
 * It owns its full box model (sizing, padding, line-heights) so it renders
 * identically no matter which grid places it — nothing here reaches up
 * into an ancestor's CSS, and nothing outside should reach into this one.
 *
 * @return {jsx}
 */
export const ScheduleDateCard = ({
  date,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  selected = false,
  disabled = false,
  outside = false,
  interactive = true,
  language,
  onClick,
  t,
}) => {
  const { count, hasAppt, isAvailable } = getDayAvailabilityState({
    consultationsRaw,
    hours,
    getSlotDataForHour,
    date,
  });
  const isToday = isDateToday(date);
  const hasOpenSlots = isAvailable && !hasAppt;
  const isUnavailable = !hasAppt && !isAvailable && !outside;

  const statusText = isUnavailable
    ? t("unavailable")
    : `${count} ${count === 1 ? t("consultation") : t("consultations")}`;

  const dateLabel = date.toLocaleDateString(language || undefined, {
    day: "2-digit",
    month: "short",
  });

  const className = [
    "schedule-date-card",
    outside && "schedule-date-card--outside",
    hasAppt && "schedule-date-card--has-appt",
    hasOpenSlots && "schedule-date-card--has-slots",
    isUnavailable && "schedule-date-card--unavailable",
    isToday && "schedule-date-card--today",
    selected && !disabled && "schedule-date-card--selected",
    disabled && "schedule-date-card--disabled",
    !interactive && "schedule-date-card--display-only",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="schedule-date-card__weekday">
        {t(WEEKDAY_KEYS_BY_GETDAY[date.getDay()])}
      </span>
      <span className="schedule-date-card__date">{dateLabel}</span>
      <span className="schedule-date-card__status">{statusText}</span>
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
