import { getDateAsFullString } from "@USupport-components-library/src/utils/date";

export const IS_KZ_COUNTRY =
  typeof localStorage !== "undefined" &&
  localStorage.getItem("country") === "KZ";

export function hourRange(hour) {
  const [h] = hour.split(":").map(Number);
  const endHour = String((h + 1) % 24).padStart(2, "0");
  return `${hour}-${endHour}:00`;
}

export function slotRowKey(hour, slot, index, dayPrefix = "") {
  return [
    dayPrefix,
    hour,
    slot.availabilityStatus,
    slot.campaignId || "",
    slot.organizationId || "",
    slot.consultation?.consultationId || "",
    index,
  ]
    .filter(Boolean)
    .join("-");
}

export function cellKeyFor(day, hour) {
  return `${day.getTime()}-${hour}`;
}

export function timeMatchesHour(time, day, hour) {
  if (!day || !time) return false;
  const slotDate = getDateAsFullString(day, hour);
  return new Date(time).getTime() === new Date(slotDate).getTime();
}

export function hourEnrollment(slotsData, day, hour) {
  const campaignIds = new Set(
    (slotsData?.campaignSlots || [])
      .filter((slot) => timeMatchesHour(slot.time, day, hour))
      .map((slot) => slot.campaignId),
  );
  const organizationIds = new Set(
    (slotsData?.organizationSlots || [])
      .filter((slot) => timeMatchesHour(slot.time, day, hour))
      .map((slot) => slot.organizationId),
  );
  const hasNormalSlot = (slotsData?.slots || []).some((slot) =>
    timeMatchesHour(slot, day, hour),
  );

  return { campaignIds, organizationIds, hasNormalSlot };
}

export function computeFloatingPickerPosition(rect) {
  const pickerWidth = 260;
  const pickerHeight = 320;
  const gutter = 12;
  const pad = 16;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const fitsRight = rect.right + gutter + pickerWidth <= viewportW - pad;
  const fitsLeft = rect.left - gutter - pickerWidth >= pad;

  let left = fitsRight
    ? rect.right + gutter
    : fitsLeft
      ? rect.left - pickerWidth - gutter
      : Math.max(pad, Math.min(rect.left, viewportW - pickerWidth - pad));

  let top = rect.top;

  if (top + pickerHeight > viewportH - pad) {
    top = Math.max(pad, rect.bottom - pickerHeight);
  }
  if (top < pad) {
    top = pad;
  }

  if (top + pickerHeight > viewportH - pad) {
    top = Math.max(pad, viewportH - pickerHeight - pad);
  }

  return { top, left };
}

export function getCampaignList(validCampaigns) {
  return IS_KZ_COUNTRY ? [] : validCampaigns || [];
}

export function canPickForSlot(
  slot,
  orgList,
  campaignList,
  countryHasNormalSlots,
) {
  if (!slot) return false;
  if (slot.isPastDay) return false;
  if (slot.consultation) return false;
  return (
    orgList.length > 0 || campaignList.length > 0 || countryHasNormalSlots
  );
}

export function badgeForSlot(slot, campaignList, t) {
  if (!slot) {
    return { label: t("unavailable"), kind: "unavailable" };
  }
  if (slot.consultation) {
    return {
      label: slot.consultation.clientName || t("booked"),
      kind: "booked",
    };
  }
  if (slot.availabilityStatus === "organization") {
    return {
      label: slot.organizationForSlot?.name || t("slot_available"),
      kind: "organization",
    };
  }
  if (slot.availabilityStatus === "campaign") {
    const campaign =
      campaignList.find((item) => item.campaignId === slot.campaignId) ||
      slot.campaignSlots?.[0]?.campaignData;
    return {
      label: campaign?.campaignName || t("slot_available"),
      kind: "campaign",
    };
  }
  if (slot.availabilityStatus === "available") {
    return { label: t("slot_available"), kind: "available" };
  }
  return { label: t("unavailable"), kind: "unavailable" };
}

export function createSlotActions({
  day,
  slotsData,
  handleSetAvailable,
  handleSetUnavailable,
}) {
  return {
    handleSelectOrganization: (hour, organizationId) => {
      const { organizationIds } = hourEnrollment(slotsData, day, hour);
      if (organizationIds.has(organizationId)) {
        handleSetUnavailable(day, hour, undefined, organizationId);
        return;
      }
      handleSetAvailable(day, hour, undefined, organizationId);
    },
    handleSelectCampaign: (hour, campaignId) => {
      const { campaignIds } = hourEnrollment(slotsData, day, hour);
      if (campaignIds.has(campaignId)) {
        handleSetUnavailable(day, hour, campaignId, undefined);
        return;
      }
      handleSetAvailable(day, hour, campaignId, undefined);
    },
    handleSelectNormal: (hour) => {
      const { hasNormalSlot } = hourEnrollment(slotsData, day, hour);
      if (hasNormalSlot) {
        handleSetUnavailable(day, hour, undefined, undefined);
        return;
      }
      handleSetAvailable(day, hour, undefined, undefined);
    },
  };
}
