import React from "react";

import {
  ScheduleOverviewDayCell,
  ScheduleOverviewWeekdayStrip,
  isSameCalendarDay,
} from "./ScheduleOverviewDayCells.jsx";

/**
 * Mon–Sun row styled like the month overview grid.
 * Used as the day-view date navigator: every day is selectable.
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
  showUnavailableStatus = false,
  t,
}) => {
  return (
    <div className="schedule-overview-month schedule-overview-month--week">
      <ScheduleOverviewWeekdayStrip t={t} />
      <div className="schedule-overview-month__grid schedule-overview-month__grid--week">
        {days.map((date) => {
          const selected = selectedDay
            ? isSameCalendarDay(date, selectedDay)
            : false;

          return (
            <ScheduleOverviewDayCell
              key={date.toISOString()}
              date={date}
              selected={selected}
              consultationsRaw={consultationsRaw}
              hours={hours}
              getSlotDataForHour={getSlotDataForHour}
              showUnavailableStatus={showUnavailableStatus}
              onClick={() => {
                onSelectDay?.(date);
                if (openSlotsOnSelect) {
                  onOpenDaySlots?.(date);
                }
              }}
              t={t}
            />
          );
        })}
      </div>
    </div>
  );
};
