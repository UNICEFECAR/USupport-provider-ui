import React from "react";

import { isPastDateWithoutAppointment } from "./scheduleOverviewCalendarShared.js";
import { ScheduleDateCard } from "./ScheduleDateCard.jsx";

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
    });
  }

  for (let d = 1; d <= lastDay; d += 1) {
    cells.push({
      type: "day",
      key: `day-${d}`,
      date: new Date(y, m, d),
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
    });
  }

  return cells;
}

/**
 * Month grid used on the combined schedule page: date + consultation status
 * per cell, styled and sized identically to the day and week grids (all
 * three share ScheduleDateCard).
 */
export const ScheduleOverviewMonthCalendar = ({
  monthViewDate,
  monthSelectedDay,
  onSelectDay,
  onOpenDaySlots,
  consultationsRaw,
  hours,
  getSlotDataForHour,
  language,
  t,
}) => {
  const cells = overviewMonthGrid(monthViewDate);

  return (
    <div className="schedule-date-grid">
      {cells.map((cell) => {
        const { date } = cell;
        const outside = cell.type === "outside";
        const selected =
          date.getFullYear() === monthSelectedDay.getFullYear() &&
          date.getMonth() === monthSelectedDay.getMonth() &&
          date.getDate() === monthSelectedDay.getDate();
        const isDisabled = isPastDateWithoutAppointment(
          date,
          consultationsRaw,
        );

        return (
          <ScheduleDateCard
            key={cell.key}
            date={date}
            selected={selected}
            disabled={isDisabled}
            outside={outside}
            consultationsRaw={consultationsRaw}
            hours={hours}
            getSlotDataForHour={getSlotDataForHour}
            language={language}
            onClick={() => {
              if (isDisabled) return;
              onSelectDay(date);
              onOpenDaySlots?.(date);
            }}
            t={t}
          />
        );
      })}
    </div>
  );
};
