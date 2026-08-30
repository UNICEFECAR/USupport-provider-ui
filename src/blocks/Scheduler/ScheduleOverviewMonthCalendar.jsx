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

function overviewMonthGrid(monthAnchor) {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const first = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0).getDate();
  const mondayIndexed = (first.getDay() + 6) % 7;
  const cells = [];

  for (let i = mondayIndexed; i > 0; i -= 1) {
    const date = new Date(y, m, 1 - i);
    cells.push({
      type: "outside",
      key: `pre-${date.toISOString()}`,
      date,
      dayNumber: date.getDate(),
    });
  }

  for (let d = 1; d <= lastDay; d += 1) {
    cells.push({
      type: "day",
      key: `day-${d}`,
      date: new Date(y, m, d),
      dayNumber: d,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
    );
    cells.push({
      type: "outside",
      key: `post-${date.toISOString()}`,
      date,
      dayNumber: date.getDate(),
    });
  }

  return cells;
}

/**
 * Month grid used on the combined schedule page: date + consultation status per cell.
 */
export const ScheduleOverviewMonthCalendar = ({
  monthViewDate,
  monthSelectedDay,
  onSelectDay,
  onOpenDaySlots,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  t,
}) => {
  const cells = overviewMonthGrid(monthViewDate);

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
  const isTodayDate = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const isPastDate = (date) => date < startOfToday;

  return (
    <div className="schedule-overview-month">
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
      <div className="schedule-overview-month__grid">
        {cells.map((cell) => {
          const { date } = cell;
          const count = consultationCountOnDay(date);
          const isAvailable = count > 0 || hasOpenSlotOnDay(date);
          const selected =
            date.getFullYear() === monthSelectedDay.getFullYear() &&
            date.getMonth() === monthSelectedDay.getMonth() &&
            date.getDate() === monthSelectedDay.getDate();
          const outside = cell.type === "outside";
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
              key={cell.key}
              type="button"
              disabled={isDisabled}
              className={[
                "schedule-overview-month__day",
                outside ? "schedule-overview-month__day--outside" : "",
                selected && !isDisabled
                  ? "schedule-overview-month__day--selected"
                  : "",
                hasAppt ? "schedule-overview-month__day--has-appt" : "",
                !isAvailable && !outside
                  ? "schedule-overview-month__day--unavailable"
                  : "",
                isDisabled ? "schedule-overview-month__day--disabled" : "",
                isTodayDate(date) ? "schedule-overview-month__day--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (isDisabled) return;
                onSelectDay(date);
                onOpenDaySlots?.(date);
              }}
            >
              <span className="schedule-overview-month__day-num">
                {cell.dayNumber}
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
