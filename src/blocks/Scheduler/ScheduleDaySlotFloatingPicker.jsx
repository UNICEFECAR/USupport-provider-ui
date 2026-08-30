import React from "react";
import { createPortal } from "react-dom";
import OutsideClickHandler from "react-outside-click-handler";

import { ScheduleDaySlotPicker } from "./ScheduleDaySlotPicker.jsx";

export const ScheduleDaySlotFloatingPicker = ({
  isOpen,
  position,
  onClose,
  hour,
  enrollment,
  orgList,
  campaignList,
  countryHasNormalSlots,
  onSelectOrganization,
  onSelectCampaign,
  onSelectNormal,
  t,
}) => {
  if (!isOpen || !position) return null;

  return createPortal(
    <OutsideClickHandler onOutsideClick={onClose}>
      <ScheduleDaySlotPicker
        className="schedule-day-slots__picker schedule-day-slots__picker--floating"
        style={{ top: position.top, left: position.left }}
        hour={hour}
        enrollment={enrollment}
        orgList={orgList}
        campaignList={campaignList}
        countryHasNormalSlots={countryHasNormalSlots}
        onSelectOrganization={onSelectOrganization}
        onSelectCampaign={onSelectCampaign}
        onSelectNormal={onSelectNormal}
        t={t}
      />
    </OutsideClickHandler>,
    document.body,
  );
};
