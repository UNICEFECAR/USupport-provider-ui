import {
  getStartAndEndOfWeek,
  parseUTCDate,
} from "@USupport-components-library/src/utils/date";

/**
 * Monday-first week starts that intersect a calendar month (for consultation fetches).
 */
export function getUniqueWeekStartsInMonth(monthAnchor) {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const starts = new Set();

  for (let d = 1; d <= lastDay; d += 1) {
    const { first } = getStartAndEndOfWeek(new Date(y, m, d));
    starts.add(first.getTime());
  }

  return Array.from(starts)
    .sort((a, b) => a - b)
    .map((t) => new Date(t));
}

export function mergeConsultationResponses(lists) {
  const seen = new Set();
  const out = [];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const c of list) {
      const id = c.consultation_id;
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      out.push(c);
    }
  }

  return out;
}

export function calendarMonthGrid(monthAnchor) {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const first = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0).getDate();

  const mondayIndexed = (first.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < mondayIndexed; i += 1) {
    cells.push({ type: "pad", key: `pad-${i}` });
  }

  for (let d = 1; d <= lastDay; d += 1) {
    cells.push({
      type: "day",
      key: `day-${d}`,
      date: new Date(y, m, d),
      dayNumber: d,
    });
  }

  return cells;
}

export function mapSlotDataForDailyComponent(slotData, validCampaigns) {
  let isAvailable;
  if (slotData.availabilityStatus === "campaign") {
    isAvailable = "campaign";
  } else if (slotData.availabilityStatus === "organization") {
    isAvailable = "organization";
  } else if (slotData.availabilityStatus === "available") {
    isAvailable = true;
  } else {
    isAvailable = false;
  }

  let campaignData = null;
  if (slotData.campaignSlots?.length > 0) {
    campaignData = slotData.campaignSlots[0]?.campaignData || null;
  } else if (slotData.campaignId) {
    campaignData =
      validCampaigns?.find((x) => x.campaignId === slotData.campaignId) || null;
  }

  const enrolledCampaignsForSlot =
    slotData.campaignSlots?.length > 0
      ? slotData.campaignSlots
      : slotData.campaignId
      ? [{ campaignId: slotData.campaignId, campaignData }]
      : [];

  return { isAvailable, campaignData, enrolledCampaignsForSlot };
}

/**
 * Maps provider availability API payload into scheduler state (campaigns + slot lists).
 */
export function normalizeAvailabilityResponse(data) {
  if (!data) {
    return { validCampaigns: undefined, slotsState: null };
  }

  const campaigns_data = data.campaigns_data?.map((x) => ({
    campaignId: x.campaign_id,
    campaignName: x.campaign_name,
    couponCode: x.coupon_code,
    campaignStartDate: new Date(x.campaign_start_date),
    campaignEndDate: new Date(x.campaign_end_date),
    sponsorName: x.sponsor_name,
    sponsorImage: x.sponsor_image,
    active: x.active,
  }));

  const today = new Date().getTime();
  const validCampaigns = campaigns_data?.filter(
    (x) => new Date(x.campaignEndDate).getTime() >= today && x.active
  );

  const slotsState = {
    slots: data.slots ?? [],
    organizationSlots: [
      ...(data.organization_slots ?? []).map((x) => ({
        time: parseUTCDate(x.time),
        organizationId: x.organization_id,
      })),
    ],
    campaignSlots: [
      ...(data.campaign_slots ?? []).map((x) => ({
        time: parseUTCDate(x.time),
        campaignId: x.campaign_id,
      })),
    ],
  };

  return { validCampaigns, slotsState };
}
