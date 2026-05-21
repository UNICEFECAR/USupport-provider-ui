import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@USupport-components-library/src";
import { isDateToday } from "@USupport-components-library/src/utils/date";

import { calendarMonthGrid } from "./schedulerUtils.js";

const WEEKDAY_ORDER_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const DayGridPicker = ({
  viewMonth,
  selectedDate,
  weekDays,
  highlightWeek,
  onSelectDate,
  t,
}) => {
  const cells = calendarMonthGrid(viewMonth);
  const isInSelectedWeek = (date) =>
    weekDays.some((day) => isSameDay(day, date));

  return (
    <>
      <div className="scheduler-date-picker__weekdays">
        {WEEKDAY_ORDER_KEYS.map((key) => (
          <span key={key} className="scheduler-date-picker__weekday">
            {t(key)}
          </span>
        ))}
      </div>

      <div className="scheduler-date-picker__grid">
        {cells.map((cell) => {
          if (cell.type === "pad") {
            return (
              <div
                key={cell.key}
                className="scheduler-date-picker__pad"
                aria-hidden="true"
              />
            );
          }

          const { date } = cell;
          const isSelected = isSameDay(date, selectedDate);
          const isWeekDay =
            highlightWeek && weekDays.length > 0 && isInSelectedWeek(date);
          const isToday = isDateToday(date);

          return (
            <button
              key={cell.key}
              type="button"
              className={[
                "scheduler-date-picker__day",
                isSelected ? "scheduler-date-picker__day--selected" : "",
                isWeekDay && !isSelected
                  ? "scheduler-date-picker__day--in-week"
                  : "",
                isToday ? "scheduler-date-picker__day--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDate(date)}
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>
    </>
  );
};

const MonthGridPicker = ({
  viewYear,
  selectedMonthDate,
  onSelectMonth,
  language,
}) => {
  const today = new Date();
  const selectedMonth = selectedMonthDate.getMonth();
  const selectedYear = selectedMonthDate.getFullYear();

  return (
    <div className="scheduler-date-picker__months">
      {Array.from({ length: 12 }, (_, index) => {
        const isSelected =
          selectedYear === viewYear && selectedMonth === index;
        const isCurrentMonth =
          today.getFullYear() === viewYear && today.getMonth() === index;

        const monthLabel = new Date(viewYear, index, 1).toLocaleDateString(
          language,
          { month: "short" }
        );

        return (
          <button
            key={index}
            type="button"
            className={[
              "scheduler-date-picker__month",
              isSelected ? "scheduler-date-picker__month--selected" : "",
              isCurrentMonth && !isSelected
                ? "scheduler-date-picker__month--current"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectMonth(index)}
            aria-label={new Date(viewYear, index, 1).toLocaleDateString(
              language,
              { month: "long" }
            )}
          >
            {monthLabel}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Clickable date label with a popover calendar that adapts to Day / Week / Month tabs.
 */
export const SchedulerDatePicker = ({
  dateLabel,
  selectedPeriod,
  selectedDate,
  monthViewDate,
  weekDays = [],
  onDateSelect,
  onMonthSelect,
  t,
  language,
}) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const [viewYear, setViewYear] = useState(() =>
    (monthViewDate || selectedDate).getFullYear()
  );

  const isMonthView = selectedPeriod === "month";
  const isWeekView = selectedPeriod === "week";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (isMonthView) {
      setViewYear((monthViewDate || selectedDate).getFullYear());
    } else {
      setViewMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  }, [isOpen, selectedDate, monthViewDate, isMonthView]);

  const handleToggle = () => {
    setIsOpen((open) => !open);
  };

  const handleNavigate = (direction) => {
    if (isMonthView) {
      setViewYear((year) => year + direction);
      return;
    }

    setViewMonth((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const handleSelectDate = (date) => {
    onDateSelect(date);
    setIsOpen(false);
  };

  const handleSelectMonth = (monthIndex) => {
    onMonthSelect(new Date(viewYear, monthIndex, 1));
    setIsOpen(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    if (isMonthView) {
      onMonthSelect(new Date(today.getFullYear(), today.getMonth(), 1));
    } else {
      onDateSelect(
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
      );
    }
    setIsOpen(false);
  };

  const headerLabel = isMonthView
    ? String(viewYear)
    : viewMonth.toLocaleDateString(language, {
        month: "long",
        year: "numeric",
      });

  return (
    <div className="scheduler-date-picker" ref={containerRef}>
      <button
        type="button"
        className="scheduler-date-picker__trigger"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={dateLabel}
      >
        <span className="scheduler-date-picker__label">{dateLabel}</span>
        <Icon
          name="calendar"
          size="sm"
          color="#6a4ffb"
          classes="scheduler-date-picker__icon"
        />
      </button>

      {isOpen && (
        <div
          className={[
            "scheduler-date-picker__popover",
            isMonthView ? "scheduler-date-picker__popover--month" : "",
            isWeekView ? "scheduler-date-picker__popover--week" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="dialog"
          aria-label={dateLabel}
        >
          <div className="scheduler-date-picker__header">
            <button
              type="button"
              className="scheduler-date-picker__nav-btn"
              onClick={() => handleNavigate(-1)}
              aria-label={isMonthView ? "Previous year" : "Previous month"}
            >
              <Icon color="#6989A4" name="arrow-chevron-back" size="sm" />
            </button>
            <p className="scheduler-date-picker__month">{headerLabel}</p>
            <button
              type="button"
              className="scheduler-date-picker__nav-btn"
              onClick={() => handleNavigate(1)}
              aria-label={isMonthView ? "Next year" : "Next month"}
            >
              <Icon color="#6989A4" name="arrow-chevron-forward" size="sm" />
            </button>
          </div>

          {isMonthView ? (
            <MonthGridPicker
              viewYear={viewYear}
              selectedMonthDate={monthViewDate || selectedDate}
              onSelectMonth={handleSelectMonth}
              language={language}
            />
          ) : (
            <DayGridPicker
              viewMonth={viewMonth}
              selectedDate={selectedDate}
              weekDays={weekDays}
              highlightWeek={isWeekView}
              onSelectDate={handleSelectDate}
              t={t}
            />
          )}

          <button
            type="button"
            className="scheduler-date-picker__today-btn"
            onClick={handleGoToToday}
          >
            {t("today")}
          </button>
        </div>
      )}
    </div>
  );
};
