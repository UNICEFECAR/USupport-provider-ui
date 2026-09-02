import React from "react";

import { isSameCalendarDay } from "./scheduleOverviewCalendarShared.js";
import { ScheduleDateCard } from "./ScheduleDateCard.jsx";

/**
 * Mon–Sun row of date cards, styled and sized identically to the week and
 * month grids (all three share ScheduleDateCard).
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
  language,
  t,
}) => {
  return (
    <div className="schedule-date-grid">
      {days.map((date) => {
        const selected = selectedDay
          ? isSameCalendarDay(date, selectedDay)
          : false;

        return (
          <ScheduleDateCard
            key={date.toISOString()}
            date={date}
            selected={selected}
            consultationsRaw={consultationsRaw}
            hours={hours}
            getSlotDataForHour={getSlotDataForHour}
            language={language}
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
  );
};
