export const WEEKDAY_ORDER_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function isSameCalendarDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function consultationCountOnDay(consultationsRaw, date) {
  return consultationsRaw.filter((c) => {
    const d = new Date(c.time);
    return isSameCalendarDay(d, date);
  }).length;
}

export function hasOpenSlotOnDay(hours, getSlotDataForHour, date) {
  return hours.some((hour) => {
    const rows = getSlotDataForHour(hour, date);
    return rows.some(
      (row) =>
        !row.consultation &&
        row.availabilityStatus !== "unavailable" &&
        !row.isPastDay,
    );
  });
}

export function getDayAvailabilityState({
  consultationsRaw,
  hours,
  getSlotDataForHour,
  date,
}) {
  const count = consultationCountOnDay(consultationsRaw, date);
  const hasAppt = count > 0;
  const isAvailable = hasAppt || hasOpenSlotOnDay(hours, getSlotDataForHour, date);

  return { count, hasAppt, isAvailable };
}

export function getDayStatusLabels({
  hasAppt,
  isAvailable,
  count,
  t,
  showUnavailableStatus,
}) {
  if (hasAppt) {
    return {
      statusLabel: `${count} ${
        count === 1 ? t("consultation") : t("consultations")
      }`,
      statusShort: String(count),
    };
  }

  if (isAvailable) {
    return {
      statusLabel: `0 ${t("consultations")}`,
      statusShort: "0",
    };
  }

  if (showUnavailableStatus) {
    return {
      statusLabel: t("not_available"),
      statusShort: "–",
    };
  }

  return {
    statusLabel: "",
    statusShort: "",
  };
}

export function isPastDateWithoutAppointment(date, consultationsRaw) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const hasAppt = consultationCountOnDay(consultationsRaw, date) > 0;
  return date < startOfToday && !hasAppt;
}
