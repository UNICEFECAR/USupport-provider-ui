import React from "react";

const WEEKDAY_ORDER_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Mon–Sun row styled like the month overview grid.
 */
export const ScheduleOverviewWeekCalendar = ({
  days,
  selectedDay,
  onSelectDay,
  openSlotsOnSelect = false,
  onOpenDaySlots,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  t,
}) => {
  const consultationCountOnDay = (date) =>
    consultationsRaw.filter((c) => {
      const d = new Date(c.time);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    }).length;

  const hasOpenSlotOnDay = (date) =>
    hours.some((hour) => {
      const rows = getSlotDataForHour(hour, date);
      return rows.some(
        (row) =>
          !row.consultation &&
          row.availabilityStatus !== "unavailable" &&
          !row.isPastDay,
      );
    });

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isTodayDate = (date) => isSameDay(date, today);
  const isPastDate = (date) => date < startOfToday;

  return (
    <div className="schedule-overview-month schedule-overview-month--week">
      <div className="schedule-overview-month__weekdays">
        {WEEKDAY_ORDER_KEYS.map((key) => (
          <span
            key={key}
            className="schedule-overview-month__weekday"
            title={t(key)}
          >
            <span className="schedule-overview-month__weekday-full">
              {t(key)}
            </span>
            <span
              className="schedule-overview-month__weekday-letter"
              aria-hidden="true"
            >
              {t(key).charAt(0)}
            </span>
          </span>
        ))}
      </div>
      <div className="schedule-overview-month__grid schedule-overview-month__grid--week">
        {days.map((date) => {
          const count = consultationCountOnDay(date);
          const isAvailable = count > 0 || hasOpenSlotOnDay(date);
          const selected = selectedDay ? isSameDay(date, selectedDay) : false;
          const hasAppt = count > 0;
          const isDisabled = isPastDate(date) && !hasAppt;

          const statusLabel = hasAppt
            ? `${count} ${count === 1 ? t("consultation") : t("consultations")}`
            : isAvailable
              ? `0 ${t("consultations")}`
              : t("not_available");
          const statusShort = hasAppt ? String(count) : isAvailable ? "0" : "–";

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              className={[
                "schedule-overview-month__day",
                selected && !isDisabled
                  ? "schedule-overview-month__day--selected"
                  : "",
                hasAppt ? "schedule-overview-month__day--has-appt" : "",
                !isAvailable ? "schedule-overview-month__day--unavailable" : "",
                isDisabled ? "schedule-overview-month__day--disabled" : "",
                isTodayDate(date) ? "schedule-overview-month__day--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (isDisabled) return;
                onSelectDay?.(date);
                if (openSlotsOnSelect) {
                  onOpenDaySlots?.(date);
                }
              }}
            >
              <span className="schedule-overview-month__day-num">
                {date.getDate()}
              </span>
              <span className="schedule-overview-month__day-status">
                <span className="schedule-overview-month__day-status-full">
                  {statusLabel}
                </span>
                <span className="schedule-overview-month__day-status-short">
                  {statusShort}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
