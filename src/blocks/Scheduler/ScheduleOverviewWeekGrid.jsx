import React from "react";

import { ScheduleDaySlotFloatingPicker } from "./ScheduleDaySlotFloatingPicker.jsx";
import { ScheduleDateCard } from "./ScheduleDateCard.jsx";
import {
  badgeForSlot,
  canPickForSlot,
  cellKeyFor,
  createSlotActions,
  getCampaignList,
  hourEnrollment,
  slotRange,
  gridStepMinutes,
  hourGridTimes,
  halvesForHour,
  slotRowKey,
} from "./scheduleDaySlotsShared.js";
import { useFloatingSlotPicker } from "./useFloatingSlotPicker.js";

/**
 * Week grid: Mon–Sun columns × hour rows, each slot as overview card row.
 */
export const ScheduleOverviewWeekGrid = ({
  days,
  gridTimes,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  slotsData,
  organizations,
  validCampaigns,
  countryHasNormalSlots,
  consultationsRaw = [],
  language,
  t,
}) => {
  const { activeKey, meta, position, isOpen, open, close } =
    useFloatingSlotPicker();
  const orgList = organizations || [];
  const campaignList = getCampaignList(validCampaigns);
  const step = gridStepMinutes(gridTimes);
  // One row per hour; the halves live inside the cell.
  const hourRows = hourGridTimes(gridTimes);

  const openCellPicker = (
    event,
    cellKey,
    day,
    hour,
    interactive,
    quickToggleOnly,
    slotActions,
    durationMinutes,
  ) => {
    if (!interactive) return;
    if (quickToggleOnly) {
      slotActions.handleSelectNormal(hour, durationMinutes);
      return;
    }
    open(cellKey, event.currentTarget, { day, hour, durationMinutes });
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
        <div className="schedule-date-grid">
          {days.map((date) => (
            <ScheduleDateCard
              key={`header-${date.getTime()}`}
              date={date}
              interactive={false}
              consultationsRaw={consultationsRaw}
              gridTimes={gridTimes}
              getSlotDataForHour={getSlotDataForHour}
              language={language}
              t={t}
            />
          ))}
        </div>
      </div>

      <div className="schedule-overview-week-grid__body">
        {hourRows.map((hour) => (
          <div key={hour} className="schedule-overview-week-grid__row">
            <div className="schedule-overview-week-grid__hour-label">
              {hour}
            </div>
            {days.map((day) => {
              const cellKey = cellKeyFor(day, hour);
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

              const renderRegion = (time, durationMinutes, extraClass) => {
                const slots = getSlotDataForHour(time, day) || [];
                const regionKey = `${cellKey}-${time}-${durationMinutes}`;
                const isActive = activeKey === regionKey;

                return (
                  <div key={regionKey} className={extraClass}>
                    {slots.map((slot, index) => {
                      const rowKey = slotRowKey(
                        time,
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
                              regionKey,
                              day,
                              time,
                              interactive,
                              quickToggleOnly,
                              slotActions,
                              durationMinutes,
                            )
                          }
                        >
                          <span className="schedule-day-slots__time schedule-day-slots__time--compact">
                            {slot?.isContinuation
                              ? ""
                              : slotRange(
                                  time,
                                  slot?.durationMinutes,
                                  durationMinutes,
                                )}
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
              };

              const halves = halvesForHour(hour, step);
              const firstHalf = (getSlotDataForHour(halves[0], day) || [])[0];
              const secondHalf =
                halves.length > 1
                  ? (getSlotDataForHour(halves[1], day) || [])[0]
                  : null;

              // An hour already held by one 60-minute block stays a single box -
              // there are no halves to show.
              const isWholeHourBlock =
                !secondHalf ||
                firstHalf?.durationMinutes === 60 ||
                secondHalf?.isContinuation;

              if (isWholeHourBlock) {
                return (
                  <div
                    key={cellKey}
                    className="schedule-overview-week-grid__cell"
                  >
                    {renderRegion(halves[0], 60, "schedule-hour-cell__whole")}
                  </div>
                );
              }

              // One box per hour holding both halves. The provider opens
              // half-hour slots; a client who wants an hour books two adjacent
              // ones, which the booking side assembles.
              return (
                <div
                  key={cellKey}
                  className="schedule-overview-week-grid__cell schedule-hour-cell"
                >
                  {halves.map((time) =>
                    renderRegion(time, step, "schedule-hour-cell__half"),
                  )}
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
        durationMinutes={meta?.durationMinutes}
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
