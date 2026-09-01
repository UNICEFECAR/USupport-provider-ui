import React from "react";

import {
  ScheduleOverviewDayCell,
  ScheduleOverviewWeekdayStrip,
  isPastDateWithoutAppointment,
} from "./ScheduleOverviewDayCells.jsx";

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
  showUnavailableStatus = true,
  t,
}) => {
  const cells = overviewMonthGrid(monthViewDate);

  return (
    <div className="schedule-overview-month">
      <ScheduleOverviewWeekdayStrip t={t} />
      <div className="schedule-overview-month__grid">
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
            <ScheduleOverviewDayCell
              key={cell.key}
              date={date}
              dayNumber={cell.dayNumber}
              selected={selected}
              disabled={isDisabled}
              outside={outside}
              consultationsRaw={consultationsRaw}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              showUnavailableStatus={showUnavailableStatus}
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
    </div>
  );
};
