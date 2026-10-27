import React from "react";
import { Loading } from "@USupport-components-library/src";

import { ScheduleDaySlotFloatingPicker } from "./ScheduleDaySlotFloatingPicker.jsx";
import {
  badgeForSlot,
  canPickForSlot,
  createSlotActions,
  getCampaignList,
  hourEnrollment,
  slotRange,
  gridStepMinutes,
  hourGridTimes,
  halvesForHour,
  slotRowKey,
  isVisibleOverviewSlot,
} from "./scheduleDaySlotsShared.js";
import { useFloatingSlotPicker } from "./useFloatingSlotPicker.js";

/**
 * Slot list + picker (shared by day modal and inline day view).
 */
export const ScheduleDaySlotsPanel = ({
  day,
  gridTimes,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  slotsData,
  organizations,
  validCampaigns,
  countryHasNormalSlots,
  isLoading,
  hideUnavailableSlots = false,
  closePickerOnScroll = false,
  t,
}) => {
  const {
    activeKey: activeHour,
    position,
    isOpen,
    open,
    close,
  } = useFloatingSlotPicker({ closeOnScroll: closePickerOnScroll });

  const orgList = organizations || [];
  const campaignList = getCampaignList(validCampaigns);
  const slotActions = createSlotActions({
    day,
    slotsData,
    handleSetAvailable,
    handleSetUnavailable,
  });

  const slotsForHour = (hour) => (day ? getSlotDataForHour(hour, day) : []);
  const step = gridStepMinutes(gridTimes);
  // One row per hour; each row splits into the full hour and its halves.
  const hourRows = hourGridTimes(gridTimes);

  // activeKey is "HH:MM-<duration>" so the two regions of an hour stay distinct.
  const activeTime = activeHour ? String(activeHour).split("-")[0] : null;
  const enrollment = activeTime
    ? hourEnrollment(slotsData, day, activeTime)
    : null;

  const [pickerDuration, setPickerDuration] = React.useState(null);

  const openHourPicker = (event, hour, interactive, durationMinutes) => {
    if (!interactive) return;
    if (
      orgList.length === 0 &&
      campaignList.length === 0 &&
      countryHasNormalSlots
    ) {
      slotActions.handleSelectNormal(hour, durationMinutes);
      return;
    }
    setPickerDuration(durationMinutes);
    open(`${hour}-${durationMinutes}`, event.currentTarget);
  };

  if (isLoading || !day) {
    return <Loading size="md" />;
  }

  return (
    <div className="schedule-day-slots">
      <ul className="schedule-day-slots__list">
        {hourRows.flatMap((hour) => {
          const renderRegion = (time, durationMinutes, extraClass) => {
            const slots = slotsForHour(time).filter((slot) =>
              isVisibleOverviewSlot(slot, hideUnavailableSlots),
            );
            if (!slots.length) return null;

            return (
              <div key={`${time}-${durationMinutes}`} className={extraClass}>
                {slots.map((slot, index) => {
                  const rowKey = slotRowKey(time, slot, index);
                  const badge = badgeForSlot(slot, campaignList, t);
                  const selected = activeHour === `${time}-${durationMinutes}`;
                  const interactive = canPickForSlot(
                    slot,
                    orgList,
                    campaignList,
                    countryHasNormalSlots,
                  );

                  return (
                    <button
                      key={rowKey}
                      type="button"
                      className={[
                        "schedule-day-slots__row",
                        `schedule-day-slots__row--${badge.kind}`,
                        selected && interactive
                          ? "schedule-day-slots__row--selected"
                          : "",
                        !interactive ? "schedule-day-slots__row--disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={!interactive}
                      onClick={(event) =>
                        openHourPicker(
                          event,
                          time,
                          interactive,
                          durationMinutes,
                        )
                      }
                    >
                      <span className="schedule-day-slots__time">
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
          const firstHalf = slotsForHour(halves[0])[0];
          const secondHalf =
            halves.length > 1 ? slotsForHour(halves[1])[0] : null;

          // A whole hour already taken by one block has nothing left to split.
          const isWholeHourBlock =
            !secondHalf ||
            firstHalf?.durationMinutes === 60 ||
            secondHalf?.isContinuation;

          if (isWholeHourBlock) {
            const region = renderRegion(
              halves[0],
              60,
              "schedule-hour-cell__whole",
            );
            return region ? [<li key={hour}>{region}</li>] : [];
          }

          // One box per hour holding both halves.
          const halfRegions = halves
            .map((time) => renderRegion(time, step, "schedule-hour-cell__half"))
            .filter(Boolean);

          if (!halfRegions.length) return [];

          return [
            <li key={hour} className="schedule-hour-cell">
              {halfRegions}
            </li>,
          ];
        })}
      </ul>

      <ScheduleDaySlotFloatingPicker
        isOpen={isOpen}
        position={position}
        onClose={close}
        hour={activeTime}
        durationMinutes={pickerDuration}
        enrollment={enrollment}
        orgList={orgList}
        campaignList={campaignList}
        countryHasNormalSlots={countryHasNormalSlots}
        onSelectOrganization={slotActions.handleSelectOrganization}
        onSelectCampaign={slotActions.handleSelectCampaign}
        onSelectNormal={slotActions.handleSelectNormal}
        t={t}
      />
    </div>
  );
};
