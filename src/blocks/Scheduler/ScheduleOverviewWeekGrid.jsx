import React from "react";

import { ScheduleDaySlotFloatingPicker } from "./ScheduleDaySlotFloatingPicker.jsx";
import {
  ScheduleOverviewDayCell,
  ScheduleOverviewWeekdayStrip,
} from "./ScheduleOverviewDayCells.jsx";
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
  consultationsRaw = [],
  t,
}) => {
  const { activeKey, meta, position, isOpen, open, close } =
    useFloatingSlotPicker();
  const orgList = organizations || [];
  const campaignList = getCampaignList(validCampaigns);

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
      <div className="schedule-overview-week-grid__date-header">
        <div
          className="schedule-overview-week-grid__hour-spacer"
          aria-hidden="true"
        />
        <div className="schedule-overview-month schedule-overview-month--week schedule-overview-month--week-grid">
          <ScheduleOverviewWeekdayStrip t={t} />
          <div className="schedule-overview-month__grid schedule-overview-month__grid--week">
            {days.map((date) => (
              <ScheduleOverviewDayCell
                key={`header-${date.getTime()}`}
                date={date}
                interactive={false}
                consultationsRaw={consultationsRaw}
                hours={hours}
                getSlotDataForHour={getSlotDataForHour}
                showUnavailableStatus={false}
                t={t}
              />
            ))}
          </div>
        </div>
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
                          !interactive
                            ? "schedule-day-slots__row--disabled"
                            : "",
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
