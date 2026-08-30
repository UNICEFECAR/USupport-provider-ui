import React, { useMemo } from "react";
import { Modal } from "@USupport-components-library/src";

import { ScheduleDaySlotsPanel } from "./ScheduleDaySlotsPanel.jsx";

export const ScheduleDaySlotsModal = ({
  isOpen,
  day,
  onClose,
  hours,
  getSlotDataForHour,
  handleSetAvailable,
  handleSetUnavailable,
  slotsData,
  organizations,
  validCampaigns,
  countryHasNormalSlots,
  language,
  isLoading,
  t,
}) => {
  const heading = useMemo(() => {
    if (!day) return "";
    return day.toLocaleDateString(language, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [day, language]);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      heading={heading}
      classes="schedule-day-slots-modal"
    >
      <ScheduleDaySlotsPanel
        day={day}
        hours={hours}
        getSlotDataForHour={getSlotDataForHour}
        handleSetAvailable={handleSetAvailable}
        handleSetUnavailable={handleSetUnavailable}
        slotsData={slotsData}
        organizations={organizations}
        validCampaigns={validCampaigns}
        countryHasNormalSlots={countryHasNormalSlots}
        isLoading={isLoading}
        t={t}
      />
    </Modal>
  );
};
