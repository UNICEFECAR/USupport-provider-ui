import { getDateAsFullString } from "@USupport-components-library/src/utils/date";

export const IS_KZ_COUNTRY =
  typeof localStorage !== "undefined" &&
  localStorage.getItem("country") === "KZ";

/**
 * Minutes between two grid rows - 30 on the half-hour grid, 60 on the hourly one.
 *
 * @param {string[]} times the grid's time labels
 */
export function gridStepMinutes(times) {
  if (!times || times.length < 2) return 60;
  const toMinutes = (value) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  return toMinutes(times[1]) - toMinutes(times[0]);
}

/**
 * The 24 whole-hour labels of a grid, whatever step the grid itself uses.
 *
 * The availability views render one row per hour and split the row into halves,
 * rather than one row per half hour: an hour and its two halves are the same
 * piece of time, so they belong in one cell.
 *
 * @param {string[]} times
 * @returns {string[]}
 */
export function hourGridTimes(times) {
  return (times || []).filter((time) => time.endsWith(":00"));
}

/**
 * The bookable start times inside one hour, ascending.
 *
 * `["05:00", "05:30"]` on the half-hour grid, `["05:00"]` on the hourly one.
 *
 * @param {string} hour "HH:00"
 * @param {number} stepMinutes
 * @returns {string[]}
 */
export function halvesForHour(hour, stepMinutes) {
  const [h] = hour.split(":").map(Number);
  const step = Number(stepMinutes) || 60;
  const times = [];
  for (let m = 0; m < 60; m += step) {
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return times;
}

/**
 * "16:00-16:30" for a slot starting at `time` and lasting `durationMinutes`.
 *
 * Computed on real minutes rather than by adding one to the hour, so 23:30 + 60
 * reads "00:00" and not "24:00".
 *
 * @param {string} time "HH:MM"
 * @param {number} [durationMinutes] defaults to the legacy hour
 */
export function slotRange(time, durationMinutes, fallbackMinutes = 60) {
  const [h, m] = time.split(":").map(Number);
  // An empty cell has no slot and so no length of its own; it is one row of the
  // grid. Falling back to an hour made every unavailable cell on the half-hour
  // grid read "01:00-02:00" and promise a booking it would not create.
  const minutes = Number(durationMinutes) || Number(fallbackMinutes) || 60;
  const endTotal = (h * 60 + m + minutes) % (24 * 60);
  const endH = String(Math.floor(endTotal / 60)).padStart(2, "0");
  const endM = String(endTotal % 60).padStart(2, "0");
  return `${time}-${endH}:${endM}`;
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
  if (slot.isContinuation) return false;
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
  if (slot.isContinuation) {
    return { label: "", kind: "continuation" };
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

export function isVisibleOverviewSlot(slot, hideUnavailableSlots) {
  if (!hideUnavailableSlots) return true;
  if (slot?.consultation) return true;
  // Hiding the unavailable cells must also hide continuation halves, otherwise
  // the back half of a 60-minute block is left stranded on its own.
  if (slot?.isContinuation) return false;
  return slot?.availabilityStatus !== "unavailable";
}

/**
 * Cells that count as one bookable slot. A continuation is the tail of a block
 * that was already counted at its start.
 */
export function isCountableSlot(slot) {
  return !!slot && !slot.isContinuation;
}

export function createSlotActions({
  day,
  slotsData,
  handleSetAvailable,
  handleSetUnavailable,
}) {
  // `durationMinutes` is decided by which region of the hour cell was clicked -
  // the full-hour block or one of its halves - and is carried through to the
  // write so the slot that gets created is the one the provider pointed at.
  return {
    handleSelectOrganization: (hour, organizationId, durationMinutes) => {
      const { organizationIds } = hourEnrollment(slotsData, day, hour);
      if (organizationIds.has(organizationId)) {
        handleSetUnavailable(day, hour, undefined, organizationId);
        return;
      }
      handleSetAvailable(day, hour, undefined, organizationId, durationMinutes);
    },
    handleSelectCampaign: (hour, campaignId, durationMinutes) => {
      const { campaignIds } = hourEnrollment(slotsData, day, hour);
      if (campaignIds.has(campaignId)) {
        handleSetUnavailable(day, hour, campaignId, undefined);
        return;
      }
      handleSetAvailable(day, hour, campaignId, undefined, durationMinutes);
    },
    handleSelectNormal: (hour, durationMinutes) => {
      const { hasNormalSlot } = hourEnrollment(slotsData, day, hour);
      if (hasNormalSlot) {
        handleSetUnavailable(day, hour, undefined, undefined);
        return;
      }
      handleSetAvailable(day, hour, undefined, undefined, durationMinutes);
    },
  };
}
