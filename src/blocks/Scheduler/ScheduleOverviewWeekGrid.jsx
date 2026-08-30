import React, { useMemo } from "react";

import { isDateToday } from "@USupport-components-library/src/utils/date";

import { ScheduleDaySlotFloatingPicker } from "./ScheduleDaySlotFloatingPicker.jsx";
import {
  badgeForSlot,
  canPickForSlot,
  cellKeyFor,
  createSlotActions,
  getCampaignList,
  hourEnrollment,
  hourRange,
  slotRowKey,
} from "./scheduleDaySlotsShared.js";
import { useFloatingSlotPicker } from "./useFloatingSlotPicker.js";

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
 * Week grid: Mon–Sun columns × hour rows, each slot as overview card row.
 */
export const ScheduleOverviewWeekGrid = ({
  days,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  slotsData,
  organizations,
  validCampaigns,
  countryHasNormalSlots,
  t,
}) => {
  const { activeKey, meta, position, isOpen, open, close } =
    useFloatingSlotPicker();
  const orgList = organizations || [];
  const campaignList = getCampaignList(validCampaigns);

  const weekdayLabels = useMemo(() => {
    const map = {};
    days.forEach((day, index) => {
      map[day.getTime()] = WEEKDAY_ORDER_KEYS[index] || WEEKDAY_ORDER_KEYS[0];
    });
    return map;
  }, [days]);

  const openCellPicker = (
    event,
    cellKey,
    day,
    hour,
    interactive,
    quickToggleOnly,
    slotActions,
  ) => {
    if (!interactive) return;
    if (quickToggleOnly) {
      slotActions.handleSelectNormal(hour);
      return;
    }
    open(cellKey, event.currentTarget, { day, hour });
  };

  const activeSlotActions = meta
    ? createSlotActions({
        day: meta.day,
        slotsData,
        handleSetAvailable,
        handleSetUnavailable,
      })
    : null;

  const activeEnrollment = meta
    ? hourEnrollment(slotsData, meta.day, meta.hour)
    : null;

  return (
    <div className="schedule-overview-week-grid">
      <div className="schedule-overview-week-grid__header">
        <div
          className="schedule-overview-week-grid__hour-spacer"
          aria-hidden="true"
        />
        {days.map((day) => {
          const weekdayKey = weekdayLabels[day.getTime()];
          const isToday = isDateToday(day);
          return (
            <div
              key={`header-${day.getTime()}`}
              className={[
                "schedule-overview-week-grid__day-header",
                isToday ? "schedule-overview-week-grid__day-header--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className="schedule-overview-week-grid__day-name"
                title={t(weekdayKey)}
              >
                <span className="schedule-overview-week-grid__day-name-full">
                  {t(weekdayKey)}
                </span>
                <span
                  className="schedule-overview-week-grid__day-name-letter"
                  aria-hidden="true"
                >
                  {t(weekdayKey).charAt(0)}
                </span>
              </span>
              <span className="schedule-overview-week-grid__day-num">
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="schedule-overview-week-grid__body">
        {hours.map((hour) => (
          <div key={hour} className="schedule-overview-week-grid__row">
            <div className="schedule-overview-week-grid__hour-label">
              {hour}
            </div>
            {days.map((day) => {
              const slots = getSlotDataForHour(hour, day) || [];
              const cellKey = cellKeyFor(day, hour);
              const isActive = activeKey === cellKey;
              const slotActions = createSlotActions({
                day,
                slotsData,
                handleSetAvailable,
                handleSetUnavailable,
              });
              const quickToggleOnly =
                orgList.length === 0 &&
                campaignList.length === 0 &&
                countryHasNormalSlots;

              return (
                <div
                  key={cellKey}
                  className="schedule-overview-week-grid__cell"
                >
                  {slots.map((slot, index) => {
                    const rowKey = slotRowKey(
                      hour,
                      slot,
                      index,
                      String(day.getTime()),
                    );
                    const badge = badgeForSlot(slot, campaignList, t);
                    const interactive = canPickForSlot(
                      slot,
                      orgList,
                      campaignList,
                      countryHasNormalSlots,
                    );
                    const selected = isActive && interactive;

                    return (
                      <button
                        key={rowKey}
                        type="button"
                        className={[
                          "schedule-day-slots__row",
                          "schedule-day-slots__row--compact",
                          `schedule-day-slots__row--${badge.kind}`,
                          selected ? "schedule-day-slots__row--selected" : "",
                          !interactive ? "schedule-day-slots__row--disabled" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={!interactive}
                        onClick={(event) =>
                          openCellPicker(
                            event,
                            cellKey,
                            day,
                            hour,
                            interactive,
                            quickToggleOnly,
                            slotActions,
                          )
                        }
                      >
                        <span className="schedule-day-slots__time schedule-day-slots__time--compact">
                          {hourRange(hour)}
                        </span>
                        <span
                          className={`schedule-day-slots__badge schedule-day-slots__badge--${badge.kind}`}
                        >
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ScheduleDaySlotFloatingPicker
        isOpen={isOpen}
        position={position}
        onClose={close}
        hour={meta?.hour}
        enrollment={activeEnrollment}
        orgList={orgList}
        campaignList={campaignList}
        countryHasNormalSlots={countryHasNormalSlots}
        onSelectOrganization={activeSlotActions?.handleSelectOrganization}
        onSelectCampaign={activeSlotActions?.handleSelectCampaign}
        onSelectNormal={activeSlotActions?.handleSelectNormal}
        t={t}
      />
    </div>
  );
};
