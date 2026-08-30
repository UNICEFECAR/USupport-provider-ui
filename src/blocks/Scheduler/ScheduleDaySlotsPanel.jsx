import React from "react";
import { Loading } from "@USupport-components-library/src";

import { ScheduleDaySlotFloatingPicker } from "./ScheduleDaySlotFloatingPicker.jsx";
import {
  badgeForSlot,
  canPickForSlot,
  createSlotActions,
  getCampaignList,
  hourEnrollment,
  hourRange,
  slotRowKey,
} from "./scheduleDaySlotsShared.js";
import { useFloatingSlotPicker } from "./useFloatingSlotPicker.js";

/**
 * Slot list + picker (shared by day modal and inline day view).
 */
export const ScheduleDaySlotsPanel = ({
  day,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  slotsData,
  organizations,
  validCampaigns,
  countryHasNormalSlots,
  isLoading,
  t,
}) => {
  const { activeKey: activeHour, position, isOpen, open, close } =
    useFloatingSlotPicker();

  const orgList = organizations || [];
  const campaignList = getCampaignList(validCampaigns);
  const slotActions = createSlotActions({
    day,
    slotsData,
    handleSetAvailable,
    handleSetUnavailable,
  });

  const slotsForHour = (hour) => (day ? getSlotDataForHour(hour, day) : []);

  const enrollment = activeHour
    ? hourEnrollment(slotsData, day, activeHour)
    : null;

  const openHourPicker = (event, hour, interactive) => {
    if (!interactive) return;
    if (
      orgList.length === 0 &&
      campaignList.length === 0 &&
      countryHasNormalSlots
    ) {
      slotActions.handleSelectNormal(hour);
      return;
    }
    open(hour, event.currentTarget);
  };

  if (isLoading || !day) {
    return <Loading size="md" />;
  }

  return (
    <div className="schedule-day-slots">
      <ul className="schedule-day-slots__list">
        {hours.flatMap((hour) => {
          const slots = slotsForHour(hour);
          if (!slots?.length) return [];

          return slots.map((slot, index) => {
            const rowKey = slotRowKey(hour, slot, index);
            const badge = badgeForSlot(slot, campaignList, t);
            const selected = activeHour === hour;
            const interactive = canPickForSlot(
              slot,
              orgList,
              campaignList,
              countryHasNormalSlots,
            );

            return (
              <li key={rowKey}>
                <button
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
                  onClick={(event) => openHourPicker(event, hour, interactive)}
                >
                  <span className="schedule-day-slots__time">
                    {hourRange(hour)}
                  </span>
                  <span
                    className={`schedule-day-slots__badge schedule-day-slots__badge--${badge.kind}`}
                  >
                    {badge.label}
                  </span>
                </button>
              </li>
            );
          });
        })}
      </ul>

      <ScheduleDaySlotFloatingPicker
        isOpen={isOpen}
        position={position}
        onClose={close}
        hour={activeHour}
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
